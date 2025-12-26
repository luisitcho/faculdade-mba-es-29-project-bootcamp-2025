"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      let finalEmail = email.trim()
      if (!finalEmail.includes("@")) {
        finalEmail = `${finalEmail}@temp.local`
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: finalEmail,
        password,
      })

      if (error) throw error

      await new Promise((resolve) => setTimeout(resolve, 100))

      window.location.href = "/dashboard"
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-muted/50">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Sistema de Estoque</CardTitle>
            <CardDescription>Entre com suas credenciais para acessar o sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email/Usuário</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="admin ou seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
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
              {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link href="/auth/cadastro" className="text-primary underline underline-offset-4 hover:text-primary/80">
                Cadastre-se
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
