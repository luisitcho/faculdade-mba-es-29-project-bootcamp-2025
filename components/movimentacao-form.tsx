"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface Produto {
  id: string
  nome: string
  estoque_atual: number
  unidade_medida: string
  categorias: {
    nome: string
  }
}

interface MovimentacaoFormProps {
  produtos: Produto[]
  tipo: "entrada" | "saida"
  userId: string
}

export function MovimentacaoForm({ produtos, tipo, userId }: MovimentacaoFormProps) {
  const [produtoId, setProdutoId] = useState("")
  const [quantidade, setQuantidade] = useState("")
  const [valorUnitario, setValorUnitario] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const produtoSelecionado = produtos.find((p) => p.id === produtoId)
  const valorTotal = quantidade && valorUnitario ? Number.parseFloat(quantidade) * Number.parseFloat(valorUnitario) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // Validar estoque para saídas
      if (tipo === "saida" && produtoSelecionado) {
        const quantidadeNum = Number.parseInt(quantidade)
        if (quantidadeNum > produtoSelecionado.estoque_atual) {
          throw new Error(`Estoque insuficiente. Disponível: ${produtoSelecionado.estoque_atual}`)
        }
      }

      const movimentacaoData = {
        produto_id: produtoId,
        tipo_movimentacao: tipo,
        quantidade: Number.parseInt(quantidade),
        valor_unitario: valorUnitario ? Number.parseFloat(valorUnitario) : null,
        valor_total: valorTotal > 0 ? valorTotal : null,
        observacoes: observacoes || null,
        usuario_id: userId,
      }

      const { error } = await supabase.from("movimentacoes").insert([movimentacaoData])

      if (error) throw error

      router.push("/dashboard/movimentacoes")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao registrar movimentação")
    } finally {
      setIsLoading(false)
    }
  }

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

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/movimentacoes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Movimentações
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {tipo === "entrada" ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            {tipo === "entrada" ? "Nova Entrada" : "Nova Saída"}
          </CardTitle>
          <CardDescription>
            {tipo === "entrada"
              ? "Registre produtos que estão entrando no estoque"
              : "Registre produtos que estão saindo do estoque"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="produto">Produto *</Label>
              <Select value={produtoId} onValueChange={setProdutoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map((produto) => (
                    <SelectItem key={produto.id} value={produto.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{produto.nome}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          Estoque: {produto.estoque_atual} {produto.unidade_medida}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {produtoSelecionado && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{produtoSelecionado.nome}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getCategoriaColor(produtoSelecionado.categorias.nome)}>
                          {produtoSelecionado.categorias.nome}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Estoque atual: {produtoSelecionado.estoque_atual} {produtoSelecionado.unidade_medida}
                        </span>
                      </div>
                    </div>
                    {tipo === "saida" && produtoSelecionado.estoque_atual === 0 && (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">Sem estoque</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  placeholder="Ex: 10"
                  required
                />
                {produtoSelecionado && (
                  <p className="text-xs text-muted-foreground">Unidade: {produtoSelecionado.unidade_medida}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor Unitário (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorUnitario}
                  onChange={(e) => setValorUnitario(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            {valorTotal > 0 && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Valor Total: R$ {valorTotal.toFixed(2)}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações sobre esta movimentação (opcional)"
                rows={3}
              />
            </div>

            {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading || !produtoId || !quantidade} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Registrando..." : `Registrar ${tipo === "entrada" ? "Entrada" : "Saída"}`}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/movimentacoes">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
