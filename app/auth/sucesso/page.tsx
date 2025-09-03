import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function SucessoPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-muted/50">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Conta Criada!</CardTitle>
            <CardDescription>Sua conta foi criada com sucesso</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Sua conta foi criada e está pronta para uso. Você já pode fazer login no sistema com suas credenciais.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
