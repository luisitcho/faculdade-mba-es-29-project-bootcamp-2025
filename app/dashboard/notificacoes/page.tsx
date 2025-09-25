import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, BellOff, Check, AlertTriangle, Package, Settings } from "lucide-react"
import { NotificacoesList } from "@/components/notificacoes-list"

// Ação do servidor para marcar notificação como lida
async function marcarComoLida(id: string) {
  "use server"
  
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("notificacoes")
    .update({ 
      lida: true, 
      updated_at: new Date().toISOString() 
    })
    .eq("id", id)

  if (error) {
    console.error("Erro ao marcar notificação como lida:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Ação do servidor para marcar TODAS como lidas
async function marcarTodasComoLidas() {
  "use server"

  try {
    const supabase = await createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      throw new Error("Usuário não autenticado")
    }

    const { error: updateError } = await supabase
      .from("notificacoes")
      .update({
        lida: true,
        updated_at: new Date().toISOString(),
      })
      .eq("usuario_id", userData.user.id)
      .eq("lida", false)

    if (updateError) {
      throw new Error(updateError.message)
    }

    // Revalida a página para atualizar os dados
    redirect("/notificacoes")
    
  } catch (error) {
    console.error("Erro ao marcar todas como lidas:", error)
    // Em caso de erro, também redireciona para recarregar a página
    redirect("/notificacoes")
  }
}


export default async function NotificacoesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Buscar notificações do usuário
  const { data: notificacoes } = await supabase
    .from("notificacoes")
    .select("*")
    .eq("usuario_id", data.user.id)
    .order("created_at", { ascending: false })

  // Estatísticas
  const totalNotificacoes = notificacoes?.length || 0
  const naoLidas = notificacoes?.filter((n) => !n.lida).length || 0
  const estoqueBaixo = notificacoes?.filter((n) => n.tipo === "warning" && !n.lida).length || 0

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Central de Notificações</h1>
          <p className="text-muted-foreground">Acompanhe alertas e notificações importantes do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
          
          {/* Botão para marcar TODAS como lidas */}
          <form action={marcarTodasComoLidas}>
            <Button type="submit">
              <Check className="mr-2 h-4 w-4" />
              Marcar Todas como Lidas
            </Button>
          </form>
        </div>
      </div>

      {/* Resumo de Notificações */}
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
            <CardTitle className="text-sm font-medium">Outras</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {totalNotificacoes - estoqueBaixo}
            </div>
            <p className="text-xs text-muted-foreground">Outras notificações</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros Rápidos</CardTitle>
          <CardDescription>Filtre notificações por tipo ou status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Todas ({totalNotificacoes})
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Não Lidas ({naoLidas})
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Estoque Baixo ({estoqueBaixo})
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Notificações - Passando a função marcarComoLida */}
      <NotificacoesList 
        notificacoes={notificacoes || []} 
        marcarComoLida={marcarComoLida}
      />
    </div>
  )
}