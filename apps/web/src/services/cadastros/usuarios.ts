import api from '../api'

export interface UserData {
  id: string
  tenantId: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'user'
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface UpdateUserInput {
  name?: string
  email?: string
  role?: UserData['role']
  status?: UserData['status']
  password?: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

export const usuariosService = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<UserData[]>>('/usuarios', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<UserData>>(`/usuarios/${id}`).then((r) => r.data),

  update: (id: string, data: UpdateUserInput) =>
    api.put<ApiResponse<UserData>>(`/usuarios/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    api.delete<ApiResponse<{ deleted: boolean }>>(`/usuarios/${id}`).then((r) => r.data),

  // Create uses the existing auth/register endpoint
  create: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post<ApiResponse<{ user: UserData; token: string }>>('/auth/register', data).then((r) => r.data),
}
