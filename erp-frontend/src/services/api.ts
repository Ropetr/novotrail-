import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"

// Base URL do backend
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8787/api/v1"

// Chave para armazenar o token no localStorage
const TOKEN_KEY = "erp_auth_token"

// Interface para resposta de erro padronizada
interface ErrorResponse {
  message: string
  error?: string
  statusCode?: number
}

// Interface para dados do usuário
export interface User {
  id: string
  name: string
  email: string
  role?: string
}

// Interface para resposta de autenticação
export interface AuthResponse {
  token: string
  user: User
}

// Cria instância do axios
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptador de Request: Adiciona token JWT em todas as requisições
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()

    console.log(`[API] 🔑 Token obtido do localStorage:`, token ? `${token.substring(0, 20)}...` : 'null')

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
      console.log(`[API] ✅ Token adicionado ao header Authorization`)
    } else {
      console.log(`[API] ⚠️ Nenhum token disponível para adicionar`)
    }

    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data,
    })

    return config
  },
  (error) => {
    console.error("[API] Request error:", error)
    return Promise.reject(error)
  }
)

// Interceptador de Response: Trata erros globalmente
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.config.url}:`, response.data)
    return response
  },
  (error: AxiosError<ErrorResponse>) => {
    console.error("[API] Response error:", error)
    console.error("[API] Response data:", error.response?.data)
    console.error("[API] Response status:", error.response?.status)

    // Erro de rede (sem resposta do servidor)
    if (!error.response) {
      return Promise.reject({
        message: "Erro de conexão. Verifique sua internet ou se o servidor está rodando.",
        error: "NETWORK_ERROR",
      })
    }

    // Token expirado ou inválido (401)
    if (error.response.status === 401) {
      console.error("[API] 🚨 401 Unauthorized detectado!")
      console.error("[API] 📍 URL da requisição:", error.config?.url)
      console.error("[API] 🔑 Token presente no localStorage:", !!getToken())
      console.error("[API] 📤 Authorization header enviado:", error.config?.headers?.Authorization)
      console.error("[API] 📥 Dados da resposta:", error.response.data)
      console.error("[API] 📊 Status completo:", {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
      })

      clearToken()

      // Redireciona para login apenas se não estiver em rotas públicas
      if (!window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/register")) {
        console.warn("[API] 🔄 Redirecionando para /login...")
        window.location.href = "/login"
      }
    }

    // Acesso negado (403)
    if (error.response.status === 403) {
      return Promise.reject({
        message: "Você não tem permissão para acessar este recurso.",
        error: "FORBIDDEN",
        statusCode: 403,
      })
    }

    // Servidor retornou erro estruturado
    if (error.response.data) {
      return Promise.reject({
        message: error.response.data.message || "Erro ao processar solicitação",
        error: error.response.data.error,
        statusCode: error.response.status,
      })
    }

    // Erro genérico
    return Promise.reject({
      message: "Erro inesperado no servidor",
      error: "UNKNOWN_ERROR",
      statusCode: error.response.status,
    })
  }
)

// ==================== Funções de Autenticação ====================

/**
 * Salva o token JWT no localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  console.log("[Auth] Token salvo no localStorage")
}

/**
 * Recupera o token JWT do localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Remove o token JWT do localStorage
 */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  console.log("[Auth] Token removido do localStorage")
}

/**
 * Verifica se o usuário está autenticado
 */
export function isAuthenticated(): boolean {
  return !!getToken()
}

// ==================== API de Autenticação ====================

/**
 * Faz login no sistema
 */
export async function login(email: string, password: string, tenantId?: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", {
    email,
    password,
    tenantId: tenantId || "00000000-0000-0000-0000-000000000001", // Tenant padrão
  })

  // Salva o token automaticamente
  setToken(response.data.token)

  return response.data
}

/**
 * Registra um novo usuário
 */
export async function register(
  name: string,
  email: string,
  password: string,
  tenantId?: string
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/register", {
    tenantId: tenantId || "00000000-0000-0000-0000-000000000001", // Tenant padrão
    name,
    email,
    password,
  })

  // Salva o token automaticamente após registro
  setToken(response.data.token)

  return response.data
}

/**
 * Faz logout (limpa token)
 */
export function logout(): void {
  clearToken()
  window.location.href = "/login"
}

/**
 * Busca os dados do usuário logado
 */
export async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>("/auth/me")
  return response.data
}

// ==================== Exports ====================

export default api
