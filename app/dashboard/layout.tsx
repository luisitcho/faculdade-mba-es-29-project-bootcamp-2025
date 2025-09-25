import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/sidebar"
import { ToastNotifications } from "@/components/toast-notifications"
import { Toaster } from "@/components/ui/toaster"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Buscar dados do perfil do usuário com cache busting
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single()
  
  // Debug temporário
  console.log("=== DEBUG PROFILE ===")
  console.log("User ID:", data.user.id)
  console.log("User email:", data.user.email)
  console.log("Profile error:", profileError)
  console.log("Raw profile from DB:", profile)
  console.log("Profile is null?", profile === null)
  console.log("Profile is undefined?", profile === undefined)
  console.log("===================")
  
  // Fallback se não encontrar perfil
  const userProfile = profile || {
    id: data.user.id,
    nome: data.user.email?.split('@')[0] || 'Usuário',
    email: data.user.email || '',
    perfil_acesso: 'consulta',
    ativo: true
  }
  
  // Debug do perfil final
  console.log("Final userProfile:", userProfile)
  console.log("Perfil acesso:", userProfile?.perfil_acesso)
  console.log("Nome:", userProfile?.nome)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={data.user} profile={userProfile} />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <ToastNotifications userId={data.user.id} />
      <Toaster />
    </div>
  )
}
