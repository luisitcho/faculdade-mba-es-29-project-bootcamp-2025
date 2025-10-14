import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Users, UserCheck, UserX } from "lucide-react"
import { GestaoUsuariosList } from "@/components/gestao-usuarios-list"
import { SetupInicial } from "@/components/setup-inicial"

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
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) {
      console.error("Erro de autenticação:", authError)
      redirect("/auth/login")
    }

    // Verificar se é admin ou super_admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (profileError) {
      console.error("Erro ao buscar perfil do usuário:", profileError)
      redirect("/auth/login")
    }

    if (!profile) {
      console.error("Perfil do usuário não encontrado")
      redirect("/auth/login")
    }

    const isMainAdmin = profile?.email === "luishenrisc1@gmail.com" || profile?.perfil_acesso === "admin"
    const isSuperAdmin = profile?.perfil_acesso === "super_admin"

    if (!isMainAdmin && !isSuperAdmin) {
      redirect("/dashboard")
    }

    // Construir query para usuários
    let query = supabase.from("profiles").select("*")

    // Aplicar filtros
    if (searchParams.busca) {
      query = query.or(`nome.ilike.%${searchParams.busca}%,email.ilike.%${searchParams.busca}%`)
    }

    if (searchParams.status === "ativo") {
      query = query.eq("ativo", true)
    } else if (searchParams.status === "inativo") {
      query = query.eq("ativo", false)
    }

    if (searchParams.perfil) {
      query = query.eq("perfil_acesso", searchParams.perfil)
    }

    const { data: usuarios, error: usuariosError } = await query.order("created_at", { ascending: false })

    if (usuariosError) {
      console.error("Erro ao buscar usuários:", usuariosError)
      return (
        <div className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h1>
              <p className="text-muted-foreground">Visualize e gerencie os usuários do sistema</p>
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Erro ao carregar usuários</h2>
              <p className="text-muted-foreground">Não foi possível carregar a lista de usuários. Tente novamente mais tarde.</p>
              <p className="text-sm text-muted-foreground mt-2">Erro: {usuariosError.message}</p>
            </div>
          </div>
        </div>
      )
    }

    // Se não há usuários cadastrados, mostrar setup inicial
    if (!usuarios || usuarios.length === 0) {
      return <SetupInicial />
    }

    // Estatísticas
    const totalUsuarios = usuarios?.length || 0
    const usuariosAtivos = usuarios?.filter((u) => u.ativo).length || 0
    const usuariosInativos = usuarios?.filter((u) => !u.ativo).length || 0
    const admins = usuarios?.filter((u) => u.perfil_acesso === "admin" || u.perfil_acesso === "super_admin").length || 0

    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h1>
            <p className="text-muted-foreground">Visualize e gerencie os usuários do sistema</p>
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
          usuarios={usuarios || []}
          currentUserProfile={profile}
          isMainAdmin={isMainAdmin}
        />
      </div>
    )
  } catch (error) {
    console.error("Erro geral na página de usuários:", error)
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h1>
            <p className="text-muted-foreground">Visualize e gerencie os usuários do sistema</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Erro interno do servidor</h2>
            <p className="text-muted-foreground">Ocorreu um erro inesperado. Tente novamente mais tarde.</p>
            <p className="text-sm text-muted-foreground mt-2">Digest: {Math.random().toString(36).substr(2, 9)}</p>
          </div>
        </div>
      </div>
    )
  }
}
