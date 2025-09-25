// app/dashboard/produtos/page.tsx

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, AlertTriangle, FileDown } from "lucide-react";
import Link from "next/link";
import { ProdutosList } from "@/components/produtos-list";
import { FiltrosProdutos } from "@/components/filtros-produtos";

interface SearchParams {
  categoria?: string;
  busca?: string;
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // [CORREÇÃO] A função createClient não é assíncrona, então não precisa de 'await'
  const supabase = createClient();

  const { data: { user }, } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: categorias } = await supabase
    .from("categorias")
    .select("*")
    .order("nome");

  let query = supabase
    .from("produtos")
    .select(`*, categorias (id, nome)`) // Sintaxe mais segura se a relação estiver configurada
    .eq("ativo", true);

  if (searchParams.categoria) {
    query = query.eq("categoria_id", searchParams.categoria);
  }
  if (searchParams.busca) {
    query = query.ilike("nome", `%${searchParams.busca}%`);
  }

  console.log(query)

  const { data: produtos, error: produtosError } = await query.order("nome");
  if (produtosError) {
    console.error("Supabase error fetching produtos:", produtosError.message);
  }

  const totalProdutos = produtos?.length || 0;
  const produtosBaixoEstoque =
    produtos?.filter((p) => p.estoque_atual <= p.estoque_minimo).length || 0;
  const valorTotalEstoque =
    produtos?.reduce(
      (total, p) => total + p.estoque_atual * (p.valor_unitario || 0),
      0
    ) || 0;

  const isMainAdmin =
    profile?.email === "admin@admin.com" && profile?.perfil_acesso === "admin";
  const podeEditar =
    isMainAdmin ||
    ["super_admin", "admin", "operador"].includes(profile?.perfil_acesso || "");

  return (
    
    <div className="flex-1 space-y-6 p-6">
      {console.log("User Profile in ProdutosPage:", profile)}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie o catálogo de produtos por categoria
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/produtos/exportar">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Link>
          </Button>
          {podeEditar && (
            <Button asChild>
              <Link href="/dashboard/produtos/novo">
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Cards de estatísticas... */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalProdutos}</div>
                <p className="text-xs text-muted-foreground">Produtos ativos</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-orange-600">{produtosBaixoEstoque}</div>
                <p className="text-xs text-muted-foreground">Precisam reposição</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total Estoque</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">R$ {valorTotalEstoque.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Valor em estoque</p>
            </CardContent>
        </Card>
      </div>

      <FiltrosProdutos categorias={categorias || []} />

      <ProdutosList produtos={produtos || []} podeEditar={podeEditar} />
    </div>
  );
}