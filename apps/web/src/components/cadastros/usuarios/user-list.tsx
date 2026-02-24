"use client"

import { useState, useEffect } from "react"
import {
  Plus, Search, Filter, MoreHorizontal, Trash2, Mail, Shield, Clock,
  UserCheck, User as UserIcon, Lock, ChevronLeft, ChevronRight, Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PeriodFilter } from "@/components/common/period-filter"
import { FilterCustomizer, FilterOption } from "@/components/common/filter-customizer"
import { useUsuarios, useUpdateUsuario, useDeleteUsuario } from "@/hooks/use-usuarios"

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Ativo", className: "text-green-600 bg-green-50" },
  inactive: { label: "Inativo", className: "text-muted-foreground bg-muted" },
}

const roleConfig: Record<string, { label: string; className: string }> = {
  admin: { label: "Administrador", className: "text-purple-600 bg-purple-50" },
  manager: { label: "Gerente", className: "text-blue-600 bg-blue-50" },
  user: { label: "Usuário", className: "text-green-600 bg-green-50" },
}

export function UserList() {
  const { data: usersData, isLoading } = useUsuarios()
  const updateUser = useUpdateUsuario()
  const deleteUser = useDeleteUsuario()

  const users = usersData?.data || []

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
    if (savedFilters) setAvailableFilters(JSON.parse(savedFilters))
  }, [])

  const filteredUsers = users.filter((user: any) => {
    const norm = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.\-/\s()@]/g, "")
    const s = norm(searchTerm)
    const matchSearch = !searchTerm || norm(user.name || "").includes(s) || norm(user.email || "").includes(s)
    const matchRole = roleFilter === "all" || user.role === roleFilter
    const matchStatus = statusFilter === "all" || user.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  const handleSaveFilters = (filters: FilterOption[]) => {
    setAvailableFilters(filters)
    localStorage.setItem("usuarios-filters", JSON.stringify(filters))
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por nome, email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-8" />
            </div>
            {availableFilters.find((f) => f.id === "period")?.enabled && <PeriodFilter />}
            {availableFilters.find((f) => f.id === "role")?.enabled && (
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px] h-8 text-sm bg-background">
                  <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" /><SelectValue placeholder="Perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Perfis</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                </SelectContent>
              </Select>
            )}
            {availableFilters.find((f) => f.id === "status")?.enabled && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] h-8 text-sm bg-background"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            )}
            <div className="ml-auto flex items-center gap-2">
              <FilterCustomizer filters={availableFilters} onSave={handleSaveFilters} />
              <button type="button" className="text-primary hover:text-primary/80 transition-colors" title="Novo Usuário">
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Carregando usuários...</span>
        </div>
      )}

      {/* Users Table */}
      {!isLoading && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50 h-8">
                    <th className="px-4 py-0 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuário</th>
                    <th className="px-4 py-0 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">E-mail</th>
                    <th className="px-4 py-0 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Perfil</th>
                    <th className="px-4 py-0 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Criado em</th>
                    <th className="px-4 py-0 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-4 py-0 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user: any, index: number) => {
                    const status = statusConfig[user.status] || { label: user.status, className: "" }
                    const role = roleConfig[user.role] || { label: user.role, className: "" }
                    return (
                      <tr key={user.id} className={cn("border-b border-border transition-colors hover:bg-muted/30", index % 2 === 0 ? "bg-card" : "bg-muted/10")}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <UserIcon className="h-4 w-4 text-primary" />
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.id.slice(0, 8)}</p>
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
                            <Shield className="h-3 w-3" />{role.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <Badge variant="secondary" className={cn("gap-1", status.className)}>{status.label}</Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => updateUser.mutate({ id: user.id, data: { status: user.status === "active" ? "inactive" : "active" } })}>
                                  <UserCheck className="mr-2 h-4 w-4" />{user.status === "active" ? "Desativar" : "Ativar"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm("Tem certeza que deseja excluir este usuário?")) deleteUser.mutate(user.id) }}>
                                  <Trash2 className="mr-2 h-4 w-4" />Excluir
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
            <div className="flex items-center justify-between border-t border-border px-4 h-8">
              <p className="text-sm text-muted-foreground">Mostrando {filteredUsers.length} de {users.length} usuários</p>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" disabled className="h-8 w-8" title="Anterior"><ChevronLeft className="h-4 w-4" /></Button>
                <span className="min-w-[24px] text-center text-sm font-medium text-primary">1</span>
                <Button variant="ghost" size="icon" disabled className="h-8 w-8" title="Próximo"><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
