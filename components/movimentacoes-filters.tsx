"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

// Definimos o tipo para a prop 'produtos'
interface Produto {
    id: string
    nome: string
}

interface MovimentacoesFiltersProps {
    produtos: Produto[]
}

export function MovimentacoesFilters({ produtos }: MovimentacoesFiltersProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const isFiltered = searchParams.size > 0

    const handleFilterChange = (key: string, value: string) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()))

        if (!value || value === "all") {
            current.delete(key)
        } else {
            current.set(key, value)
        }

        const search = current.toString()
        const query = search ? `?${search}` : ""

        router.push(`${pathname}${query}`)
    }

    const handleResetFilters = () => {
        router.push(pathname)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Filtros</CardTitle>
                <CardDescription>Filtre movimentações por tipo, produto ou data</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center gap-4 md:flex-row">
                    <Select
                        // ALTERADO: de defaultValue para value
                        value={searchParams.get("tipo") || "all"}
                        onValueChange={(value) => handleFilterChange("tipo", value)}
                    >
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="Tipo de movimentação" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as movimentações</SelectItem>
                            <SelectItem value="entrada">Entradas</SelectItem>
                            <SelectItem value="saida">Saídas</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        // ALTERADO: de defaultValue para value
                        value={searchParams.get("produto") || "all"}
                        onValueChange={(value) => handleFilterChange("produto", value)}
                    >
                        <SelectTrigger className="w-full md:w-[250px]">
                            <SelectValue placeholder="Produto" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os produtos</SelectItem>
                            {produtos?.map((produto) => (
                                <SelectItem key={produto.id} value={produto.id}>
                                    {produto.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input
                        type="date"
                        className="w-full md:w-[200px]"
                        // ALTERADO: de defaultValue para value
                        value={searchParams.get("data") || ""}
                        onChange={(e) => handleFilterChange("data", e.target.value)}
                    />

                    {isFiltered && (
                        <Button
                            variant="ghost"
                            onClick={handleResetFilters}
                            className="w-full md:w-auto"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Limpar Filtros
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}