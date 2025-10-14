import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Package } from "lucide-react"
import Link from "next/link"
import { ProdutosUnidadeList } from "@/components/produtos-unidade-list"

export default async function UnidadeDetalhePage({ params }: { params: { id: string } }) {
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

  // Buscar unidade
  const { data: unidade } = await supabase.from("unidades").select("*").eq("id", params.id).single()

  if (!unidade) {
    redirect("/dashboard/unidades")
  }

  // Buscar produtos da unidade
  const { data: produtos } = await supabase
    .from("produtos")
    .select("*, categorias(nome)")
    .eq("unidade_id", params.id)
    .order("nome")

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild>
          <Link href="/dashboard/unidades">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Unidades
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{unidade.nome}</h1>
        <p className="text-muted-foreground">{unidade.descricao}</p>
        {unidade.endereco && <p className="text-sm text-muted-foreground mt-1">{unidade.endereco}</p>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produtos desta Unidade
          </CardTitle>
          <CardDescription>{produtos?.length || 0} produto(s) cadastrado(s) nesta unidade</CardDescription>
        </CardHeader>
        <CardContent>
          <ProdutosUnidadeList produtos={produtos || []} profile={profile} unidadeId={params.id} />
        </CardContent>
      </Card>
    </div>
  )
}
