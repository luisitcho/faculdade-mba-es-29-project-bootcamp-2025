"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, AlertTriangle, Package, Save, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Produto {
  id: string
  nome: string
  descricao: string
  unidade_medida: string
  estoque_minimo: number
  estoque_atual: number
  valor_unitario: number
  categorias: {
    id: string
    nome: string
  }
}

interface ProdutosListProps {
  produtos: Produto[]
  podeEditar: boolean
}

export function ProdutosList({ produtos, podeEditar }: ProdutosListProps) {
  const [editandoEstoque, setEditandoEstoque] = useState<string | null>(null)
  const [novoEstoque, setNovoEstoque] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "Alimentação":
        return "bg-green-100 text-green-800"
      case "Higiene/Limpeza":
        return "bg-blue-100 text-blue-800"
      case "Pedagógico":
        return "bg-purple-100 text-purple-800"
      case "Bens":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEstoqueStatus = (atual: number, minimo: number) => {
    if (atual <= minimo) {
      return { color: "bg-red-100 text-red-800", text: "Baixo" }
    } else if (atual <= minimo * 1.5) {
      return { color: "bg-yellow-100 text-yellow-800", text: "Atenção" }
    } else {
      return { color: "bg-green-100 text-green-800", text: "Normal" }
    }
  }

  const handleEditarEstoque = (produtoId: string, estoqueAtual: number) => {
    setEditandoEstoque(produtoId)
    setNovoEstoque(estoqueAtual.toString())
  }

  const handleSalvarEstoque = async (produtoId: string) => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("produtos")
        .update({ estoque_atual: Number.parseInt(novoEstoque) })
        .eq("id", produtoId)

      if (error) throw error

      setEditandoEstoque(null)
      router.refresh()
    } catch (error) {
      console.error("Erro ao atualizar estoque:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelarEdicao = () => {
    setEditandoEstoque(null)
    setNovoEstoque("")
  }

  const handleRemoverProduto = async (produtoId: string) => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("produtos").update({ ativo: false }).eq("id", produtoId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Erro ao remover produto:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!produtos.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">Nenhum produto encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Não há produtos cadastrados com os filtros selecionados.
            </p>
            {podeEditar && (
              <Button asChild>
                <Link href="/dashboard/produtos/novo">Cadastrar Primeiro Produto</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {produtos.map((produto) => {
        const estoqueStatus = getEstoqueStatus(produto.estoque_atual, produto.estoque_minimo)
        const estoqueBaixo = produto.estoque_atual <= produto.estoque_minimo

        return (
          <Card key={produto.id} className={estoqueBaixo ? "border-orange-200" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{produto.nome}</CardTitle>
                  <CardDescription className="mt-1">{produto.descricao}</CardDescription>
                </div>
                {estoqueBaixo && <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 ml-2" />}
              </div>
              <div className="flex gap-2">
                <Badge className={getCategoriaColor(produto.categorias?.nome || "")}>
                  {produto.categorias?.nome || "Sem Categoria"}
                </Badge>
                <Badge className={estoqueStatus.color}>{estoqueStatus.text}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Estoque Atual</p>
                  {editandoEstoque === produto.id ? (
                    <div className="flex items-center gap-1 mt-1">
                      <Input
                        type="number"
                        value={novoEstoque}
                        onChange={(e) => setNovoEstoque(e.target.value)}
                        className="h-8 text-sm"
                        min="0"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleSalvarEstoque(produto.id)}
                        disabled={isLoading}
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={handleCancelarEdicao}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {produto.estoque_atual} {produto.unidade_medida}
                      </p>
                      {podeEditar && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => handleEditarEstoque(produto.id, produto.estoque_atual)}
                        >
                          <Package className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground">Estoque Mínimo</p>
                  <p className="font-medium">
                    {produto.estoque_minimo} {produto.unidade_medida}
                  </p>
                </div>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Valor Unitário</p>
                <p className="font-medium">
                  {produto.valor_unitario ? `R$ ${produto.valor_unitario.toFixed(2)}` : "Não informado"}
                </p>
              </div>
              {podeEditar && (
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                    <Link href={`/dashboard/produtos/${produto.id}/editar`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive bg-transparent"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover Produto</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover o produto "{produto.nome}"? Esta ação não pode ser desfeita e o
                          produto será desativado do sistema.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoverProduto(produto.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
