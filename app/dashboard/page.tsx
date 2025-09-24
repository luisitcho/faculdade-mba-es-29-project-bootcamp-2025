import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, TrendingUp, AlertTriangle, Calendar, Activity } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Buscar dados do perfil do usuário
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single()

  // Buscar estatísticas básicas
  const { data: totalProdutos } = await supabase.from("produtos").select("id", { count: "exact" })
  const { data: totalUsuarios } = await supabase.from("profiles").select("id", { count: "exact" })
  const { data: produtosBaixoEstoque } = await supabase
    .from("produtos")
    .select("id", { count: "exact" })
    .lt("estoque_atual", "estoque_minimo")

  // Movimentações de hoje
  const hoje = new Date().toISOString().split("T")[0]
  const { data: movimentacoesHoje } = await supabase
    .from("movimentacoes")
    .select("tipo_movimentacao", { count: "exact" })
    .gte("created_at", `${hoje}T00:00:00`)
    .lt("created_at", `${hoje}T23:59:59`)

  // Últimas movimentações
  const { data: ultimasMovimentacoes } = await supabase
    .from("movimentacoes")
    .select(`
      *,
      produtos (
        nome,
        unidade_medida
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  // Produtos com estoque baixo
  const { data: produtosAlerta } = await supabase
    .from("produtos")
    .select(`
      *,
      categorias (
        nome
      )
    `)
    .lte("estoque_atual", "estoque_minimo")
    .eq("ativo", true)
    .limit(5)

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {profile?.nome || "Usuário"}! Perfil: {profile?.perfil_acesso || "Desconhecido"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/relatorios">Ver Relatórios</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProdutos?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsuarios?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Usuários no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{produtosBaixoEstoque?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Produtos com estoque baixo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimentações Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movimentacoesHoje?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Entradas e saídas</p>
          </CardContent>
        </Card>
      </div>

      {/* Cards de produtos com estoque baixo e últimas movimentações */}
      {/* ... restante do JSX mantém igual, usando sempre profile?.nome e profile?.perfil_acesso */}
      {/* Exemplo nas ações rápidas: */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {profile?.perfil_acesso === "admin" && (
          <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
            <Link href="/dashboard/usuarios">
              <Users className="h-6 w-6 mb-2" />
              Gerenciar Usuários
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
