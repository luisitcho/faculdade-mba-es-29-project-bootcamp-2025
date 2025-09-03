"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Plus, Minus } from "lucide-react"
import { useRouter } from "next/navigation"

interface Produto {
  id: string
  nome: string
  estoque_atual: number
  unidade_medida: string
}

interface AjusteEstoqueModalProps {
  produto: Produto
  userId: string
}

export function AjusteEstoqueModal({ produto, userId }: AjusteEstoqueModalProps) {
  const [open, setOpen] = useState(false)
  const [tipoAjuste, setTipoAjuste] = useState<"entrada" | "saida">("entrada")
  const [quantidade, setQuantidade] = useState("")
  const [motivo, setMotivo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAjuste = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      // Registrar movimentação de ajuste
      const { error } = await supabase.from("movimentacoes").insert([
        {
          produto_id: produto.id,
          tipo_movimentacao: tipoAjuste,
          quantidade: Number.parseInt(quantidade),
          observacoes: `Ajuste de estoque: ${motivo}`,
          usuario_id: userId,
        },
      ])

      if (error) throw error

      setOpen(false)
      setQuantidade("")
      setMotivo("")
      router.refresh()
    } catch (error) {
      console.error("Erro ao ajustar estoque:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Package className="mr-2 h-4 w-4" />
          Ajustar Estoque
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar Estoque</DialogTitle>
          <DialogDescription>
            Produto: {produto.nome} (Atual: {produto.estoque_atual} {produto.unidade_medida})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Ajuste</Label>
            <Select value={tipoAjuste} onValueChange={(value: "entrada" | "saida") => setTipoAjuste(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-600" />
                    Adicionar ao Estoque
                  </div>
                </SelectItem>
                <SelectItem value="saida">
                  <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4 text-red-600" />
                    Remover do Estoque
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantidade">Quantidade</Label>
            <Input
              id="quantidade"
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder="Digite a quantidade"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo do Ajuste</Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: Correção de inventário, produto vencido, etc."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAjuste} disabled={!quantidade || !motivo || isLoading}>
            {isLoading ? "Ajustando..." : "Confirmar Ajuste"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
