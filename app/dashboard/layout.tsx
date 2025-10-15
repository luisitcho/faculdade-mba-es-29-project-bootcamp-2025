import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/sidebar"
import { ToastNotifications } from "@/components/toast-notifications"
import { Toaster } from "@/components/ui/toaster"

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
      console.error("Erro de autenticação no layout:", error)
      redirect("/auth/login")
    }

    // Buscar dados do perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (profileError) {
      console.error("Erro ao buscar perfil no layout:", profileError)
      redirect("/auth/login")
    }

    return (
      <div className="flex h-screen bg-background">
        <Sidebar user={data.user} profile={profile} />
        <main className="flex-1 overflow-y-auto">{children}</main>
        <ToastNotifications userId={data.user.id} />
        <Toaster />
      </div>
    )
  } catch (error) {
    console.error("Erro geral no layout do dashboard:", error)
    redirect("/auth/login")
  }
}
