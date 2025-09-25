// components/notificacoes-list.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, AlertTriangle, Info, Bell } from "lucide-react"

interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  tipo: string
  lida: boolean
  created_at: string
}

interface NotificacoesListProps {
  notificacoes: Notificacao[]
  marcarComoLida: (id: string) => Promise<{ success: boolean; error?: string }>
}

export function NotificacoesList({ notificacoes, marcarComoLida }: NotificacoesListProps) {
  const handleMarcarComoLida = async (id: string) => {
    const result = await marcarComoLida(id)
    if (result.success) {
      // Recarregar a página para refletir as mudanças
      window.location.reload()
    } else {
      console.error("Erro ao marcar como lida:", result.error)
    }
  }

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida)
  const notificacoesLidas = notificacoes.filter(n => n.lida)

  return (
    <div className="space-y-6">
      {/* Notificações Não Lidas */}
      {notificacoesNaoLidas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Notificações Não Lidas ({notificacoesNaoLidas.length})
            </CardTitle>
            <CardDescription>Notificações que precisam de sua atenção</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notificacoesNaoLidas.map((notificacao) => (
              <div key={notificacao.id} className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50">
                <div className="flex items-start gap-3 flex-1">
                  {notificacao.tipo === "warning" && <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />}
                  {notificacao.tipo === "info" && <Info className="h-5 w-5 text-blue-600 mt-0.5" />}
                  <div className="flex-1">
                    <h4 className="font-medium text-orange-900">{notificacao.titulo}</h4>
                    <p className="text-sm text-orange-800 mt-1">{notificacao.mensagem}</p>
                    <p className="text-xs text-orange-700 mt-2">
                      {new Date(notificacao.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleMarcarComoLida(notificacao.id)}
                  size="sm" 
                  variant="outline"
                  className="ml-4"
                >
                  <Check className="h-4 w-4" />
                  Marcar como lida
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Notificações Lidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-600">
            <Bell className="h-5 w-5" />
            Notificações Lidas ({notificacoesLidas.length})
          </CardTitle>
          <CardDescription>Notificações já visualizadas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificacoesLidas.length > 0 ? (
            notificacoesLidas.map((notificacao) => (
              <div key={notificacao.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-75">
                <div className="flex items-start gap-3">
                  {notificacao.tipo === "warning" && <AlertTriangle className="h-5 w-5 text-gray-600 mt-0.5" />}
                  {notificacao.tipo === "info" && <Info className="h-5 w-5 text-gray-600 mt-0.5" />}
                  <div>
                    <h4 className="font-medium text-gray-700 line-through">{notificacao.titulo}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notificacao.mensagem}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notificacao.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhuma notificação lida</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}