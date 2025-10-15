import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MovimentacaoForm } from "@/components/movimentacao-form"

export const dynamic = 'force-dynamic'

export default async function NovaEntradaPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Verificar permissões
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (profile?.perfil_acesso !== "admin" && profile?.perfil_acesso !== "operador") {
    redirect("/dashboard/movimentacoes")
  }

  // Buscar produtos
  const { data: produtos } = await supabase
    .from("produtos")
    .select(`
      *,
      categorias (
        nome
      )
    `)
    .eq("ativo", true)
    .order("nome")

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nova Entrada</h1>
        <p className="text-muted-foreground">Registre uma entrada de produtos no estoque</p>
      </div>

      <MovimentacaoForm produtos={produtos || []} tipo="entrada" userId={data.user.id} />
    </div>
  )
}
