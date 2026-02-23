import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"

// Base URL do backend
const BASE_URL = import.meta.env.VITE_API_URL || "https://novotrail-api.planacacabamentos.workers.dev/api/v1"
const DEV_TENANT_ID = import.meta.env.VITE_TENANT_ID

// Chave para armazenar o token no localStorage
const TOKEN_KEY = "erp_auth_token"

// Interface para resposta de erro padronizada
interface ErrorResponse {
  message?: string
  error?: string
  statusCode?: number
}

interface ApiEnvelope<T> {
  success: boolean
  data: T
  error?: string
  message?: string
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

const isDev = import.meta.env.DEV
const log = (...args: unknown[]) => { if (isDev) console.log(...args) }
const warn = (...args: unknown[]) => { if (isDev) console.warn(...args) }
const errorLog = (...args: unknown[]) => { if (isDev) console.error(...args) }

// Interceptador de Request: Adiciona token JWT em todas as requisições
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()

    log(`[API] 🔑 Token obtido do localStorage:`, token ? `${token.substring(0, 20)}...` : 'null')

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
      log(`[API] ✅ Token adicionado ao header Authorization`)
    } else {
      log(`[API] ⚠️ Nenhum token disponível para adicionar`)
    }

    // Dev helper: envia tenant fixo em ambiente de desenvolvimento
    if (import.meta.env.DEV && DEV_TENANT_ID && config.headers) {
      config.headers["x-tenant-id"] = DEV_TENANT_ID
    }

    log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data,
    })

    return config
  },
  (error) => {
    errorLog("[API] Request error:", error)
    return Promise.reject(error)
  }
)

// Interceptador de Response: Trata erros globalmente
api.interceptors.response.use(
  (response) => {
    log(`[API] Response ${response.config.url}:`, response.data)
    return response
  },
  (error: AxiosError<ErrorResponse>) => {
    errorLog("[API] Response error:", error)
    errorLog("[API] Response data:", error.response?.data)
    errorLog("[API] Response status:", error.response?.status)

    // Erro de rede (sem resposta do servidor)
    if (!error.response) {
      return Promise.reject({
        message: "Erro de conexao. Verifique sua internet ou se o servidor esta rodando.",
        error: "NETWORK_ERROR",
      })
    }

    // Token expirado ou inválido (401)
    if (error.response.status === 401) {
      errorLog("[API] 🚨 401 Unauthorized detectado!")
      errorLog("[API] 📍 URL da requisição:", error.config?.url)
      errorLog("[API] 🔑 Token presente no localStorage:", !!getToken())
      errorLog("[API] 📤 Authorization header enviado:", error.config?.headers?.Authorization)
      errorLog("[API] 📥 Dados da resposta:", error.response.data)
      errorLog("[API] 📊 Status completo:", {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
      })

      clearToken()

      // Redireciona para login apenas se não estiver em rotas públicas
      if (!window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/register")) {
        warn("[API] 🔄 Redirecionando para /login...")
        window.location.href = "/login"
      }
    }

    // Acesso negado (403)
    if (error.response.status === 403) {
      return Promise.reject({
        message: "Voce nao tem permissao para acessar este recurso.",
        error: "FORBIDDEN",
        statusCode: 403,
      })
    }

    // Servidor retornou erro estruturado
    if (error.response.data) {
      return Promise.reject({
        message: error.response.data.message || error.response.data.error || "Erro ao processar solicitacao",
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
  log("[Auth] Token salvo no localStorage")
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
  log("[Auth] Token removido do localStorage")
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
  const response = await api.post<ApiEnvelope<AuthResponse> | AuthResponse>("/auth/login", {
    email,
    password,
    tenantId: tenantId || "00000000-0000-0000-0000-000000000001", // Tenant padrão
  })

  // Compatível com respostas { token, user } ou { success, data: { token, user } }
  const data: any = (response.data as any)?.data ?? response.data

  // Salva o token automaticamente
  setToken(data.token)

  return data as AuthResponse
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
  const response = await api.post<ApiEnvelope<AuthResponse> | AuthResponse>("/auth/register", {
    tenantId: tenantId || "00000000-0000-0000-0000-000000000001", // Tenant padrão
    name,
    email,
    password,
  })

  // Compatível com respostas { token, user } ou { success, data: { token, user } }
  const data: any = (response.data as any)?.data ?? response.data

  // Salva o token automaticamente após registro
  setToken(data.token)

  return data as AuthResponse
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
  const response = await api.get<User>("/protected/me")
  return response.data
}

// ==================== Exports ====================

export default api



