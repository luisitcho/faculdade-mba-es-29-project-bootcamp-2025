import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Package, AlertTriangle, FileDown } from "lucide-react"
import Link from "next/link"
import { ProdutosList } from "@/components/produtos-list"

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

  // CORREÇÃO: Construir query para produtos com join correto
  let query = supabase
    .from("produtos")
    .select(`
      *,
      categorias!inner (
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

  // CORREÇÃO: Adicionar tratamento de erro
  const { data: produtos, error: produtosError } = await query.order("nome")

  if (produtosError) {
    console.error("Erro ao buscar produtos:", produtosError)
    
    // CORREÇÃO: Tentar fallback sem o join se houver erro
    console.log("Tentando fallback sem join...")
    
    let fallbackQuery = supabase
      .from("produtos")
      .select("*")
      .eq("ativo", true)

    if (searchParams.categoria && searchParams.categoria !== "all") {
      fallbackQuery = fallbackQuery.eq("categoria_id", searchParams.categoria)
    }

    if (searchParams.busca) {
      fallbackQuery = fallbackQuery.ilike("nome", `%${searchParams.busca}%`)
    }

    const { data: produtosFallback, error: fallbackError } = await fallbackQuery.order("nome")
    
    if (fallbackError) {
      console.error("Erro no fallback:", fallbackError)
    } else {
      console.log("Fallback bem-sucedido, produtos encontrados:", produtosFallback?.length)
    }
  }

  console.log("Produtos carregados:", produtos?.length)
  console.log("Primeiro produto:", produtos?.[0])

  // Estatísticas
  const totalProdutos = produtos?.length || 0
  const produtosBaixoEstoque = produtos?.filter((p) => p.estoque_atual <= p.estoque_minimo).length || 0
  const valorTotalEstoque = produtos?.reduce((total, p) => total + p.estoque_atual * (p.valor_unitario || 0), 0) || 0

  const isMainAdmin = profile?.email === "admin@admin.com" && profile?.perfil_acesso === "admin"
  const podeEditar = isMainAdmin ||
    profile?.perfil_acesso === "super_admin" ||
    profile?.perfil_acesso === "admin" ||
    profile?.perfil_acesso === "operador"

  // CORREÇÃO: Teste simples para verificar se há produtos
  const { data: testeProdutos, error: testeError } = await supabase
    .from("produtos")
    .select("id")
    .eq("ativo", true)
    .limit(1)

  console.log("Teste simples - Produtos ativos existem?", testeProdutos?.length > 0)
  console.log("Erro no teste:", testeError)

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

      {/* Debug info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-sm">
          <strong>Debug Info:</strong> Total de produtos encontrados: {totalProdutos} | 
          Teste simples: {testeProdutos?.length || 0} produto(s) ativo(s)
        </p>
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
            <div className="text-2xl font-bold">R$ {valorTotalEstoque.toFixed(2)}</div>
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

      {/* Lista de Produtos */}
      <ProdutosList produtos={produtos || []} podeEditar={podeEditar} />
    </div>
  )
}