"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Activity, FileDown } from "lucide-react"
import { exportarMovimentacoesParaExcel } from "@/lib/excel-export"

interface Movimentacao {
  id: string
  tipo_movimentacao: string
  quantidade: number
  valor_total: number | null
  created_at: string
  produtos: {
    nome: string
    unidade_medida: string
    categorias: {
      nome: string
    }
  }
}

interface RelatorioMovimentacoesProps {
  movimentacoes: Movimentacao[]
}

export function RelatorioMovimentacoes({ movimentacoes }: RelatorioMovimentacoesProps) {
  const entradas = movimentacoes.filter((m) => m.tipo_movimentacao === "entrada")
  const saidas = movimentacoes.filter((m) => m.tipo_movimentacao === "saida")

  const totalEntradas = entradas.reduce((acc, m) => acc + m.quantidade, 0)
  const totalSaidas = saidas.reduce((acc, m) => acc + m.quantidade, 0)

  const valorEntradas = entradas.reduce((acc, m) => acc + (m.valor_total || 0), 0)
  const valorSaidas = saidas.reduce((acc, m) => acc + (m.valor_total || 0), 0)

  // Top 5 produtos mais movimentados
  const produtosMaisMovimentados = movimentacoes
    .reduce(
      (acc, mov) => {
        const produto = mov.produtos.nome
        const existing = acc.find((item) => item.produto === produto)

        if (existing) {
          existing.quantidade += mov.quantidade
          existing.movimentacoes += 1
        } else {
          acc.push({
            produto,
            quantidade: mov.quantidade,
            movimentacoes: 1,
            categoria: mov.produtos.categorias.nome,
            unidade: mov.produtos.unidade_medida,
          })
        }

        return acc
      },
      [] as Array<{ produto: string; quantidade: number; movimentacoes: number; categoria: string; unidade: string }>,
    )
    .sort((a, b) => b.movimentacoes - a.movimentacoes)
    .slice(0, 5)

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "Alimentação":
        return "bg-green-100 text-green-800"
      case "Higiene/Limpeza":
        return "bg-blue-100 text-blue-800"
      case "Pedagógico":
        return "bg-purple-100 text-purple-800"
      case "Bens":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleExportarMovimentacoes = () => {
    exportarMovimentacoesParaExcel(movimentacoes)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Relatório de Movimentações
            </CardTitle>
            <CardDescription>Resumo das movimentações do período atual</CardDescription>
          </div>
          {movimentacoes.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExportarMovimentacoes}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo de Entradas e Saídas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border border-green-200 rounded-md bg-green-50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Entradas</span>
            </div>
            <p className="text-lg font-bold text-green-600">{totalEntradas}</p>
            <p className="text-xs text-muted-foreground">{entradas.length} movimentações</p>
            {valorEntradas > 0 && <p className="text-xs text-green-600">R$ {valorEntradas.toFixed(2)}</p>}
          </div>

          <div className="p-3 border border-red-200 rounded-md bg-red-50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Saídas</span>
            </div>
            <p className="text-lg font-bold text-red-600">{totalSaidas}</p>
            <p className="text-xs text-muted-foreground">{saidas.length} movimentações</p>
            {valorSaidas > 0 && <p className="text-xs text-red-600">R$ {valorSaidas.toFixed(2)}</p>}
          </div>
        </div>

        {/* Produtos Mais Movimentados */}
        {produtosMaisMovimentados.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Produtos Mais Movimentados</h4>
            <div className="space-y-2">
              {produtosMaisMovimentados.map((item, index) => (
                <div key={item.produto} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground w-4">{index + 1}º</span>
                    <div>
                      <p className="font-medium text-sm">{item.produto}</p>
                      <Badge className={getCategoriaColor(item.categoria)}>{item.categoria}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {item.quantidade} {item.unidade}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.movimentacoes} movimentações</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {movimentacoes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma movimentação no período selecionado</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
