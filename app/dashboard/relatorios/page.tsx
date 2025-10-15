import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, TrendingUp, Package, AlertTriangle } from "lucide-react"
import { RelatorioEstoque } from "@/components/relatorio-estoque"
import { RelatorioMovimentacoes } from "@/components/relatorio-movimentacoes"
import { GraficoEstoque } from "@/components/grafico-estoque"
import { ExportarRelatoriosButton } from "@/components/exportar-relatorios-button"
import { FiltrosRelatorio } from "@/components/filtros-relatorio"

export const dynamic = 'force-dynamic'

interface SearchParams {
  tipo?: string
  periodo?: string
  categoria?: string
}

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: produtosRaw } = await supabase.from("produtos").select("*").eq("ativo", true)

  const { data: categorias } = await supabase.from("categorias").select("*").order("nome")

  const produtos = produtosRaw?.map((produto) => {
    const categoria = categorias?.find((c) => c.id === produto.categoria_id)
    return {
      ...produto,
      categorias: categoria ? { id: categoria.id, nome: categoria.nome } : null,
    }
  })

  // Calcular período para movimentações
  const hoje = new Date()
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString()
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString()

  const { data: movimentacoesRaw } = await supabase
    .from("movimentacoes")
    .select(`
      *,
      produtos (
        nome,
        unidade_medida,
        categoria_id
      )
    `)
    .gte("created_at", inicioMes)
    .lte("created_at", fimMes)
    .order("created_at", { ascending: false })

  const movimentacoes = movimentacoesRaw?.map((mov) => {
    const categoria = categorias?.find((c) => c.id === mov.produtos?.categoria_id)
    return {
      ...mov,
      produtos: {
        ...mov.produtos,
        categorias: categoria ? { nome: categoria.nome } : null,
      },
    }
  })

  // Estatísticas gerais
  const totalProdutos = produtos?.length || 0
  const produtosBaixoEstoque = produtos?.filter((p) => p.estoque_atual <= p.estoque_minimo).length || 0
  const valorTotalEstoque = produtos?.reduce((acc, p) => acc + p.estoque_atual * (p.valor_unitario || 0), 0) || 0

  const entradasMes = movimentacoes?.filter((m) => m.tipo_movimentacao === "entrada").length || 0
  const saidasMes = movimentacoes?.filter((m) => m.tipo_movimentacao === "saida").length || 0

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios e Análises</h1>
          <p className="text-muted-foreground">Visualize dados e gere relatórios do sistema de estoque</p>
        </div>
        <ExportarRelatoriosButton produtos={produtos || []} movimentacoes={movimentacoes || []} />
      </div>

      {/* Resumo Executivo */}
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
            <CardTitle className="text-sm font-medium">Valor do Estoque</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{valorTotalEstoque.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</div>
            <p className="text-xs text-muted-foreground">Valor total em estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimentações/Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entradasMes + saidasMes}</div>
            <p className="text-xs text-muted-foreground">
              {entradasMes} entradas, {saidasMes} saídas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros de Relatório */}
      <FiltrosRelatorio categorias={categorias || []} searchParams={searchParams} />

      {/* Gráfico de Estoque por Categoria */}
      <GraficoEstoque produtos={produtos || []} />

      {/* Relatórios */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RelatorioEstoque produtos={produtos || []} />
        <RelatorioMovimentacoes movimentacoes={movimentacoes || []} />
      </div>
    </div>
  )
}
