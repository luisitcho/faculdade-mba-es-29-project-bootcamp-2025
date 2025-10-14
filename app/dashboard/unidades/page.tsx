import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UnidadesList } from "@/components/unidades-list"

export default async function UnidadesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Buscar unidades
  const { data: unidades } = await supabase.from("unidades").select("*").order("nome")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Unidades</h1>
        <p className="text-muted-foreground">Gerencie as unidades do sistema de estoque</p>
      </div>

      <UnidadesList unidades={unidades || []} profile={profile} />
    </div>
  )
}
