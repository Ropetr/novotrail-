import { useState, FormEvent } from "react"
import { useNavigate, Link } from "react-router-dom"
import { register } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const validateForm = (): string | null => {
    // Validação de campos vazios
    if (!name || !email || !password || !confirmPassword) {
      return "Por favor, preencha todos os campos"
    }

    // Validação de nome (mínimo 3 caracteres)
    if (name.trim().length < 3) {
      return "O nome deve ter pelo menos 3 caracteres"
    }

    // Validação de e-mail
    if (!email.includes("@") || !email.includes(".")) {
      return "Por favor, insira um e-mail válido"
    }

    // Validação de senha (mínimo 6 caracteres)
    if (password.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres"
    }

    // Validação de confirmação de senha
    if (password !== confirmPassword) {
      return "As senhas não coincidem"
    }

    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Valida o formulário
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      // Registra usuário e salva token automaticamente
      const response = await register(name.trim(), email.trim(), password)

      console.log("[Register] Sucesso:", response)

      setSuccess(true)

      // Aguarda 1.5s para mostrar mensagem de sucesso e redireciona
      setTimeout(() => {
        navigate("/dashboard", { replace: true })
      }, 1500)
    } catch (err: any) {
      console.error("[Register] Erro:", err)
      setError(err.message || "Erro ao criar conta. Tente novamente.")
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
          <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para criar sua conta no TrailSystem ERP
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

            {/* Mensagem de sucesso */}
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Conta criada com sucesso! Redirecionando...
                </AlertDescription>
              </Alert>
            )}

            {/* Campo Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading || success}
                autoComplete="name"
                autoFocus
              />
            </div>

            {/* Campo E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || success}
                autoComplete="email"
              />
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || success}
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">
                A senha deve ter pelo menos 6 caracteres
              </p>
            </div>

            {/* Campo Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || success}
                autoComplete="new-password"
              />
            </div>

            {/* Botão de Registro */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Conta criada!
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Criar Conta
                </>
              )}
            </Button>

            {/* Link para Login */}
            <div className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                Fazer login
              </Link>
            </div>
          </form>

          {/* Termos e Condições */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              Ao criar uma conta, você concorda com nossos{" "}
              <a href="#" className="text-primary hover:underline">
                Termos de Uso
              </a>{" "}
              e{" "}
              <a href="#" className="text-primary hover:underline">
                Política de Privacidade
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


