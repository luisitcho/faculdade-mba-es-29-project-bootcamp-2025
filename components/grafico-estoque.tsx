"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface Produto {
  id: string
  nome: string
  estoque_atual: number
  estoque_minimo: number
  valor_unitario: number | null
  categorias: {
    id: string
    nome: string
  }
}

interface GraficoEstoqueProps {
  produtos: Produto[]
}

const COLORS = {
  Alimentação: "#10b981",
  "Higiene/Limpeza": "#3b82f6",
  Pedagógico: "#8b5cf6",
  Bens: "#f59e0b",
}

export function GraficoEstoque({ produtos }: GraficoEstoqueProps) {
  // Dados para gráfico de barras (estoque por categoria)
  const dadosCategoria = produtos.reduce(
    (acc, produto) => {
      const categoria = produto.categorias.nome
      const existing = acc.find((item) => item.categoria === categoria)

      if (existing) {
        existing.quantidade += produto.estoque_atual
        existing.valor += produto.estoque_atual * (produto.valor_unitario || 0)
        existing.produtos += 1
      } else {
        acc.push({
          categoria,
          quantidade: produto.estoque_atual,
          valor: produto.estoque_atual * (produto.valor_unitario || 0),
          produtos: 1,
        })
      }

      return acc
    },
    [] as Array<{ categoria: string; quantidade: number; valor: number; produtos: number }>,
  )

  // Dados para gráfico de pizza (distribuição de produtos)
  const dadosPizza = dadosCategoria.map((item) => ({
    name: item.categoria,
    value: item.produtos,
    fill: COLORS[item.categoria as keyof typeof COLORS] || "#6b7280",
  }))

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Estoque por Categoria</CardTitle>
          <CardDescription>Quantidade total de produtos em estoque por categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosCategoria}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoria" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  name === "quantidade" ? `${value} unidades` : `R$ ${Number(value).toFixed(2)}`,
                  name === "quantidade" ? "Quantidade" : "Valor",
                ]}
              />
              <Bar dataKey="quantidade" fill="#3b82f6" name="quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Produtos</CardTitle>
          <CardDescription>Número de produtos cadastrados por categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosPizza}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosPizza.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
