import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProdutoForm } from "@/components/produto-form"

export const dynamic = 'force-dynamic'

export default async function EditarProdutoPage({
  params,
}: {
  params: { id: string }
}) {
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

  // Buscar produto
  const { data: produto } = await supabase.from("produtos").select("*").eq("id", params.id).single()

  if (!produto) {
    notFound()
  }

  // Buscar categorias
  const { data: categorias } = await supabase.from("categorias").select("*").order("nome")

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Produto</h1>
        <p className="text-muted-foreground">Edite as informações do produto {produto.nome}</p>
      </div>

      <ProdutoForm categorias={categorias || []} produto={produto} />
    </div>
  )
}
