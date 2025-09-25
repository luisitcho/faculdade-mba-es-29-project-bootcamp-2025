
"use client"; // Esta diretiva transforma este arquivo em um Componente de Cliente

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

// Tipagem para as categorias recebidas como propriedade
interface Categoria {
    id: string;
    nome: string;
}

// Este é o componente de cliente que lida com a interatividade
export function FiltrosProdutos({ categorias }: { categorias: Categoria[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [busca, setBusca] = useState(searchParams.get("busca") || "");
    const [categoria, setCategoria] = useState(
        searchParams.get("categoria") || "all"
    );

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        const timeoutId = setTimeout(() => {
            if (busca) {
                params.set("busca", busca);
            } else {
                params.delete("busca");
            }
            router.replace(`${pathname}?${params.toString()}`);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [busca, pathname, router, searchParams]);

    const handleCategoriaChange = (novaCategoria: string) => {
        setCategoria(novaCategoria);
        const params = new URLSearchParams(searchParams.toString());
        if (novaCategoria && novaCategoria !== "all") {
            params.set("categoria", novaCategoria);
        } else {
            params.delete("categoria");
        }
        router.replace(`${pathname}?${params.toString()}`);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Filtros</CardTitle>
                <CardDescription>
                    Filtre produtos por categoria ou busque por nome
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4 md:flex-row">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar produtos..."
                                className="pl-10"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                            />
                        </div>
                    </div>
                    <Select value={categoria} onValueChange={handleCategoriaChange}>
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="Todas as categorias" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as categorias</SelectItem>
                            {categorias?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}