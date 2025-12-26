"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

interface Categoria {
  id: string
  nome: string
}

interface Unidade {
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
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [unidadesSelecionadas, setUnidadesSelecionadas] = useState<string[]>([])
  const [estoquePorUnidade, setEstoquePorUnidade] = useState<Record<string, string>>({})
  const [unidadeMedida, setUnidadeMedida] = useState(produto?.unidade_medida || "")
  const [estoqueMinimo, setEstoqueMinimo] = useState(produto?.estoque_minimo?.toString() || "0")
  const [estoqueAtual, setEstoqueAtual] = useState(produto?.estoque_atual?.toString() || "0")
  const [valorUnitario, setValorUnitario] = useState(produto?.valor_unitario?.toString() || "")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchUnidades = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("unidades").select("id, nome").eq("ativo", true).order("nome")
      if (data) setUnidades(data)

      if (produto?.id) {
        const { data: produtoUnidades } = await supabase
          .from("produto_unidades")
          .select("unidade_id, estoque_local")
          .eq("produto_id", produto.id)

        if (produtoUnidades) {
          const unidadesIds = produtoUnidades.map((pu: any) => pu.unidade_id)
          setUnidadesSelecionadas(unidadesIds)

          const estoques: Record<string, string> = {}
          produtoUnidades.forEach((pu: any) => {
            estoques[pu.unidade_id] = pu.estoque_local.toString()
          })
          setEstoquePorUnidade(estoques)
        }
      }
    }
    fetchUnidades()
  }, [produto])

  // Atualizar estoque total automaticamente quando houver mudanças nas unidades
  useEffect(() => {
    const total = Object.values(estoquePorUnidade).reduce((acc, curr) => {
      return acc + (Number.parseInt(curr) || 0)
    }, 0)
    setEstoqueAtual(total.toString())
  }, [estoquePorUnidade])

  const handleToggleUnidade = (unidadeId: string) => {
    setUnidadesSelecionadas((prev) => {
      if (prev.includes(unidadeId)) {
        // Remover unidade
        const novoEstoque = { ...estoquePorUnidade }
        delete novoEstoque[unidadeId]
        setEstoquePorUnidade(novoEstoque)
        return prev.filter((id) => id !== unidadeId)
      } else {
        // Adicionar unidade
        setEstoquePorUnidade((prev) => ({ ...prev, [unidadeId]: "0" }))
        return [...prev, unidadeId]
      }
    })
  }

  const handleEstoqueUnidadeChange = (unidadeId: string, valor: string) => {
    setEstoquePorUnidade((prev) => ({ ...prev, [unidadeId]: valor }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      if (unidadesSelecionadas.length === 0) {
        throw new Error("Selecione pelo menos uma unidade para o produto")
      }

      const produtoData = {
        nome,
        descricao,
        categoria_id: categoriaId,
        unidade_medida: unidadeMedida,
        estoque_minimo: Number.parseInt(estoqueMinimo),
        estoque_atual: Number.parseInt(estoqueAtual),
        valor_unitario: valorUnitario ? Number.parseFloat(valorUnitario) : null,
      }

      let produtoId = produto?.id

      if (produto) {
        // Atualizar produto existente
        const { error: updateError } = await supabase.from("produtos").update(produtoData).eq("id", produto.id)

        if (updateError) throw updateError
      } else {
        // Criar novo produto
        const { data: novoProduto, error: insertError } = await supabase
          .from("produtos")
          .insert([produtoData])
          .select()
          .single()

        if (insertError) throw insertError
        produtoId = novoProduto.id
      }

      // Remover relacionamentos antigos se estiver editando
      if (produto?.id) {
        await supabase.from("produto_unidades").delete().eq("produto_id", produto.id)
      }

      // Inserir novos relacionamentos
      const produtoUnidadesData = unidadesSelecionadas.map((unidadeId) => ({
        produto_id: produtoId,
        unidade_id: unidadeId,
        estoque_local: Number.parseInt(estoquePorUnidade[unidadeId] || "0"),
      }))

      const { error: relError } = await supabase.from("produto_unidades").insert(produtoUnidadesData)

      if (relError) throw relError

      if (relError) throw relError

      // Voltar para a página anterior (dashboard ou lista de produtos)
      router.back()
      router.refresh()
    } catch (error: unknown) {
      console.error("[v0] Erro ao salvar produto:", error)
      setError(error instanceof Error ? error.message : "Erro ao salvar produto")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="cursor-pointer">
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
                <Select value={categoriaId} onValueChange={setCategoriaId} required>
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

            <div className="space-y-3">
              <Label>Unidades * (selecione uma ou mais)</Label>
              <div className="border rounded-md p-4 space-y-3 max-h-64 overflow-y-auto">
                {unidades.map((unidade) => (
                  <div key={unidade.id} className="flex items-center gap-3">
                    <Checkbox
                      id={`unidade-${unidade.id}`}
                      checked={unidadesSelecionadas.includes(unidade.id)}
                      onCheckedChange={() => handleToggleUnidade(unidade.id)}
                    />
                    <Label htmlFor={`unidade-${unidade.id}`} className="flex-1 cursor-pointer">
                      {unidade.nome}
                    </Label>
                    {unidadesSelecionadas.includes(unidade.id) && (
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`estoque-${unidade.id}`} className="text-sm text-muted-foreground">
                          Estoque:
                        </Label>
                        <Input
                          id={`estoque-${unidade.id}`}
                          type="number"
                          min="0"
                          value={estoquePorUnidade[unidade.id] || "0"}
                          onChange={(e) => handleEstoqueUnidadeChange(unidade.id, e.target.value)}
                          className="w-24 h-8"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {unidades.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma unidade cadastrada.{" "}
                  <Link href="/dashboard/unidades" className="text-primary hover:underline">
                    Cadastre uma unidade
                  </Link>{" "}
                  primeiro.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unidadeMedida">Unidade de Medida *</Label>
                <Input
                  id="unidadeMedida"
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
                <Label htmlFor="estoqueAtual">Estoque Total *</Label>
                <Input
                  id="estoqueAtual"
                  type="number"
                  min="0"
                  value={estoqueAtual}
                  readOnly
                  className="bg-muted cursor-not-allowed"
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
              <Button type="submit" disabled={isLoading} className="flex-1 cursor-pointer">
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Salvando..." : produto ? "Atualizar Produto" : "Cadastrar Produto"}
              </Button>
              <Button type="button" variant="outline" asChild className="cursor-pointer bg-transparent">
                <Link href="/dashboard/produtos">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
