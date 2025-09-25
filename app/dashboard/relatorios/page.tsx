import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Calendar, TrendingUp, Package, AlertTriangle, Bell, FileDown } from "lucide-react"
import { RelatorioEstoque } from "@/components/relatorio-estoque"
import { RelatorioMovimentacoes } from "@/components/relatorio-movimentacoes"
import { GraficoEstoque } from "@/components/grafico-estoque"
import { ExportarRelatoriosButton } from "@/components/exportar-relatorios-button"
import Link from "next/link"

interface SearchParams {
  tipo?: string
  periodo?: string
  categoria?: string
}

// Função para verificar e criar notificações de estoque baixo (≤ 3 itens)
async function verificarNotificacoesEstoque(supabase: any, userId: string) {
  try {
    // Buscar produtos com estoque ≤ 3
    const { data: produtosBaixoEstoque, error } = await supabase
      .from("produtos")
      .select(`
        id,
        nome,
        estoque_atual,
        estoque_minimo
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

  // Buscar perfil do usuário
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // CORREÇÃO: Executar verificação de notificações de estoque baixo
  await verificarNotificacoesEstoque(supabase, data.user.id)

  // Buscar notificações não lidas para mostrar badge
  const { data: notificacoesNaoLidas, count: totalNotificacoes } = await supabase
    .from("notificacoes")
    .select("*", { count: 'exact' })
    .eq("usuario_id", data.user.id)
    .eq("lida", false)
    .order("created_at", { ascending: false })

  // Buscar dados para relatórios
  const { data: produtos } = await supabase
    .from("produtos")
    .select(`
      *,
      categorias (
        id,
        nome
      )
    `)
    .eq("ativo", true)

  const { data: categorias } = await supabase.from("categorias").select("*").order("nome")

  // Calcular período para movimentações
  const hoje = new Date()
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString()
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString()

  const { data: movimentacoes } = await supabase
    .from("movimentacoes")
    .select(`
      *,
      produtos (
        nome,
        unidade_medida,
        categorias (
          nome
        )
      )
    `)
    .gte("created_at", inicioMes)
    .lte("created_at", fimMes)
    .order("created_at", { ascending: false })

  // Estatísticas gerais - ATUALIZADO: Alterado para ≤ 3 itens e formatação de moeda
  const totalProdutos = produtos?.length || 0
  const produtosBaixoEstoque = produtos?.filter((p) => p.estoque_atual <= 3).length || 0
  const valorTotalEstoque = produtos?.reduce((acc, p) => acc + p.estoque_atual * (p.valor_unitario || 0), 0) || 0
  const valorFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valorTotalEstoque)

  const entradasMes = movimentacoes?.filter((m) => m.tipo_movimentacao === "entrada").length || 0
  const saidasMes = movimentacoes?.filter((m) => m.tipo_movimentacao === "saida").length || 0

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios e Análises</h1>
          <p className="text-muted-foreground">Visualize dados e gere relatórios do sistema de estoque</p>
        </div>
        <div className="flex gap-2">
          {/* CORREÇÃO: Adicionado botão de notificações */}
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
          
          <ExportarRelatoriosButton produtos={produtos || []} movimentacoes={movimentacoes || []} />
        </div>
      </div>

      {/* CORREÇÃO: Adicionado alerta de notificações não lidas */}
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

      {/* Resumo Executivo - ATUALIZADO: Alterado para ≤ 3 itens e formatação de moeda */}
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
            <CardTitle className="text-sm font-medium">Valor do Estoque</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{valorFormatado}</div>
            <p className="text-xs text-muted-foreground">Valor total em estoque</p>
          </CardContent>
        </Card>

        {/* CORREÇÃO: Alterado para card de notificações */}
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

      {/* Filtros de Relatório */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Relatório</CardTitle>
          <CardDescription>Personalize os relatórios selecionando os filtros desejados</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/dashboard/relatorios" method="get">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select name="tipo" defaultValue={searchParams.tipo || "estoque"}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de relatório" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="estoque">Relatório de Estoque</SelectItem>
                  <SelectItem value="movimentacoes">Relatório de Movimentações</SelectItem>
                  <SelectItem value="categorias">Relatório por Categoria</SelectItem>
                  <SelectItem value="usuarios">Relatório por Usuário</SelectItem>
                </SelectContent>
              </Select>
              <Select name="periodo" defaultValue={searchParams.periodo || "mes"}>
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Esta Semana</SelectItem>
                  <SelectItem value="mes">Este Mês</SelectItem>
                  <SelectItem value="trimestre">Este Trimestre</SelectItem>
                  <SelectItem value="ano">Este Ano</SelectItem>
                </SelectContent>
              </Select>
              <Select name="categoria" defaultValue={searchParams.categoria || "all"}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categorias?.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                Gerar Relatório
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

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