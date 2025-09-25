// app/dashboard/produtos/page.tsx

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Package,
  AlertTriangle,
  FileDown,
} from "lucide-react";
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
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Erro ao obter usuário:", userError.message);
  }

  if (!user) {
    return redirect("/auth/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Erro ao obter perfil:", profileError.message);
  }

  const { data: categorias, error: categoriasError } = await supabase
    .from("categorias")
    .select("*")
    .order("nome");

  if (categoriasError) {
    console.error("Erro ao obter categorias:", categoriasError.message);
  }

  let query = supabase
    .from("produtos")
    .select("*")
    .eq("ativo", true);

  if (searchParams?.categoria) {
    query = query.eq("categoria_id", searchParams.categoria);
  }

  if (searchParams?.busca) {
    query = query.ilike("nome", `%${searchParams.busca}%`);
  }

  const { data: produtos, error: produtosError } = await query.order("nome");

  if (produtosError) {
    console.error("Erro ao obter produtos:", produtosError.message);
  }

  const totalProdutos = produtos?.length ?? 0;
  const produtosBaixoEstoque =
    produtos?.filter(
      (p) => p.estoque_atual <= p.estoque_minimo
    ).length ?? 0;
  const valorTotalEstoque =
    produtos?.reduce(
      (total, p) =>
        total + (p.estoque_atual ?? 0) * (p.valor_unitario ?? 0),
      0
    ) ?? 0;

  const isMainAdmin =
    profile?.email === "admin@admin.com" &&
    profile?.perfil_acesso === "admin";

  const podeEditar =
    isMainAdmin ||
    ["super_admin", "admin", "operador"].includes(
      profile?.perfil_acesso ?? ""
    );

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestão de Produtos
          </h1>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProdutos}</div>
            <p className="text-xs text-muted-foreground">
              Produtos ativos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estoque Baixo
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {produtosBaixoEstoque}
            </div>
            <p className="text-xs text-muted-foreground">
              Precisam reposição
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Total Estoque
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {valorTotalEstoque.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor em estoque
            </p>
          </CardContent>
        </Card>
      </div>

      <FiltrosProdutos categorias={categorias ?? []} />

      <ProdutosList produtos={produtos ?? []} podeEditar={podeEditar} />
    </div>
  );
}
