"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, User, Calendar } from "lucide-react"

interface Movimentacao {
  id: string
  tipo_movimentacao: string
  quantidade: number
  valor_unitario: number | null
  valor_total: number | null
  observacoes: string | null
  created_at: string
  produtos: {
    id: string
    nome: string
    unidade_medida: string
    categorias: {
      nome: string
    }
  }
  usuario_id: {
    profiles: {
      nome: string
    }
  }
}

interface MovimentacoesListProps {
  movimentacoes: Movimentacao[]
}

export function MovimentacoesList({ movimentacoes }: MovimentacoesListProps) {
  const getTipoColor = (tipo: string) => {
    return tipo === "entrada" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getTipoIcon = (tipo: string) => {
    return tipo === "entrada" ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!movimentacoes.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">Nenhuma movimentação encontrada</h3>
            <p className="text-sm text-muted-foreground">
              Não há movimentações registradas com os filtros selecionados.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Movimentações</CardTitle>
        <CardDescription>Últimas movimentações de entrada e saída do estoque</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {movimentacoes.map((movimentacao) => (
            <div key={movimentacao.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">{getTipoIcon(movimentacao.tipo_movimentacao)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{movimentacao.produtos.nome}</p>
                    <Badge className={getTipoColor(movimentacao.tipo_movimentacao)}>
                      {movimentacao.tipo_movimentacao}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(movimentacao.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {movimentacao.usuario_id?.profiles?.nome || "Usuário"}
                    </span>
                  </div>
                  {movimentacao.observacoes && (
                    <p className="text-sm text-muted-foreground mt-1 italic">"{movimentacao.observacoes}"</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {movimentacao.quantidade} {movimentacao.produtos.unidade_medida}
                </div>
                {movimentacao.valor_total && (
                  <div className="text-sm text-muted-foreground">R$ {movimentacao.valor_total.toFixed(2)}</div>
                )}
                {movimentacao.valor_unitario && (
                  <div className="text-xs text-muted-foreground">
                    R$ {movimentacao.valor_unitario.toFixed(2)}/{movimentacao.produtos.unidade_medida}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
