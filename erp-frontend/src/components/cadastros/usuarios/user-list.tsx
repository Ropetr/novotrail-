"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Mail,
  Shield,
  Clock,
  UserCheck,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PeriodFilter } from "@/components/common/period-filter"
import { FilterCustomizer, FilterOption } from "@/components/common/filter-customizer"
import { Settings } from "lucide-react"

export interface User {
  id: string
  code: string
  username: string // Nome de usuário (ex: vendas01, compras, financeiro)
  email: string
  role: "admin" | "manager" | "vendedor" | "estoquista" | "financeiro" | "customizado"
  status: "ativo" | "inativo" | "bloqueado"
  employeeLinked?: string // Nome do colaborador vinculado (opcional)
  lastAccess?: string
  twoFactorEnabled: boolean
}

const mockUsers: User[] = [
  {
    id: "1",
    code: "USER-001",
    username: "admin",
    email: "admin@empresa.com",
    role: "admin",
    status: "ativo",
    employeeLinked: "Rodrigo Silva",
    lastAccess: "Hoje às 10:30",
    twoFactorEnabled: true,
  },
  {
    id: "2",
    code: "USER-002",
    username: "vendas01",
    email: "vendas01@empresa.com",
    role: "vendedor",
    status: "ativo",
    employeeLinked: "Maria Santos",
    lastAccess: "Hoje às 09:15",
    twoFactorEnabled: false,
  },
  {
    id: "3",
    code: "USER-003",
    username: "estoque",
    email: "estoque@empresa.com",
    role: "estoquista",
    status: "ativo",
    employeeLinked: "João Oliveira",
    lastAccess: "Ontem às 18:45",
    twoFactorEnabled: false,
  },
  {
    id: "4",
    code: "USER-004",
    username: "financeiro",
    email: "financeiro@empresa.com",
    role: "financeiro",
    status: "ativo",
    employeeLinked: "Ana Costa",
    lastAccess: "Há 2 dias",
    twoFactorEnabled: true,
  },
  {
    id: "5",
    code: "USER-005",
    username: "compras",
    email: "compras@empresa.com",
    role: "manager",
    status: "ativo",
    employeeLinked: "Pedro Mendes",
    lastAccess: "Hoje às 08:00",
    twoFactorEnabled: false,
  },
  {
    id: "6",
    code: "USER-006",
    username: "rh",
    email: "rh@empresa.com",
    role: "manager",
    status: "ativo",
    employeeLinked: "Juliana Martins",
    lastAccess: "Hoje às 11:20",
    twoFactorEnabled: true,
  },
  {
    id: "7",
    code: "USER-007",
    username: "ti",
    email: "ti@empresa.com",
    role: "customizado",
    status: "ativo",
    lastAccess: "Há 5 dias",
    twoFactorEnabled: false,
  },
  {
    id: "8",
    code: "USER-008",
    username: "vendas02",
    email: "vendas02@empresa.com",
    role: "vendedor",
    status: "inativo",
    employeeLinked: "Marcos Ferreira",
    lastAccess: "Há 3 meses",
    twoFactorEnabled: false,
  },
  {
    id: "9",
    code: "USER-009",
    username: "vendas03",
    email: "vendas03@empresa.com",
    role: "vendedor",
    status: "bloqueado",
    employeeLinked: "Patricia Rocha",
    lastAccess: "Há 1 semana",
    twoFactorEnabled: false,
  },
]

const statusConfig = {
  ativo: { label: "Ativo", className: "text-green-600 bg-green-50" },
  inativo: { label: "Inativo", className: "text-muted-foreground bg-muted" },
  bloqueado: { label: "Bloqueado", className: "text-red-600 bg-red-50" },
}

