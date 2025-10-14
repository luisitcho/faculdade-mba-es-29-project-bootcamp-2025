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
import { Building2, Plus, Edit, Trash2, MapPin } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"

interface Unidade {
  id: string
  nome: string
  descricao: string | null
  endereco: string | null
  ativo: boolean
}

interface UnidadesListProps {
  unidades: Unidade[]
  profile: any
}

export function UnidadesList({ unidades, profile }: UnidadesListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUnidade, setEditingUnidade] = useState<Unidade | null>(null)
  const [deleteUnidadeId, setDeleteUnidadeId] = useState<string | null>(null)
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [endereco, setEndereco] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const isAdmin = profile?.perfil_acesso === "admin"

  const handleOpenDialog = (unidade?: Unidade) => {
    if (unidade) {
      setEditingUnidade(unidade)
      setNome(unidade.nome)
      setDescricao(unidade.descricao || "")
      setEndereco(unidade.endereco || "")
    } else {
      setEditingUnidade(null)
      setNome("")
      setDescricao("")
      setEndereco("")
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()
    const unidadeData = { nome, descricao, endereco }

    try {
      if (editingUnidade) {
        await supabase.from("unidades").update(unidadeData).eq("id", editingUnidade.id)
      } else {
        await supabase.from("unidades").insert([unidadeData])
      }
      setIsDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar unidade:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteUnidadeId) return

    const supabase = createClient()
    await supabase.from("unidades").delete().eq("id", deleteUnidadeId)
    setDeleteUnidadeId(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Nova Unidade
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUnidade ? "Editar Unidade" : "Nova Unidade"}</DialogTitle>
                <DialogDescription>
                  {editingUnidade ? "Edite as informações da unidade" : "Cadastre uma nova unidade"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Unidade *</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Unidade Centro"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descrição da unidade"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Endereço completo"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1 cursor-pointer">
                    {isLoading ? "Salvando..." : editingUnidade ? "Atualizar" : "Cadastrar"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="cursor-pointer"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {unidades.map((unidade) => (
          <Card key={unidade.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{unidade.nome}</CardTitle>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(unidade)}
                      className="h-8 w-8 cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteUnidadeId(unidade.id)}
                      className="h-8 w-8 text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {unidade.descricao && <CardDescription>{unidade.descricao}</CardDescription>}
            </CardHeader>
            <CardContent>
              {unidade.endereco && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span>{unidade.endereco}</span>
                </div>
              )}
              <Button asChild variant="outline" className="w-full cursor-pointer bg-transparent">
                <Link href={`/dashboard/unidades/${unidade.id}`}>Ver Produtos</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteUnidadeId} onOpenChange={() => setDeleteUnidadeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta unidade? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="cursor-pointer">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
