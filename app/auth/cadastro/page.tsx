"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function CadastroPage() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [perfilAcesso, setPerfilAcesso] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUserRole = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase.from("usuarios").select("perfil_acesso").eq("id", user.id).single()

        setIsAdmin(profile?.perfil_acesso === "admin")
      }
      setCheckingAuth(false)
    }

    checkUserRole()
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    const finalPerfilAcesso = isAdmin ? perfilAcesso : "consulta"

    if (isAdmin && !perfilAcesso) {
      setError("Selecione um perfil de acesso")
      setIsLoading(false)
      return
    }

    try {
      let finalEmail = email.trim()

      if (!finalEmail) {
        finalEmail = `${nome.replace(/\s+/g, "").toLowerCase()}@temp.local`
      } else if (!finalEmail.includes("@")) {
        finalEmail = `${finalEmail}@temp.local`
      }

      const { data, error } = await supabase.auth.signUp({
        email: finalEmail,
        password,
        options: {
          data: {
            nome,
            perfil_acesso: finalPerfilAcesso,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        // Garantir que o perfil seja criado na tabela pública
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          nome,
          email: finalEmail,
          perfil_acesso: finalPerfilAcesso,
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        // Ignora erro de duplicidade (código 23505) caso um trigger já tenha criado
        if (profileError && profileError.code !== "23505") {
          console.error("Erro ao criar perfil:", profileError)
        }

        router.push("/auth/sucesso")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 bg-muted/50">
        <div className="text-center">Verificando permissões...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-muted/50">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">{isAdmin ? "Criar Usuário" : "Criar Conta"}</CardTitle>
            <CardDescription>
              {isAdmin
                ? "Preencha os dados para criar um novo usuário no sistema"
                : "Preencha os dados para criar sua conta no sistema"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email/Usuário (opcional)</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="admin ou seu@email.com (deixe vazio para usar apenas nome)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {isAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="perfil">Perfil de Acesso</Label>
                  <Select value={perfilAcesso} onValueChange={setPerfilAcesso}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consulta">Consulta</SelectItem>
                      <SelectItem value="operador">Operador</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Criando conta..." : isAdmin ? "Criar Usuário" : "Criar Conta"}
              </Button>
            </form>
            {!isAdmin && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link href="/auth/login" className="text-primary underline underline-offset-4 hover:text-primary/80">
                  Faça login
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
