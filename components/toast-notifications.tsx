"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Package, TrendingUp, Bell } from "lucide-react"

interface ToastNotificationsProps {
  userId: string
}

export function ToastNotifications({ userId }: ToastNotificationsProps) {
  const { toast } = useToast()
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Buscar a última notificação ao carregar
    const buscarUltimaNotificacao = async () => {
      const { data } = await supabase
        .from("notificacoes")
        .select("id")
        .eq("usuario_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)

      if (data && data.length > 0) {
        setLastNotificationId(data[0].id)
      }
    }

    buscarUltimaNotificacao()

    // Configurar subscription para novas notificações
    const subscription = supabase
      .channel("notificacoes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notificacoes",
          filter: `usuario_id=eq.${userId}`,
        },
        (payload) => {
          const notificacao = payload.new as any

          // Só mostrar toast se não for a primeira carga
          if (lastNotificationId) {
            const getIcon = (tipo: string) => {
              switch (tipo) {
                case "estoque_baixo":
                  return AlertTriangle
                case "estoque_zero":
                  return Package
                case "movimentacao":
                  return TrendingUp
                default:
                  return Bell
              }
            }

            const Icon = getIcon(notificacao.tipo)

            toast({
              title: notificacao.titulo,
              description: notificacao.mensagem,
              action: <Icon className="h-4 w-4" />,
            })
          }

          setLastNotificationId(notificacao.id)
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId, toast, lastNotificationId])

  return null
}
