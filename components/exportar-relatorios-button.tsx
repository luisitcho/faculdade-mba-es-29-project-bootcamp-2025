"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Download, Package, Activity, AlertTriangle } from "lucide-react"
import {
  exportarProdutosParaExcel,
  exportarMovimentacoesParaExcel,
  exportarEstoqueBaixoParaExcel,
} from "@/lib/excel-export"

interface ExportarRelatoriosButtonProps {
  produtos: any[]
  movimentacoes: any[]
}

export function ExportarRelatoriosButton({ produtos, movimentacoes }: ExportarRelatoriosButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportarProdutos = async () => {
    setIsExporting(true)
    try {
      exportarProdutosParaExcel(produtos)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportarMovimentacoes = async () => {
    setIsExporting(true)
    try {
      exportarMovimentacoesParaExcel(movimentacoes)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportarEstoqueBaixo = async () => {
    setIsExporting(true)
    try {
      exportarEstoqueBaixoParaExcel(produtos)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isExporting} className="cursor-pointer">
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Exportando..." : "Exportar Relatório"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleExportarProdutos} className="cursor-pointer">
          <Package className="mr-2 h-4 w-4" />
          Relatório Completo de Produtos
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportarMovimentacoes} className="cursor-pointer">
          <Activity className="mr-2 h-4 w-4" />
          Relatório de Movimentações
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportarEstoqueBaixo} className="cursor-pointer">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Produtos com Estoque Baixo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
