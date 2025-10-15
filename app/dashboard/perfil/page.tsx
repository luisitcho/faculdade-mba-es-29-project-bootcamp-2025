import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Shield, Calendar } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Buscar dados do perfil do usuário
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

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
          <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground">Visualize e edite suas informações pessoais</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>Suas informações básicas no sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input id="nome" value={profile?.nome || ""} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email || ""} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Perfil de Acesso</Label>
              <div>
                <Badge className={getPerfilColor(profile?.perfil_acesso || "")}>
                  {profile?.perfil_acesso === "super_admin"
                    ? "Super Admin"
                    : profile?.perfil_acesso === "admin"
                      ? "Admin"
                      : profile?.perfil_acesso === "operador"
                        ? "Operador"
                        : "Consulta"}
                </Badge>
              </div>
            </div>
            <Button className="w-full" disabled>
              Editar Perfil (Em breve)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Informações da Conta
            </CardTitle>
            <CardDescription>Detalhes sobre sua conta no sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Email verificado</span>
              </div>
              <Badge variant="default">Sim</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Conta criada em</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("pt-BR") : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Status da conta</span>
              </div>
              <Badge variant={profile?.ativo ? "default" : "secondary"}>{profile?.ativo ? "Ativa" : "Inativa"}</Badge>
            </div>
            <Button variant="outline" className="w-full bg-transparent" disabled>
              Alterar Senha (Em breve)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
