import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProdutoForm } from "@/components/produto-form"

export default async function NovoProdutoPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Verificar permissões
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (profile?.perfil_acesso !== "admin" && profile?.perfil_acesso !== "operador") {
    redirect("/dashboard/produtos")
  }

  // Buscar categorias
  const { data: categorias } = await supabase.from("categorias").select("*").order("nome")

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Produto</h1>
        <p className="text-muted-foreground">Cadastre um novo produto no sistema</p>
      </div>

      <ProdutoForm categorias={categorias || []} />
    </div>
  )
}
