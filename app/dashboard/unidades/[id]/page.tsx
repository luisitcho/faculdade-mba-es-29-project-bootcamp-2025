import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Package } from "lucide-react"
import Link from "next/link"
import { ProdutosUnidadeList } from "@/components/produtos-unidade-list"

export const dynamic = 'force-dynamic'

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

  const { data: produtoUnidades } = await supabase
    .from("produto_unidades")
    .select("produto_id, estoque_local")
    .eq("unidade_id", params.id)

  // Buscar detalhes dos produtos
  const produtoIds = produtoUnidades?.map((pu) => pu.produto_id) || []

  let produtosRaw: any[] = []
  if (produtoIds.length > 0) {
    const { data } = await supabase.from("produtos").select("*").in("id", produtoIds).order("nome")
    produtosRaw = data || []
  }

  const { data: categorias } = await supabase.from("categorias").select("*")

  // Combinar produtos com estoque local da unidade
  const produtos = produtosRaw?.map((produto) => {
    const categoria = categorias?.find((c) => c.id === produto.categoria_id)
    const produtoUnidade = produtoUnidades?.find((pu) => pu.produto_id === produto.id)
    return {
      ...produto,
      estoque_atual: produtoUnidade?.estoque_local || 0, // Usar estoque local da unidade
      categorias: categoria ? { nome: categoria.nome } : null,
    }
  })

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
