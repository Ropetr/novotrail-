import { useState, FormEvent } from "react"
import { useNavigate, Link } from "react-router-dom"
import { login } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, LogIn, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    // Validação básica
    if (!email || !password) {
      setError("Por favor, preencha todos os campos")
      return
    }

    if (!email.includes("@")) {
      setError("Por favor, insira um e-mail válido")
      return
    }

    setLoading(true)

    try {
      // Faz login e salva token automaticamente
      const response = await login(email, password)

      console.log("[Login] Sucesso:", response)

      // Redireciona para dashboard
      navigate("/dashboard", { replace: true })
    } catch (err: any) {
      console.error("[Login] Erro:", err)
      if (err?.error === "NETWORK_ERROR") {
        setError(
          "Não foi possível conectar ao servidor. Tente novamente em alguns instantes."
        )
      } else {
        setError(err.message || "Erro ao fazer login. Verifique suas credenciais.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/logo-vertical.png"
              alt="TrailSystem"
              className="h-40 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold sr-only">TrailSystem ERP</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mensagem de erro */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Campo E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                  tabIndex={-1}
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {/* Botão de Login */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </>
              )}
            </Button>

            {/* Link para Registro */}
            <div className="text-center text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link
                to="/register"
                className="text-primary font-medium hover:underline"
              >
                Criar conta
              </Link>
            </div>
          </form>

          {/* Informações de Demo (opcional, remover em produção) */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground mb-2">
              Conta de demonstração:
            </p>
            <div className="text-xs text-center space-y-1">
              <p className="font-mono">admin@demo.com</p>
              <p className="font-mono">senha: 123456</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



