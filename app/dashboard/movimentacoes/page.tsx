import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, TrendingUp, TrendingDown, Calendar } from "lucide-react"
import Link from "next/link"
import { MovimentacoesList } from "@/components/movimentacoes-list"

export const dynamic = 'force-dynamic'

interface SearchParams {
  tipo?: string
  produto?: string
  data?: string
}

export default async function MovimentacoesPage({
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

  // Construir query para movimentações
  let query = supabase.from("movimentacoes").select(`
      *,
      produtos (
        id,
        nome,
        unidade_medida,
        categoria_id
      )
    `)

  // Aplicar filtros
  if (searchParams.tipo && searchParams.tipo !== "all") {
    query = query.eq("tipo_movimentacao", searchParams.tipo)
  }

  if (searchParams.produto) {
    query = query.eq("produto_id", searchParams.produto)
  }

  const { data: movimentacoes } = await query.order("created_at", { ascending: false }).limit(50)

  // Buscar produtos para o filtro
  const { data: produtos } = await supabase.from("produtos").select("id, nome").eq("ativo", true).order("nome")

  // Estatísticas do dia
  const hoje = new Date().toISOString().split("T")[0]
  const { data: entradasHoje } = await supabase
    .from("movimentacoes")
    .select("quantidade", { count: "exact" })
    .eq("tipo_movimentacao", "entrada")
    .gte("created_at", `${hoje}T00:00:00`)
    .lt("created_at", `${hoje}T23:59:59`)

  const { data: saidasHoje } = await supabase
    .from("movimentacoes")
    .select("quantidade", { count: "exact" })
    .eq("tipo_movimentacao", "saida")
    .gte("created_at", `${hoje}T00:00:00`)
    .lt("created_at", `${hoje}T23:59:59`)

  const totalEntradas = entradasHoje?.reduce((acc, mov) => acc + mov.quantidade, 0) || 0
  const totalSaidas = saidasHoje?.reduce((acc, mov) => acc + mov.quantidade, 0) || 0

  const podeEditar = profile?.perfil_acesso === "admin" || profile?.perfil_acesso === "operador"

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Controle de Movimentações</h1>
          <p className="text-muted-foreground">Gerencie entradas e saídas de produtos do estoque</p>
        </div>
        {podeEditar && (
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/movimentacoes/entrada">
                <TrendingUp className="mr-2 h-4 w-4" />
                Nova Entrada
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/movimentacoes/saida">
                <TrendingDown className="mr-2 h-4 w-4" />
                Nova Saída
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Estatísticas do dia */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalEntradas}</div>
            <p className="text-xs text-muted-foreground">{entradasHoje?.length || 0} movimentações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas Hoje</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalSaidas}</div>
            <p className="text-xs text-muted-foreground">{saidasHoje?.length || 0} movimentações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo do Dia</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${totalEntradas - totalSaidas >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {totalEntradas - totalSaidas > 0 ? "+" : ""}
              {totalEntradas - totalSaidas}
            </div>
            <p className="text-xs text-muted-foreground">Diferença entrada/saída</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movimentações</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movimentacoes?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Últimas 50 movimentações</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre movimentações por tipo, produto ou data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <Select defaultValue={searchParams.tipo || "all"}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Tipo de movimentação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as movimentações</SelectItem>
                <SelectItem value="entrada">Entradas</SelectItem>
                <SelectItem value="saida">Saídas</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue={searchParams.produto || "all"}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os produtos</SelectItem>
                {produtos?.map((produto) => (
                  <SelectItem key={produto.id} value={produto.id}>
                    {produto.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" className="w-full md:w-[200px]" defaultValue={searchParams.data} />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Movimentações */}
      <MovimentacoesList movimentacoes={movimentacoes || []} />
    </div>
  )
}
