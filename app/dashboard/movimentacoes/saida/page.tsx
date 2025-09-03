import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MovimentacaoForm } from "@/components/movimentacao-form"

export default async function NovaSaidaPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Nova Saída</h1>
        <p className="text-muted-foreground">Registre uma saída de produtos do estoque</p>
      </div>

      <MovimentacaoForm produtos={produtos || []} tipo="saida" userId={data.user.id} />
    </div>
  )
}