const roleConfig = {
  admin: { label: "Administrador", className: "text-purple-600 bg-purple-50" },
  manager: { label: "Gerente", className: "text-blue-600 bg-blue-50" },
  vendedor: { label: "Vendedor", className: "text-green-600 bg-green-50" },
  estoquista: { label: "Estoquista", className: "text-orange-600 bg-orange-50" },
  financeiro: { label: "Financeiro", className: "text-yellow-600 bg-yellow-50" },
  customizado: { label: "Customizado", className: "text-gray-600 bg-gray-50" },
}

export function UserList() {
  const [users] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [availableFilters, setAvailableFilters] = useState<FilterOption[]>([
    { id: "period", label: "Período", enabled: true },
    { id: "role", label: "Perfil", enabled: true },
    { id: "status", label: "Status", enabled: true },
  ])

  useEffect(() => {
    const savedFilters = localStorage.getItem("usuarios-filters")
    if (savedFilters) {
      setAvailableFilters(JSON.parse(savedFilters))
    }
  }, [])

  const filteredUsers = users.filter((user) => {
    const normalizeText = (text: string) =>
      text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[.\-/\s()@]/g, "")

    const searchNormalized = normalizeText(searchTerm)

    const matchesSearch =
      searchTerm === "" ||
      normalizeText(user.username).includes(searchNormalized) ||
      normalizeText(user.code).includes(searchNormalized) ||
      normalizeText(user.email).includes(searchNormalized) ||
      (user.employeeLinked && normalizeText(user.employeeLinked).includes(searchNormalized))

    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const handleSaveFilters = (filters: FilterOption[]) => {
    setAvailableFilters(filters)
    localStorage.setItem("usuarios-filters", JSON.stringify(filters))
  }

  const handleNewUser = () => {
    console.log("Novo usuário")
  }

  return (
    <div className="space-y-6">
      {/* Filters + Action Button */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email, código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-8"
              />
            </div>
            {availableFilters.find((f) => f.id === "period")?.enabled && <PeriodFilter />}
            {availableFilters.find((f) => f.id === "role")?.enabled && (
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px] h-8 text-sm bg-background">
                  <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Perfis</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="estoquista">Estoquista</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="customizado">Customizado</SelectItem>
                </SelectContent>
              </Select>
            )}
            {availableFilters.find((f) => f.id === "status")?.enabled && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] h-8 text-sm bg-background">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="bloqueado">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            )}
            <div className="ml-auto flex items-center gap-2">
              <FilterCustomizer filters={availableFilters} onSave={handleSaveFilters} />
              <button
                type="button"
                onClick={handleNewUser}
                className="text-primary hover:text-primary/80 transition-colors"
                title="Novo Usuário"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Dados
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Perfil
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Colaborador
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Último Acesso
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    2FA
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => {
                  const status = statusConfig[user.status]
                  const role = roleConfig[user.role]
                  return (
                    <tr
                      key={user.id}
                      className={cn(
                        "border-b border-border transition-colors hover:bg-muted/30",
                        index % 2 === 0 ? "bg-card" : "bg-muted/10"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <Shield className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.username}</p>
                            <p className="text-xs text-muted-foreground">{user.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm text-foreground">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className={cn("gap-1.5", role.className)}>
                          <Shield className="h-3 w-3" />
                          {role.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {user.employeeLinked ? (
                            <>
                              <UserCheck className="h-3.5 w-3.5 text-green-600" />
                              <span className="text-sm text-foreground">{user.employeeLinked}</span>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">Não vinculado</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {user.lastAccess || "Nunca"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          {user.twoFactorEnabled ? (
                            <Badge variant="secondary" className="text-green-600 bg-green-50 gap-1">
                              <Lock className="h-3 w-3" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-muted-foreground bg-muted">
                              Inativo
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <Badge variant="secondary" className={cn("gap-1", status.className)}>
                            {status.label}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Lock className="mr-2 h-4 w-4" />
                                Redefinir Senha
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredUsers.length} de {users.length} usuários
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled className="bg-transparent">
                Anterior
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                1
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent">
                Próximo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
