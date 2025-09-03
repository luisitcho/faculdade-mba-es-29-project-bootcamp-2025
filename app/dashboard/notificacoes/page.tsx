import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, BellOff, Check, AlertTriangle, Package, Settings } from "lucide-react"
import { NotificacoesList } from "@/components/notificacoes-list"

export default async function NotificacoesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Buscar notificações do usuário
  const { data: notificacoes } = await supabase
    .from("notificacoes")
    .select("*")
    .eq("usuario_id", data.user.id)
    .order("created_at", { ascending: false })

  // Estatísticas
  const totalNotificacoes = notificacoes?.length || 0
  const naoLidas = notificacoes?.filter((n) => !n.lida).length || 0
  const estoqueBaixo = notificacoes?.filter((n) => n.tipo === "estoque_baixo" && !n.lida).length || 0
  const estoqueZero = notificacoes?.filter((n) => n.tipo === "estoque_zero" && !n.lida).length || 0

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Central de Notificações</h1>
          <p className="text-muted-foreground">Acompanhe alertas e notificações importantes do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
          <Button>
            <Check className="mr-2 h-4 w-4" />
            Marcar Todas como Lidas
          </Button>
        </div>
      </div>

      {/* Resumo de Notificações */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Notificações</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNotificacoes}</div>
            <p className="text-xs text-muted-foreground">Todas as notificações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
            <BellOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{naoLidas}</div>
            <p className="text-xs text-muted-foreground">Precisam de atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{estoqueBaixo}</div>
            <p className="text-xs text-muted-foreground">Alertas de estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{estoqueZero}</div>
            <p className="text-xs text-muted-foreground">Produtos zerados</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros Rápidos</CardTitle>
          <CardDescription>Filtre notificações por tipo ou status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Todas ({totalNotificacoes})
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Não Lidas ({naoLidas})
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Estoque Baixo ({estoqueBaixo})
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Sem Estoque ({estoqueZero})
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Movimentações
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Sistema
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Notificações */}
      <NotificacoesList notificacoes={notificacoes || []} />
    </div>
  )
}
