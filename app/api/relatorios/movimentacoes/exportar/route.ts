import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import ExcelJS from "exceljs";

export const GET = async (req: NextRequest) => {
  try {
    const supabase = await createClient();
    const url = new URL(req.url);

    // Filtros opcionais (caso queira por data depois)
    const dataInicio = url.searchParams.get("inicio");
    const dataFim = url.searchParams.get("fim");

    // Buscar movimentações com produto e categoria
    let query = supabase
      .from("movimentacoes")
      .select(
        `
        id,
        tipo_movimentacao,
        quantidade,
        valor_total,
        created_at,
        produtos (
          nome,
          unidade_medida,
          categorias ( nome )
        )
      `
      )
      .order("created_at", { ascending: false });

    if (dataInicio) query = query.gte("created_at", dataInicio);
    if (dataFim) query = query.lte("created_at", dataFim);

    const { data: movimentacoes, error } = await query;
    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Criar planilha
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Movimentações");

    // Cabeçalhos
    sheet.columns = [
      { header: "ID", key: "id", width: 36 },
      { header: "Tipo de Movimentação", key: "tipo", width: 20 },
      { header: "Produto", key: "produto", width: 30 },
      { header: "Categoria", key: "categoria", width: 20 },
      { header: "Quantidade", key: "quantidade", width: 15 },
      { header: "Unidade", key: "unidade", width: 15 },
      { header: "Valor Total (R$)", key: "valor_total", width: 20 },
      { header: "Data", key: "data", width: 20 },
    ];

    // Linhas
    movimentacoes?.forEach((m) => {
      sheet.addRow({
        id: m.id,
        tipo: m.tipo_movimentacao === "entrada" ? "Entrada" : "Saída",
        produto: m.produtos?.nome || "—",
        categoria: m.produtos?.categorias?.nome || "—",
        quantidade: m.quantidade,
        unidade: m.produtos?.unidade_medida || "—",
        valor_total: m.valor_total
          ? m.valor_total.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          : "—",
        data: new Date(m.created_at).toLocaleString("pt-BR"),
      });
    });

    // Estilo do cabeçalho
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E293B" },
      };
      cell.alignment = { horizontal: "center" };
    });

    // Gerar buffer Excel
    const buffer = await workbook.xlsx.writeBuffer();

    // Retornar arquivo Excel
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=relatorio_movimentacoes_${
          new Date().toISOString().split("T")[0]
        }.xlsx`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao exportar movimentações" },
      { status: 500 }
    );
  }
};
