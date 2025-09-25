import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Users, UserCheck, UserX } from "lucide-react"
import { GestaoUsuariosList } from "@/components/gestao-usuarios-list"

interface SearchParams {
  busca?: string
  status?: string
  perfil?: string
}

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()

  // Autenticação
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) {
    redirect("/auth/login")
  }
  const user = authData.user

  // Buscar perfil
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const isMainAdmin =
    (profile?.email === "admin@admin.com" ||
      profile?.email === "luishenrisc1@gmail.com") &&
    profile?.perfil_acesso === "admin"

  if (!isMainAdmin && profile?.perfil_acesso !== "super_admin") {
    redirect("/dashboard")
  }

  // Construir query de usuários
  let query = supabase.from("profiles").select("*")

  if (searchParams.busca) {
    // A maneira correta de usar .or() para pesquisa com ILIKE
    query = query.or(
      `nome.ilike.%${searchParams.busca}%,email.ilike.%${searchParams.busca}%`
    )
  }

  if (searchParams.status === "ativo") {
    query = query.eq("ativo", true)
  } else if (searchParams.status === "inativo") {
    query = query.eq("ativo", false)
  }

  if (searchParams.perfil) {
    query = query.eq("perfil_acesso", searchParams.perfil)
  }

  const { data: usuarios, error: usuariosError } = await query.order(
    "created_at",
    { ascending: false }
  )

  const usuariosList = usuarios ?? []

  // Estatísticas
  const totalUsuarios = usuariosList.length
  const usuariosAtivos = usuariosList.filter((u) => u.ativo).length
  const usuariosInativos = usuariosList.filter((u) => !u.ativo).length
  const admins = usuariosList.filter(
    (u) => u.perfil_acesso === "admin" || u.perfil_acesso === "super_admin"
  ).length

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

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie os usuários do sistema - Acesso restrito a administradores
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsuarios}</div>
            <p className="text-xs text-muted-foreground">Usuários cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{usuariosAtivos}</div>
            <p className="text-xs text-muted-foreground">Contas ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Inativos</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{usuariosInativos}</div>
            <p className="text-xs text-muted-foreground">Contas inativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{admins}</div>
            <p className="text-xs text-muted-foreground">Admins e Super Admins</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre usuários por nome, email, status ou perfil</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  className="pl-10"
                  defaultValue={searchParams.busca}
                  name="busca"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <GestaoUsuariosList
        usuarios={usuariosList}
        currentUserProfile={profile}
        getPerfilColor={getPerfilColor}
        isMainAdmin={isMainAdmin}
      />
    </div>
  )
}
