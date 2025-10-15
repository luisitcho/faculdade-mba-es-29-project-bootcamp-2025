import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Package, AlertTriangle, FileDown } from "lucide-react"
import Link from "next/link"
import { ProdutosList } from "@/components/produtos-list"

export const dynamic = 'force-dynamic'

interface SearchParams {
  categoria?: string
  busca?: string
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

  // Buscar categorias
  const { data: categorias } = await supabase.from("categorias").select("*").order("nome")

  let query = supabase.from("produtos").select("*").eq("ativo", true)

  // Aplicar filtros
  if (searchParams.categoria) {
    query = query.eq("categoria_id", searchParams.categoria)
  }

  if (searchParams.busca) {
    query = query.ilike("nome", `%${searchParams.busca}%`)
  }

  const { data: produtosRaw } = await query.order("nome")

  const produtos = produtosRaw?.map((produto) => {
    const categoria = categorias?.find((c) => c.id === produto.categoria_id)
    return {
      ...produto,
      categorias: categoria ? { id: categoria.id, nome: categoria.nome } : null,
    }
  })

  // Estatísticas
  const totalProdutos = produtos?.length || 0
  const produtosBaixoEstoque = produtos?.filter((p) => p.estoque_atual <= p.estoque_minimo).length || 0
  const valorTotalEstoque = produtos?.reduce((total, p) => total + p.estoque_atual * (p.valor_unitario || 0), 0) || 0

  const isMainAdmin = profile?.email === "luishenrisc1@gmail.com" && profile?.perfil_acesso === "admin"
  const podeEditar =
    isMainAdmin ||
    profile?.perfil_acesso === "super_admin" ||
    profile?.perfil_acesso === "admin" ||
    profile?.perfil_acesso === "operador"

  // 🔔 NOVO BLOCO: registrar notificações de estoque baixo (apenas uma vez por produto)
  if (produtos && produtos.length > 0) {
    for (const produto of produtos) {
      if (produto.estoque_atual <= produto.estoque_minimo) {
        const titulo = "Estoque Baixo"
        const mensagem = `O produto ${produto.nome} está com apenas ${produto.estoque_atual} unidades em estoque.`

        // Verifica se já existe notificação igual
        const { data: notificacaoExistente } = await supabase
          .from("notificacoes")
          .select("id")
          .eq("usuario_id", profile?.id)
          .eq("titulo", titulo)
          .eq("mensagem", mensagem)
          .maybeSingle()

        // Se não existir, cria uma nova
        if (!notificacaoExistente) {
          await supabase.from("notificacoes").insert([
            {
              usuario_id: profile?.id,
              titulo,
              mensagem,
              tipo: "warning",
              lida: false,
            },
          ])
        }
      }
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Produtos</h1>
          <p className="text-muted-foreground">Gerencie o catálogo de produtos por categoria</p>
        </div>
        <div className="flex gap-2">
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
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{produtosBaixoEstoque}</div>
            <p className="text-xs text-muted-foreground">Precisam reposição</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {valorTotalEstoque.toLocaleString("pt-br", { style: "currency", currency: "BRL" })}
            </div>
            <p className="text-xs text-muted-foreground">Valor em estoque</p>
          </CardContent>
        </Card>

        {categorias?.slice(0, 1).map((categoria) => {
          const produtosCategoria = produtos?.filter((p) => p.categoria_id === categoria.id).length || 0
          return (
            <Card key={categoria.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{categoria.nome}</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{produtosCategoria}</div>
                <p className="text-xs text-muted-foreground">produtos</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre produtos por categoria ou busque por nome</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
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
            <Select defaultValue={searchParams.categoria || "all"}>
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
          </div>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      <ProdutosList produtos={produtos || []} podeEditar={podeEditar} />
    </div>
  )
}
