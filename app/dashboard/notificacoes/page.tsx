import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NotificacoesPageClient } from "@/components/notificacoes-page-client"

export default async function NotificacoesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return <NotificacoesPageClient />
}
