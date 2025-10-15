import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import ExcelJS from "exceljs";

export const GET = async (req: NextRequest) => {
  try {
    const supabase = await createClient();
    const url = new URL(req.url);
    const categoriaId = url.searchParams.get("categoria");
    const busca = url.searchParams.get("busca");

    // Buscar produtos
    let query = supabase.from("produtos").select("*").eq("ativo", true);

    if (categoriaId && categoriaId !== "all")
      query = query.eq("categoria_id", categoriaId);
    if (busca) query = query.ilike("nome", `%${busca}%`);

    const { data: produtos, error } = await query.order("nome");
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    // Buscar categorias para mostrar o nome
    const { data: categorias } = await supabase.from("categorias").select("*");
    const categoriasMap =
      categorias?.reduce((acc, cat) => {
        acc[cat.id] = cat.nome;
        return acc;
      }, {} as Record<string, string>) || {};

    // Criar planilha
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Produtos");

    // Cabeçalho
    sheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Nome", key: "nome", width: 30 },
      { header: "Categoria", key: "categoria_nome", width: 20 },
      { header: "Estoque Atual", key: "estoque_atual", width: 15 },
      { header: "Estoque Mínimo", key: "estoque_minimo", width: 15 },
      { header: "Valor Unitário", key: "valor_unitario", width: 15 },
      { header: "Unidade de Medida", key: "unidade_medida", width: 15 },
      { header: "Ativo", key: "ativo", width: 10 },
    ];

    // Adicionar dados
    produtos?.forEach((p) => {
      sheet.addRow({
        id: p.id,
        nome: p.nome,
        categoria_nome: categoriasMap[p.categoria_id] || "",
        estoque_atual: p.estoque_atual,
        estoque_minimo: p.estoque_minimo,
        valor_unitario: p.valor_unitario
          ? p.valor_unitario.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          : "",
        unidade_medida: p.unidade_medida,
        ativo: p.ativo ? "Sim" : "Não",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=produtos.xlsx",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao exportar produtos" },
      { status: 500 }
    );
  }
};
