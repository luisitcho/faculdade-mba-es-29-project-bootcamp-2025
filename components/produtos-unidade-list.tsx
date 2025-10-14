"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Edit, AlertTriangle } from "lucide-react"

interface Produto {
  id: string
  nome: string
  descricao: string | null
  estoque_atual: number
  estoque_minimo: number
  unidade_medida: string
  valor_unitario: number | null
  categorias: { nome: string }
}

interface ProdutosUnidadeListProps {
  produtos: Produto[]
  profile: any
  unidadeId: string
}

export function ProdutosUnidadeList({ produtos, profile }: ProdutosUnidadeListProps) {
  const podeEditar = profile?.perfil_acesso === "admin" || profile?.perfil_acesso === "operador"

  if (produtos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum produto cadastrado nesta unidade</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {produtos.map((produto) => {
        const estoquePercentual = (produto.estoque_atual / produto.estoque_minimo) * 100
        const estoqueBaixo = estoquePercentual <= 100

        return (
          <div key={produto.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">{produto.nome}</h3>
                <Badge variant="outline">{produto.categorias.nome}</Badge>
                {estoqueBaixo && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Estoque Baixo
                  </Badge>
                )}
              </div>
              {produto.descricao && <p className="text-sm text-muted-foreground mb-2">{produto.descricao}</p>}
              <div className="flex gap-4 text-sm">
                <span>
                  Estoque: <strong>{produto.estoque_atual}</strong> {produto.unidade_medida}
                </span>
                <span className="text-muted-foreground">Mínimo: {produto.estoque_minimo}</span>
                {produto.valor_unitario && (
                  <span className="text-muted-foreground">Valor: R$ {produto.valor_unitario.toFixed(2)}</span>
                )}
              </div>
            </div>
            {podeEditar && (
              <Button variant="outline" size="sm" asChild className="cursor-pointer bg-transparent">
                <Link href={`/dashboard/produtos/${produto.id}/editar`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
