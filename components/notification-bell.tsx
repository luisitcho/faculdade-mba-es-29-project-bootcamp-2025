"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NotificationBellProps {
  userId: string
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0)
  const [ultimasNotificacoes, setUltimasNotificacoes] = useState<any[]>([])

  useEffect(() => {
    const buscarNotificacoes = async () => {
      const supabase = createClient()

      // Buscar notificações não lidas
      const { data: naoLidas } = await supabase
        .from("notificacoes")
        .select("id", { count: "exact" })
        .eq("usuario_id", userId)
        .eq("lida", false)

      // Buscar últimas 5 notificações
      const { data: ultimas } = await supabase
        .from("notificacoes")
        .select("*")
        .eq("usuario_id", userId)
        .order("created_at", { ascending: false })
        .limit(5)

      setNotificacoesNaoLidas(naoLidas?.length || 0)
      setUltimasNotificacoes(ultimas || [])
    }

    buscarNotificacoes()

    // Atualizar a cada 10 segundos (mais frequente)
    const interval = setInterval(buscarNotificacoes, 10000)

    return () => clearInterval(interval)
  }, [userId])

  const formatDate = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Agora"
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`
    return date.toLocaleDateString("pt-BR")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {notificacoesNaoLidas > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {notificacoesNaoLidas > 9 ? "9+" : notificacoesNaoLidas}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notificações
          {notificacoesNaoLidas > 0 && (
            <Badge variant="secondary" className="text-xs">
              {notificacoesNaoLidas} nova{notificacoesNaoLidas !== 1 ? "s" : ""}
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ultimasNotificacoes.length > 0 ? (
          <>
            {ultimasNotificacoes.map((notificacao) => (
              <DropdownMenuItem key={notificacao.id} className="flex flex-col items-start p-3 cursor-pointer">
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-medium text-sm">{notificacao.titulo}</span>
                  {!notificacao.lida && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                </div>
                <p className="text-xs text-muted-foreground mb-1 line-clamp-2">{notificacao.mensagem}</p>
                <span className="text-xs text-muted-foreground">{formatDate(notificacao.created_at)}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/notificacoes" className="w-full text-center">
                Ver todas as notificações
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem disabled>Nenhuma notificação</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
