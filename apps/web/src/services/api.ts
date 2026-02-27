import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"

// Base URL do backend
const BASE_URL = import.meta.env.VITE_API_URL || "https://novotrail-api.planacacabamentos.workers.dev/api/v1"
const DEV_TENANT_ID = import.meta.env.VITE_TENANT_ID || "00000000-0000-0000-0000-000000000001"

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

// Interceptador de Request: Adiciona token JWT em todas as requisições
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Envia tenant ID em todas as requisições
    if (DEV_TENANT_ID && config.headers) {
      config.headers["x-tenant-id"] = DEV_TENANT_ID
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptador de Response: Trata erros globalmente
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError<ErrorResponse>) => {
    // Erro de rede (sem resposta do servidor)
    if (!error.response) {
      return Promise.reject({
        message: "Erro de conexao. Verifique sua internet ou se o servidor esta rodando.",
        error: "NETWORK_ERROR",
      })
    }

    // Token expirado ou inválido (401)
    if (error.response.status === 401) {
      clearToken()

      // Redireciona para login apenas se não estiver em rotas públicas
      if (!window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/register")) {
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
  const envelope = response.data as ApiEnvelope<AuthResponse>
  const data: AuthResponse = envelope?.data ?? (response.data as AuthResponse)

  // Salva o token automaticamente
  setToken(data.token)

  return data
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
  const envelope = response.data as ApiEnvelope<AuthResponse>
  const data: AuthResponse = envelope?.data ?? (response.data as AuthResponse)

  // Salva o token automaticamente após registro
  setToken(data.token)

  return data
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



