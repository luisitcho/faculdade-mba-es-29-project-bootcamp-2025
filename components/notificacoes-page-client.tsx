"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, BellOff, Check, AlertTriangle, Package } from "lucide-react"
import { NotificacoesList } from "@/components/notificacoes-list"
import { useRouter } from "next/navigation"

interface Notificacao {
  id: string
  tipo: string
  titulo: string
  mensagem: string
  lida: boolean
  metadata: any
  created_at: string
  updated_at: string
}

export function NotificacoesPageClient() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMarkingAll, setIsMarkingAll] = useState(false)
  const [produtosZeradosCount, setProdutosZeradosCount] = useState<number>(0) // NOVO: contador real da tabela produtos
  const router = useRouter()
  const supabase = createClient()

  const buscarNotificacoes = async () => {
    try {
      const userRes = await supabase.auth.getUser()
      const user = userRes.data.user
      if (!user) return

      const { data } = await supabase
        .from("notificacoes")
        .select("*")
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false })

      setNotificacoes(data || [])
    } catch (err) {
      console.error("Erro ao buscar notificações:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const buscarProdutosZerados = async () => {
    // Busca diretamente na tabela produtos quantos estão com estoque 0 e ativos
    try {
      const { count, error } = await supabase
        .from("produtos")
        .select("id", { count: "exact", head: false })
        .eq("estoque_atual", 0)
        .eq("ativo", true)

      if (error) {
        console.error("Erro ao buscar produtos zerados:", error)
        return
      }

      // se count não vier (algumas versões do client), calculamos pelo data length
      // porém select com count: "exact" normalmente retorna count no objeto meta; para simplicidade:
      // se count undefined, usamos data.length
      // aqui supabase-js retorna { data, count, error }
      // adaptamos para suportar ambos
      // Se sua versão do client NÃO retorna count, a query abaixo pode ser trocada por:
      // const { data } = await supabase.from('produtos').select('id', { head: false }).eq('estoque_atual', 0).eq('ativo', true)
      // setProdutosZeradosCount(data?.length || 0)
      // Mas a forma abaixo cobre a maioria dos casos:
      // @ts-ignore
      const maybeCount = (count as number) ?? 0
      if (maybeCount > 0) {
        setProdutosZeradosCount(maybeCount)
        return
      }

      // fallback: buscar data e contar
      const { data } = await supabase
        .from("produtos")
        .select("id")
        .eq("estoque_atual", 0)
        .eq("ativo", true)

      setProdutosZeradosCount(data?.length || 0)
    } catch (err) {
      console.error("Erro ao buscar produtos zerados:", err)
    }
  }

  const marcarTodasComoLidas = async () => {
    setIsMarkingAll(true)
    try {
      const userRes = await supabase.auth.getUser()
      const user = userRes.data.user
      if (!user) return

      const { error } = await supabase
        .from("notificacoes")
        .update({ lida: true })
        .eq("usuario_id", user.id)
        .eq("lida", false)

      if (error) throw error

      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })))
    } catch (err) {
      console.error("Erro ao marcar todas como lidas:", err)
    } finally {
      setIsMarkingAll(false)
    }
  }

  const marcarComoLida = async (notificacaoId: string) => {
    if (!notificacaoId) {
      console.error("ID da notificação não fornecido")
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error("Usuário não autenticado")
        return
      }

      const { error } = await supabase
        .from("notificacoes")
        .update({ lida: true })
        .eq("usuario_id", user.id)
        .eq("id", notificacaoId.toString())

      if (error) {
        console.error("Erro do Supabase:", error)
        throw error
      }

      setNotificacoes(prev =>
        prev.map(n =>
          n.id === notificacaoId
            ? { ...n, lida: true, updated_at: new Date().toISOString() }
            : n
        )
      )
    } catch (err) {
      console.error("Erro ao marcar notificação como lida:", err)
    }
  }

  useEffect(() => {
    // busca inicial de notificações e produtos zerados
    buscarNotificacoes()
    buscarProdutosZerados()

    const interval = setInterval(() => {
      buscarNotificacoes()
      buscarProdutosZerados()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  // Listener em tempo real para notificações (mantém como estava)
  useEffect(() => {
    const channel = supabase
      .channel("notificacoes-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notificacoes" },
        () => {
          buscarNotificacoes()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // NOVO: Listener em tempo real para atualizações relevantes na tabela produtos
  useEffect(() => {
    // Observa inserts/updates/deletes na tabela produtos
    const produtosChannel = supabase
      .channel("produtos-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "produtos" },
        (payload) => {
          // Se quiser otimizar, podemos checar payload.record.estoque_atual
          // mas aqui vamos refazer a contagem sempre que algo mudar na tabela produtos
          buscarProdutosZerados()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(produtosChannel)
    }
  }, [])

  const totalNotificacoes = notificacoes.length
  const naoLidas = notificacoes.filter(n => !n.lida).length
  const estoqueBaixo = notificacoes.filter(n => n.titulo === "Estoque Baixo" && !n.lida).length
  // agora usamos o contador real dos produtos
  const estoqueZero = produtosZeradosCount

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando notificações...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Central de Notificações</h1>
          <p className="text-muted-foreground">Acompanhe alertas e notificações importantes do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={marcarTodasComoLidas} disabled={isMarkingAll || naoLidas === 0}>
            <Check className="mr-2 h-4 w-4" />
            {isMarkingAll ? "Marcando..." : "Marcar Todas como Lidas"}
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Notificações</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNotificacoes}</div>
            <p className="text-xs text-muted-foreground">Todas as notificações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
            <BellOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{naoLidas}</div>
            <p className="text-xs text-muted-foreground">Precisam de atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{estoqueBaixo}</div>
            <p className="text-xs text-muted-foreground">Alertas de estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{estoqueZero}</div>
            <p className="text-xs text-muted-foreground">Produtos zerados</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Notificações */}
      <NotificacoesList notificacoes={notificacoes} marcarComoLida={marcarComoLida} />
    </div>
  )
}
