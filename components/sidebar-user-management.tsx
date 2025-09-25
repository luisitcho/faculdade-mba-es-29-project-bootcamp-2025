"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Edit, UserCheck, UserX, Users } from "lucide-react"
import { useRouter } from "next/navigation"

interface Usuario {
  id: string
  nome: string
  email: string
  perfil_acesso: string
  ativo: boolean
  created_at: string
}

interface SidebarUserManagementProps {
  currentUserProfile: any
}

export function SidebarUserManagement({ currentUserProfile }: SidebarUserManagementProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [editandoUsuario, setEditandoUsuario] = useState<Usuario | null>(null)
  const [novoNome, setNovoNome] = useState("")
  const [novoPerfil, setNovoPerfil] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const isMainAdmin = currentUserProfile?.email === "admin@admin.com" || currentUserProfile?.email === "luishenrisc1@gmail.com"

  useEffect(() => {
    if (isMainAdmin && currentUserProfile?.perfil_acesso === "admin") {
      fetchUsuarios()
    }
  }, [isMainAdmin, currentUserProfile])

  const fetchUsuarios = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar usuários:", error)
      return
    }

    setUsuarios(data || [])
  }

  const canEditUser = (usuario: Usuario) => {
    return isMainAdmin && currentUserProfile?.perfil_acesso === "admin" && usuario.id !== currentUserProfile.id
  }

  const getPerfilColor = (perfil: string) => {
    switch (perfil) {
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

  const formatPerfilName = (perfil: string) => {
    switch (perfil) {
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

  const handleEditarUsuario = (usuario: Usuario) => {
    setEditandoUsuario(usuario)
    setNovoNome(usuario.nome)
    setNovoPerfil(usuario.perfil_acesso)
    setIsOpen(true)
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
      setIsOpen(false)
      fetchUsuarios()
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
      const { error } = await supabase
        .from("profiles")
        .update({ ativo: !usuario.ativo })
        .eq("id", usuario.id)

      if (error) throw error

      fetchUsuarios()
      router.refresh()
    } catch (error) {
      console.error("Erro ao alterar status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMainAdmin || currentUserProfile?.perfil_acesso !== "admin") {
    return null
  }

  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">Gerenciar Usuários</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-1" />
              Usuários
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gerenciar Usuários</DialogTitle>
              <DialogDescription>
                Edite cargos e status dos usuários do sistema
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {usuarios.map((usuario) => (
                <div key={usuario.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                        {usuario.nome?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{usuario.nome}</p>
                        <p className="text-xs text-muted-foreground truncate">{usuario.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getPerfilColor(usuario.perfil_acesso)}>
                            {formatPerfilName(usuario.perfil_acesso)}
                          </Badge>
                          <Badge variant={usuario.ativo ? "default" : "secondary"}>
                            {usuario.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {canEditUser(usuario) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditarUsuario(usuario)}
                        disabled={isLoading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {canEditUser(usuario) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(usuario)}
                        disabled={isLoading}
                      >
                        {usuario.ativo ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {editandoUsuario && (
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Editar Usuário: {editandoUsuario.nome}</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                      placeholder="Nome do usuário"
                    />
                  </div>
                  <div>
                    <Label htmlFor="perfil">Cargo</Label>
                    <Select value={novoPerfil} onValueChange={setNovoPerfil}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="operador">Operador</SelectItem>
                        <SelectItem value="consulta">Consulta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              {editandoUsuario && (
                <Button onClick={handleSalvarUsuario} disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
