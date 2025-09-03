"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package, FileDown } from "lucide-react"
import { exportarEstoqueBaixoParaExcel } from "@/lib/excel-export"

interface Produto {
  id: string
  nome: string
  estoque_atual: number
  estoque_minimo: number
  unidade_medida: string
  valor_unitario: number | null
  categorias: {
    nome: string
  }
}

interface RelatorioEstoqueProps {
  produtos: Produto[]
}

export function RelatorioEstoque({ produtos }: RelatorioEstoqueProps) {
  const produtosBaixoEstoque = produtos.filter((p) => p.estoque_atual <= p.estoque_minimo)
  const produtosEstoqueZero = produtos.filter((p) => p.estoque_atual === 0)

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

  const handleExportarEstoqueBaixo = () => {
    exportarEstoqueBaixoParaExcel(produtos)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Relatório de Estoque
            </CardTitle>
            <CardDescription>Produtos que precisam de atenção no estoque</CardDescription>
          </div>
          {produtosBaixoEstoque.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExportarEstoqueBaixo}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Produtos com Estoque Zero */}
        {produtosEstoqueZero.length > 0 && (
          <div>
            <h4 className="font-medium text-red-600 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Produtos sem Estoque ({produtosEstoqueZero.length})
            </h4>
            <div className="space-y-2">
              {produtosEstoqueZero.slice(0, 5).map((produto) => (
                <div
                  key={produto.id}
                  className="flex items-center justify-between p-2 border border-red-200 rounded-md bg-red-50"
                >
                  <div>
                    <p className="font-medium text-sm">{produto.nome}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoriaColor(produto.categorias.nome)}>{produto.categorias.nome}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">0 {produto.unidade_medida}</p>
                    <p className="text-xs text-muted-foreground">Mín: {produto.estoque_minimo}</p>
                  </div>
                </div>
              ))}
              {produtosEstoqueZero.length > 5 && (
                <p className="text-xs text-muted-foreground">E mais {produtosEstoqueZero.length - 5} produtos...</p>
              )}
            </div>
          </div>
        )}

        {/* Produtos com Estoque Baixo */}
        {produtosBaixoEstoque.length > 0 && (
          <div>
            <h4 className="font-medium text-orange-600 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Produtos com Estoque Baixo ({produtosBaixoEstoque.length})
            </h4>
            <div className="space-y-2">
              {produtosBaixoEstoque.slice(0, 5).map((produto) => (
                <div
                  key={produto.id}
                  className="flex items-center justify-between p-2 border border-orange-200 rounded-md bg-orange-50"
                >
                  <div>
                    <p className="font-medium text-sm">{produto.nome}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoriaColor(produto.categorias.nome)}>{produto.categorias.nome}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600">
                      {produto.estoque_atual} {produto.unidade_medida}
                    </p>
                    <p className="text-xs text-muted-foreground">Mín: {produto.estoque_minimo}</p>
                  </div>
                </div>
              ))}
              {produtosBaixoEstoque.length > 5 && (
                <p className="text-xs text-muted-foreground">E mais {produtosBaixoEstoque.length - 5} produtos...</p>
              )}
            </div>
          </div>
        )}

        {produtosBaixoEstoque.length === 0 && produtosEstoqueZero.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Todos os produtos estão com estoque adequado!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
