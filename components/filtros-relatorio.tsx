"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText } from "lucide-react"

interface FiltrosRelatorioProps {
  categorias: any[]
  searchParams: {
    tipo?: string
    periodo?: string
    categoria?: string
  }
}

export function FiltrosRelatorio({ categorias, searchParams }: FiltrosRelatorioProps) {
  const router = useRouter()
  const [filtros, setFiltros] = useState({
    tipo: searchParams.tipo || "estoque",
    periodo: searchParams.periodo || "mes",
    categoria: searchParams.categoria || "all",
  })

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }))
  }

  const handleGerarRelatorio = () => {
    const params = new URLSearchParams();
    if (filtros.tipo !== "estoque") params.set("tipo", filtros.tipo);
    if (filtros.periodo !== "mes") params.set("periodo", filtros.periodo);
    if (filtros.categoria !== "all") params.set("categoria", filtros.categoria);

    // Chamar endpoint de exportação em Excel
    const queryString = params.toString();
    const url = `/api/produtos/exportar${queryString ? `?${queryString}` : ""}`;

    // Abrir em nova aba para download
    window.open(url, "_blank");
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros de Relatório</CardTitle>
        <CardDescription>Personalize os relatórios selecionando os filtros desejados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            value={filtros.tipo}
            onValueChange={(valor) => handleFiltroChange("tipo", valor)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo de relatório" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="estoque">Relatório de Estoque</SelectItem>
              <SelectItem value="movimentacoes">Relatório de Movimentações</SelectItem>
              <SelectItem value="categorias">Relatório por Categoria</SelectItem>
              <SelectItem value="usuarios">Relatório por Usuário</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filtros.periodo}
            onValueChange={(valor) => handleFiltroChange("periodo", valor)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes">Este Mês</SelectItem>
              <SelectItem value="trimestre">Este Trimestre</SelectItem>
              <SelectItem value="ano">Este Ano</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filtros.categoria}
            onValueChange={(valor) => handleFiltroChange("categoria", valor)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {categorias?.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleGerarRelatorio} className="w-full cursor-pointer">
            <FileText className="mr-2 h-4 w-4" />
            Gerar Relatório
          </Button>

        </div>
      </CardContent>
    </Card>
  )
}
