import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import ExcelJS from "exceljs";

export const GET = async (req: NextRequest) => {
  try {
    const supabase = await createClient();
    const url = new URL(req.url);

    // Captura os filtros da URL
    const categoriaId = url.searchParams.get("categoria");
    const busca = url.searchParams.get("busca");

    // Inicia a query para buscar os produtos já com os filtros da página
    let query = supabase.from("produtos").select("*").eq("ativo", true);

    if (categoriaId && categoriaId !== "all") {
      query = query.eq("categoria_id", categoriaId);
    }
    if (busca) {
      query = query.ilike("nome", `%${busca}%`);
    }

    const { data: produtos, error } = await query.order("nome");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!produtos) {
         return NextResponse.json({ error: "Nenhum produto encontrado" }, { status: 404 });
    }

    // Após buscar os produtos filtrados, faz um segundo filtro em memória
    // para pegar apenas os que têm estoque baixo ou zerado.
    const produtosBaixoEstoque = produtos.filter(
      (p) => (p.estoque_atual ?? 0) <= (p.estoque_minimo ?? 0) && (p.estoque_atual ?? 0) > 0
    );
    const produtosEstoqueZero = produtos.filter((p) => (p.estoque_atual ?? 0) === 0);
    const produtosParaRelatorio = [...produtosEstoqueZero, ...produtosBaixoEstoque];

    // Se não houver produtos para o relatório, retorna um Excel com uma mensagem.
    if (produtosParaRelatorio.length === 0) {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Estoque OK");
        sheet.addRow(["Nenhum produto com estoque baixo ou zerado para os filtros selecionados."]);
        const buffer = await workbook.xlsx.writeBuffer();
        return new Response(buffer, {
          status: 200,
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": "attachment; filename=relatorio_estoque.xlsx",
          },
       });
    }

    // Busca as categorias para mapear os nomes na planilha
    const { data: categorias } = await supabase.from("categorias").select("*");
    const categoriasMap =
      categorias?.reduce((acc, cat) => {
        acc[cat.id] = cat.nome;
        return acc;
      }, {} as Record<string, string>) || {};

    // Cria a planilha e define o cabeçalho
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Estoque Baixo e Zerado");

    sheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Nome", key: "nome", width: 35 },
      { header: "Categoria", key: "categoria_nome", width: 20 },
      { header: "Estoque Atual", key: "estoque_atual", width: 15 },
      { header: "Estoque Mínimo", key: "estoque_minimo", width: 15 },
      { header: "Unidade de Medida", key: "unidade_medida", width: 15 },
      { header: "Valor Unitário", key: "valor_unitario", width: 15 },
      { header: "Status", key: "status", width: 20 },
    ];

    // Adiciona os dados dos produtos na planilha
    produtosParaRelatorio.forEach((p) => {
      sheet.addRow({
        id: p.id,
        nome: p.nome,
        categoria_nome: categoriasMap[p.categoria_id] ?? "Sem Categoria",
        estoque_atual: p.estoque_atual ?? 0,
        estoque_minimo: p.estoque_minimo ?? 0,
        unidade_medida: p.unidade_medida ?? "",
        valor_unitario: p.valor_unitario
          ? p.valor_unitario.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
          : "",
        status: (p.estoque_atual ?? 0) === 0 ? "Zerado" : "Baixo Estoque",
      });
    });

    // Estiliza a linha do cabeçalho
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E293B" },
      };
      cell.alignment = { horizontal: "center" };
    });

    // Gera o buffer do arquivo Excel
    const buffer = await workbook.xlsx.writeBuffer();

    // Retorna o arquivo para download
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          "attachment; filename=relatorio_estoque_baixo.xlsx",
      },
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao exportar relatório de estoque" },
      { status: 500 }
    );
  }
};

