import { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { isAuthenticated } from "@/services/api"

interface PrivateRouteProps {
  children: ReactNode
}

/**
 * Componente que protege rotas privadas
 *
 * Verifica se o usuário está autenticado (possui token JWT).
 * Se não estiver, redireciona para a página de login.
 *
 * Uso:
 * ```tsx
 * <Route
 *   path="/dashboard"
 *   element={
 *     <PrivateRoute>
 *       <Dashboard />
 *     </PrivateRoute>
 *   }
 * />
 * ```
 */
export function PrivateRoute({ children }: PrivateRouteProps) {
  const location = useLocation()
  const authenticated = isAuthenticated()

  console.log("[PrivateRoute] Verificando autenticação:", {
    authenticated,
    path: location.pathname,
  })

  if (!authenticated) {
    console.warn("[PrivateRoute] Usuário não autenticado. Redirecionando para /login")

    // Redireciona para login, salvando a rota original para voltar depois
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Usuário autenticado, renderiza o componente filho
  return <>{children}</>
}
