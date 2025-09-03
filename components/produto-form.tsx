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
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

interface Categoria {
  id: string
  nome: string
}

interface ProdutoFormProps {
  categorias: Categoria[]
  produto?: any
}

export function ProdutoForm({ categorias, produto }: ProdutoFormProps) {
  const [nome, setNome] = useState(produto?.nome || "")
  const [descricao, setDescricao] = useState(produto?.descricao || "")
  const [categoriaId, setCategoriaId] = useState(produto?.categoria_id || "")
  const [unidadeMedida, setUnidadeMedida] = useState(produto?.unidade_medida || "")
  const [estoqueMinimo, setEstoqueMinimo] = useState(produto?.estoque_minimo?.toString() || "0")
  const [estoqueAtual, setEstoqueAtual] = useState(produto?.estoque_atual?.toString() || "0")
  const [valorUnitario, setValorUnitario] = useState(produto?.valor_unitario?.toString() || "")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const produtoData = {
        nome,
        descricao,
        categoria_id: categoriaId,
        unidade_medida: unidadeMedida,
        estoque_minimo: Number.parseInt(estoqueMinimo),
        estoque_atual: Number.parseInt(estoqueAtual),
        valor_unitario: valorUnitario ? Number.parseFloat(valorUnitario) : null,
      }

      let result
      if (produto) {
        // Editar produto existente
        result = await supabase.from("produtos").update(produtoData).eq("id", produto.id)
      } else {
        // Criar novo produto
        result = await supabase.from("produtos").insert([produtoData])
      }

      if (result.error) throw result.error

      router.push("/dashboard/produtos")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao salvar produto")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/produtos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Produtos
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{produto ? "Editar Produto" : "Novo Produto"}</CardTitle>
          <CardDescription>
            {produto ? "Edite as informações do produto" : "Preencha as informações do novo produto"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Produto *</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Arroz Integral 1kg"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select value={categoriaId} onValueChange={setCategoriaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição detalhada do produto"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unidade">Unidade de Medida *</Label>
                <Input
                  id="unidade"
                  value={unidadeMedida}
                  onChange={(e) => setUnidadeMedida(e.target.value)}
                  placeholder="Ex: kg, un, lt"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estoqueMinimo">Estoque Mínimo *</Label>
                <Input
                  id="estoqueMinimo"
                  type="number"
                  min="0"
                  value={estoqueMinimo}
                  onChange={(e) => setEstoqueMinimo(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estoqueAtual">Estoque Atual *</Label>
                <Input
                  id="estoqueAtual"
                  type="number"
                  min="0"
                  value={estoqueAtual}
                  onChange={(e) => setEstoqueAtual(e.target.value)}
                  required
                />
              </div>
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

            {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Salvando..." : produto ? "Atualizar Produto" : "Cadastrar Produto"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/produtos">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
