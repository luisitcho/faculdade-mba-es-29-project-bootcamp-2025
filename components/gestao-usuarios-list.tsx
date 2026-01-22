"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit, UserX, UserCheck } from "lucide-react"
import { useRouter } from "next/navigation"

interface Usuario {
  id: string
  nome: string
  email: string
  perfil_acesso: string
  ativo: boolean
  created_at: string
}

interface GestaoUsuariosListProps {
  usuarios: Usuario[]
  currentUserProfile: any
  isMainAdmin: boolean
}

export function GestaoUsuariosList({
  usuarios,
  currentUserProfile,
  isMainAdmin,
}: GestaoUsuariosListProps) {
  const [editandoUsuario, setEditandoUsuario] = useState<Usuario | null>(null)
  const [novoNome, setNovoNome] = useState("")
  const [novoPerfil, setNovoPerfil] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // ✅ Função movida para cá (era prop antes)
  const getPerfilColor = (perfil: string) => {
    switch (perfil) {
      case "super_admin":
        return "bg-purple-100 text-purple-800"
      case "admin":
        return "bg-red-100 text-red-800"
      case "operador":
        return "bg-blue-100 text-blue-800"
      case "consulta":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPerfilHierarchy = (perfil: string) => {
    switch (perfil) {
      case "super_admin":
        return 4
      case "admin":
        return 3
      case "operador":
        return 2
      case "consulta":
        return 1
      default:
        return 0
    }
  }

  const canEditUser = (usuario: Usuario) => {
    // Não pode editar/remover a si mesmo por aqui
    if (usuario.id === currentUserProfile?.id) return false

    const isOwner = currentUserProfile?.email === "luishenrisc1@gmail.com"
    const targetIsAdmin = usuario.perfil_acesso === "admin" || usuario.perfil_acesso === "super_admin"

    // Se o alvo for admin, apenas o usuário específico (Owner) pode remover/editar
    if (targetIsAdmin) {
      return isOwner
    }

    // Se o alvo não for admin, qualquer admin pode remover/editar
    return isMainAdmin
  }

  const getAvailableProfiles = () => {
    if (isMainAdmin) {
      return [
        { value: "admin", label: "Administrador" },
        { value: "operador", label: "Operador" },
        { value: "consulta", label: "Consulta" },
      ]
    }
    return [{ value: "consulta", label: "Consulta" }]
  }

  const handleEditarUsuario = (usuario: Usuario) => {
    setEditandoUsuario(usuario)
    setNovoNome(usuario.nome)
    setNovoPerfil(usuario.perfil_acesso)
  }

  const handleSalvarUsuario = async () => {
    if (!editandoUsuario) return

    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          nome: novoNome,
          perfil_acesso: novoPerfil,
        })
        .eq("id", editandoUsuario.id)

      if (error) throw error

      setEditandoUsuario(null)
      router.refresh()
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (usuario: Usuario) => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("profiles").update({ ativo: !usuario.ativo }).eq("id", usuario.id)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Erro ao alterar status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPerfilName = (perfil: string) => {
    switch (perfil) {
      case "super_admin":
        return "Super Admin"
      case "admin":
        return "Admin"
      case "operador":
        return "Operador"
      case "consulta":
        return "Consulta"
      default:
        return perfil
    }
  }

  if (!usuarios.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">Nenhum usuário encontrado</h3>
            <p className="text-sm text-muted-foreground">Não há usuários cadastrados com os filtros selecionados.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários do Sistema</CardTitle>
        <CardDescription>Lista de todos os usuários cadastrados no sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {usuarios.map((usuario) => (
            <div key={usuario.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                  {usuario.nome?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-medium">{usuario.nome}</p>
                  <p className="text-sm text-muted-foreground">{usuario.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Cadastrado em {new Date(usuario.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className={getPerfilColor(usuario.perfil_acesso)}>
                  {formatPerfilName(usuario.perfil_acesso)}
                </Badge>
                <Badge variant={usuario.ativo ? "default" : "secondary"}>
                  {usuario.ativo ? "Ativo" : "Inativo"}
                </Badge>

                {canEditUser(usuario) && (
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleEditarUsuario(usuario)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Editar Usuário</DialogTitle>
                          <DialogDescription>Altere as informações do usuário {usuario.nome}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="nome">Nome Completo</Label>
                            <Input id="nome" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Perfil de Acesso</Label>
                            <Select value={novoPerfil} onValueChange={setNovoPerfil}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailableProfiles().map((profile) => (
                                  <SelectItem key={profile.value} value={profile.value}>
                                    {profile.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditandoUsuario(null)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleSalvarUsuario} disabled={isLoading}>
                            {isLoading ? "Salvando..." : "Salvar"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={
                            usuario.ativo ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"
                          }
                        >
                          {usuario.ativo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{usuario.ativo ? "Desativar" : "Ativar"} Usuário</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja {usuario.ativo ? "desativar" : "ativar"} o usuário "{usuario.nome}"?
                            {usuario.ativo && " O usuário não conseguirá mais acessar o sistema."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleToggleStatus(usuario)}
                            className={
                              usuario.ativo ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""
                            }
                          >
                            {usuario.ativo ? "Desativar" : "Ativar"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
