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
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()
  
  // Fallback se não encontrar perfil
  const userProfile = profile || {
    id: data.user.id,
    nome: data.user.email?.split('@')[0] || 'Usuário',
    email: data.user.email || '',
    perfil_acesso: 'consulta',
    ativo: true
  }

  const isMainAdmin = (userProfile?.email === "admin@admin.com" || userProfile?.email === "luishenrisc1@gmail.com") && userProfile?.perfil_acesso === "admin"

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

    console.log(totalProdutos)

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {userProfile?.nome || "Usuário"}! Perfil: {userProfile?.perfil_acesso}
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Produtos com Estoque Baixo
            </CardTitle>
            <CardDescription>Produtos que precisam de reposição urgente</CardDescription>
          </CardHeader>
          <CardContent>
            {produtosAlerta && produtosAlerta.length > 0 ? (
              <div className="space-y-3">
                {produtosAlerta.map((produto) => (
                  <div
                    key={produto.id}
                    className="flex items-center justify-between p-3 border border-orange-200 rounded-md bg-orange-50"
                  >
                    <div>
                      <p className="font-medium text-sm">{produto.nome}</p>
                      <p className="text-xs text-muted-foreground">{produto.categorias.nome}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">
                        {produto.estoque_atual} {produto.unidade_medida}
                      </p>
                      <p className="text-xs text-muted-foreground">Mín: {produto.estoque_minimo}</p>
                    </div>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/dashboard/produtos">Ver Todos os Produtos</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Todos os produtos estão com estoque adequado!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Últimas Movimentações
            </CardTitle>
            <CardDescription>Movimentações mais recentes do estoque</CardDescription>
          </CardHeader>
          <CardContent>
            {ultimasMovimentacoes && ultimasMovimentacoes.length > 0 ? (
              <div className="space-y-3">
                {ultimasMovimentacoes.map((mov) => (
                  <div key={mov.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {mov.tipo_movimentacao === "entrada" ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />
                      )}
                      <span className="truncate">{mov.produtos.nome}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {mov.quantidade} {mov.produtos.unidade_medida}
                    </span>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/dashboard/movimentacoes">Ver Todas as Movimentações</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma movimentação recente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesso rápido às principais funcionalidades do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(isMainAdmin || profile?.perfil_acesso === "admin" || profile?.perfil_acesso === "operador") && (
              <Button asChild variant="default" className="h-20 flex-col cursor-pointer">
                <Link href="/dashboard/produtos/novo">
                  <Package className="h-6 w-6 mb-2" />
                  Cadastrar Produto
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="h-20 flex-col bg-transparent cursor-pointer">
              <Link href="/dashboard/produtos">
                <Package className="h-6 w-6 mb-2" />
                Gerenciar Produtos
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col bg-transparent cursor-pointer">
              <Link href="/dashboard/movimentacoes">
                <TrendingUp className="h-6 w-6 mb-2" />
                Nova Movimentação
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col bg-transparent cursor-pointer">
              <Link href="/dashboard/relatorios">
                <Calendar className="h-6 w-6 mb-2" />
                Relatórios
              </Link>
            </Button>
            {/* {isMainAdmin && (
              <Button asChild variant="outline" className="h-20 flex-col bg-transparent cursor-pointer">
                <Link href="/dashboard/usuarios">
                  <Users className="h-6 w-6 mb-2" />
                  Gerenciar Usuários
                </Link>
              </Button>
            )} */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
