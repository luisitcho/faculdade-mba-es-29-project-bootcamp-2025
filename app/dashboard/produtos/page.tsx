import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Package, AlertTriangle, FileDown, Bell } from "lucide-react"
import Link from "next/link"
import { ProdutosList } from "@/components/produtos-list"

interface SearchParams {
  categoria?: string
  busca?: string
}

// Função para verificar e criar notificações de estoque baixo
async function verificarNotificacoesEstoque(supabase: any, userId: string) {
  try {
    // Buscar produtos com estoque ≤ 3
    const { data: produtosBaixoEstoque, error } = await supabase
      .from("produtos")
      .select(`
        id,
        nome,
        estoque_atual,
        estoque_minimo,
        categorias!categoria_id (nome)
      `)
      .lte("estoque_atual", 3)
      .eq("ativo", true)

    if (error) {
      console.error("Erro ao buscar produtos com estoque baixo:", error)
      return
    }

    if (!produtosBaixoEstoque || produtosBaixoEstoque.length === 0) {
      console.log("Nenhum produto com estoque baixo encontrado")
      return
    }

    console.log(`Encontrados ${produtosBaixoEstoque.length} produtos com estoque baixo`)

    // Para cada produto com estoque baixo, verificar se já existe notificação não lida
    for (const produto of produtosBaixoEstoque) {
      // Verificar se já existe notificação não lida para este produto
      const { data: notificacaoExistente } = await supabase
        .from("notificacoes")
        .select("id")
        .eq("usuario_id", userId)
        .eq("lida", false)
        .ilike("mensagem", `%${produto.nome}%`)
        .single()

      // Se não existe notificação, criar uma nova
      if (!notificacaoExistente) {
        const { error: notificacaoError } = await supabase
          .from("notificacoes")
          .insert({
            usuario_id: userId,
            titulo: "Estoque Baixo",
            mensagem: `O produto ${produto.nome} está com apenas ${produto.estoque_atual} unidades em estoque.`,
            tipo: "warning",
            lida: false
          })

        if (notificacaoError) {
          console.error(`Erro ao criar notificação para ${produto.nome}:`, notificacaoError)
        } else {
          console.log(`Notificação criada para: ${produto.nome}`)
        }
      }
    }

  } catch (error) {
    console.error("Erro no sistema de notificações:", error)
  }
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Buscar perfil do usuário
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // CORREÇÃO: Executar verificação de notificações
  await verificarNotificacoesEstoque(supabase, data.user.id)

  // Buscar categorias
  const { data: categorias } = await supabase.from("categorias").select("*").order("nome")

  // Buscar notificações não lidas para mostrar badge
  const { data: notificacoesNaoLidas, count: totalNotificacoes } = await supabase
    .from("notificacoes")
    .select("*", { count: 'exact' })
    .eq("usuario_id", data.user.id)
    .eq("lida", false)
    .order("created_at", { ascending: false })

  // Query com join correto
  let query = supabase
    .from("produtos")
    .select(`
      *,
      categorias!categoria_id (
        id,
        nome
      )
    `)
    .eq("ativo", true)

  // Aplicar filtros
  if (searchParams.categoria && searchParams.categoria !== "all") {
    query = query.eq("categoria_id", searchParams.categoria)
  }

  if (searchParams.busca) {
    query = query.ilike("nome", `%${searchParams.busca}%`)
  }

  const { data: produtos, error: produtosError } = await query.order("nome")

  if (produtosError) {
    console.error("Erro ao buscar produtos:", produtosError)
  }

  // Estatísticas
  const totalProdutos = produtos?.length || 0
  const produtosBaixoEstoque = produtos?.filter((p) => p.estoque_atual <= 3).length || 0 // Alterado para ≤ 3
  const valorTotalEstoque = produtos?.reduce((total, p) => total + p.estoque_atual * (p.valor_unitario || 0), 0) || 0

  const isMainAdmin = profile?.email === "admin@admin.com" && profile?.perfil_acesso === "admin"
  const podeEditar = isMainAdmin ||
    profile?.perfil_acesso === "super_admin" ||
    profile?.perfil_acesso === "admin" ||
    profile?.perfil_acesso === "operador"

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Produtos</h1>
          <p className="text-muted-foreground">Gerencie o catálogo de produtos por categoria</p>
        </div>
        <div className="flex gap-2">
          {/* Botão de Notificações */}
          <Button variant="outline" asChild>
            <Link href="/dashboard/notificacoes" className="relative">
              <Bell className="mr-2 h-4 w-4" />
              Notificações
              {totalNotificacoes && totalNotificacoes > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {totalNotificacoes}
                </span>
              )}
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/dashboard/produtos/exportar">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Link>
          </Button>
          {podeEditar && (
            <Button asChild>
              <Link href="/dashboard/produtos/novo">
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Alertas de Notificações */}
      {notificacoesNaoLidas && notificacoesNaoLidas.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-800">
                Você tem {notificacoesNaoLidas.length} notificação(s) não lida(s)
              </p>
              <p className="text-sm text-orange-700">
                {notificacoesNaoLidas[0].mensagem}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProdutos}</div>
            <p className="text-xs text-muted-foreground">Produtos ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo (≤ 3)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{produtosBaixoEstoque}</div>
            <p className="text-xs text-muted-foreground">Precisam reposição urgente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {valorTotalEstoque.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Valor em estoque</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notificações</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNotificacoes || 0}</div>
            <p className="text-xs text-muted-foreground">Não lidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Resto do código permanece igual */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre produtos por categoria ou busque por nome</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  className="pl-10"
                  defaultValue={searchParams.busca}
                  name="busca"
                />
              </div>
            </div>
            <Select name="categoria" defaultValue={searchParams.categoria || "all"}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categorias?.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
          </form>
        </CardContent>
      </Card>

      <ProdutosList produtos={produtos || []} podeEditar={podeEditar} />
    </div>
  )
}