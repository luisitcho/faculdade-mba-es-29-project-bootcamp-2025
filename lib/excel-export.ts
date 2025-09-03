"use client"

interface ProdutoExport {
  id: string
  nome: string
  categoria: string
  estoque_atual: number
  estoque_minimo: number
  unidade_medida: string
  valor_unitario: number | null
  status_estoque: string
}

interface MovimentacaoExport {
  data: string
  produto: string
  categoria: string
  tipo: string
  quantidade: number
  valor_unitario: number | null
  valor_total: number | null
  observacoes: string | null
}

export function exportarProdutosParaExcel(produtos: any[]) {
  const dadosExport: ProdutoExport[] = produtos.map((produto) => ({
    id: produto.id,
    nome: produto.nome,
    categoria: produto.categorias?.nome || "N/A",
    estoque_atual: produto.estoque_atual,
    estoque_minimo: produto.estoque_minimo,
    unidade_medida: produto.unidade_medida,
    valor_unitario: produto.valor_unitario,
    status_estoque:
      produto.estoque_atual <= produto.estoque_minimo
        ? "Baixo"
        : produto.estoque_atual <= produto.estoque_minimo * 1.5
          ? "Atenção"
          : "Normal",
  }))

  const csvContent = gerarCSV(dadosExport, [
    { key: "nome", label: "Nome do Produto" },
    { key: "categoria", label: "Categoria" },
    { key: "estoque_atual", label: "Estoque Atual" },
    { key: "estoque_minimo", label: "Estoque Mínimo" },
    { key: "unidade_medida", label: "Unidade" },
    { key: "valor_unitario", label: "Valor Unitário (R$)" },
    { key: "status_estoque", label: "Status do Estoque" },
  ])

  baixarArquivo(csvContent, `relatorio-produtos-${new Date().toISOString().split("T")[0]}.csv`)
}

export function exportarMovimentacoesParaExcel(movimentacoes: any[]) {
  const dadosExport: MovimentacaoExport[] = movimentacoes.map((mov) => ({
    data: new Date(mov.created_at).toLocaleDateString("pt-BR"),
    produto: mov.produtos?.nome || "N/A",
    categoria: mov.produtos?.categorias?.nome || "N/A",
    tipo: mov.tipo_movimentacao === "entrada" ? "Entrada" : "Saída",
    quantidade: mov.quantidade,
    valor_unitario: mov.valor_unitario,
    valor_total: mov.valor_total,
    observacoes: mov.observacoes || "",
  }))

  const csvContent = gerarCSV(dadosExport, [
    { key: "data", label: "Data" },
    { key: "produto", label: "Produto" },
    { key: "categoria", label: "Categoria" },
    { key: "tipo", label: "Tipo" },
    { key: "quantidade", label: "Quantidade" },
    { key: "valor_unitario", label: "Valor Unitário (R$)" },
    { key: "valor_total", label: "Valor Total (R$)" },
    { key: "observacoes", label: "Observações" },
  ])

  baixarArquivo(csvContent, `relatorio-movimentacoes-${new Date().toISOString().split("T")[0]}.csv`)
}

export function exportarEstoqueBaixoParaExcel(produtos: any[]) {
  const produtosBaixoEstoque = produtos.filter((p) => p.estoque_atual <= p.estoque_minimo)

  const dadosExport = produtosBaixoEstoque.map((produto) => ({
    nome: produto.nome,
    categoria: produto.categorias?.nome || "N/A",
    estoque_atual: produto.estoque_atual,
    estoque_minimo: produto.estoque_minimo,
    unidade_medida: produto.unidade_medida,
    diferenca: produto.estoque_minimo - produto.estoque_atual,
    valor_unitario: produto.valor_unitario,
    valor_reposicao: (produto.estoque_minimo - produto.estoque_atual) * (produto.valor_unitario || 0),
  }))

  const csvContent = gerarCSV(dadosExport, [
    { key: "nome", label: "Nome do Produto" },
    { key: "categoria", label: "Categoria" },
    { key: "estoque_atual", label: "Estoque Atual" },
    { key: "estoque_minimo", label: "Estoque Mínimo" },
    { key: "diferenca", label: "Quantidade Necessária" },
    { key: "unidade_medida", label: "Unidade" },
    { key: "valor_unitario", label: "Valor Unitário (R$)" },
    { key: "valor_reposicao", label: "Valor para Reposição (R$)" },
  ])

  baixarArquivo(csvContent, `relatorio-estoque-baixo-${new Date().toISOString().split("T")[0]}.csv`)
}

function gerarCSV(dados: any[], colunas: { key: string; label: string }[]) {
  const headers = colunas.map((col) => col.label).join(",")
  const rows = dados.map((item) =>
    colunas
      .map((col) => {
        const valor = item[col.key]
        // Escapar aspas e vírgulas no CSV
        if (typeof valor === "string" && (valor.includes(",") || valor.includes('"'))) {
          return `"${valor.replace(/"/g, '""')}"`
        }
        return valor ?? ""
      })
      .join(","),
  )

  return [headers, ...rows].join("\n")
}

function baixarArquivo(conteudo: string, nomeArquivo: string) {
  const blob = new Blob(["\uFEFF" + conteudo], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", nomeArquivo)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
