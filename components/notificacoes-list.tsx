"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, Package, TrendingUp, Settings, Check, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

interface Notificacao {
  id: string
  tipo: string
  titulo: string
  mensagem: string
  lida: boolean
  data_leitura: string | null
  metadata: any
  created_at: string
}

interface NotificacoesListProps {
  notificacoes: Notificacao[]
}

export function NotificacoesList({ notificacoes }: NotificacoesListProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()

  const marcarComoLida = async (notificacaoId: string) => {
    setIsLoading(notificacaoId)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("notificacoes")
        .update({
          lida: true,
          data_leitura: new Date().toISOString(),
        })
        .eq("id", notificacaoId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "estoque_baixo":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "estoque_zero":
        return <Package className="h-4 w-4 text-red-600" />
      case "movimentacao":
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      case "sistema":
        return <Settings className="h-4 w-4 text-gray-600" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "estoque_baixo":
        return "bg-orange-100 text-orange-800"
      case "estoque_zero":
        return "bg-red-100 text-red-800"
      case "movimentacao":
        return "bg-blue-100 text-blue-800"
      case "sistema":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "estoque_baixo":
        return "Estoque Baixo"
      case "estoque_zero":
        return "Sem Estoque"
      case "movimentacao":
        return "Movimentação"
      case "sistema":
        return "Sistema"
      default:
        return "Notificação"
    }
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

  if (!notificacoes.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">Nenhuma notificação</h3>
            <p className="text-sm text-muted-foreground">Você não possui notificações no momento.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suas Notificações</CardTitle>
        <CardDescription>Lista de todas as suas notificações, das mais recentes para as mais antigas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notificacoes.map((notificacao) => (
            <div
              key={notificacao.id}
              className={`flex items-start justify-between p-4 border rounded-lg transition-colors ${
                !notificacao.lida ? "bg-blue-50 border-blue-200" : "bg-background"
              }`}
            >
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0 mt-1">{getTipoIcon(notificacao.tipo)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{notificacao.titulo}</h4>
                    <Badge className={getTipoColor(notificacao.tipo)}>{getTipoLabel(notificacao.tipo)}</Badge>
                    {!notificacao.lida && <Badge variant="default">Nova</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notificacao.mensagem}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatDate(notificacao.created_at)}</span>
                    {notificacao.lida && notificacao.data_leitura && (
                      <span>Lida em {formatDate(notificacao.data_leitura)}</span>
                    )}
                  </div>
                  {/* Metadata adicional */}
                  {notificacao.metadata &&
                    (notificacao.tipo === "estoque_baixo" || notificacao.tipo === "estoque_zero") && (
                      <div className="mt-2 p-2 bg-muted rounded-md text-xs">
                        <p>
                          <strong>Produto:</strong> {notificacao.metadata.produto_nome}
                        </p>
                        <p>
                          <strong>Estoque atual:</strong> {notificacao.metadata.estoque_atual}{" "}
                          {notificacao.metadata.unidade_medida}
                        </p>
                        <p>
                          <strong>Estoque mínimo:</strong> {notificacao.metadata.estoque_minimo}{" "}
                          {notificacao.metadata.unidade_medida}
                        </p>
                      </div>
                    )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {!notificacao.lida && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => marcarComoLida(notificacao.id)}
                    disabled={isLoading === notificacao.id}
                  >
                    {isLoading === notificacao.id ? (
                      "Marcando..."
                    ) : (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Marcar como Lida
                      </>
                    )}
                  </Button>
                )}
                {notificacao.lida && (
                  <Badge variant="secondary" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Lida
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
