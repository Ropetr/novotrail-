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
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Loader,
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
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { EmployeeForm } from "./employee-form"
import { PeriodFilter } from "@/components/common/period-filter"
import { FilterCustomizer, FilterOption } from "@/components/common/filter-customizer"
import { useColaboradores, useRemoveColaborador } from "@/hooks/use-colaboradores"

export interface Employee {
  id: string
  code: string
  name: string
  cpf: string
  email: string
  phone: string
  cellphone?: string
  position: string
  department: string
  admissionDate: string
  contractType: "CLT" | "PJ" | "Estagio" | "Temporario"
  status: "ativo" | "ferias" | "afastado" | "desligado"
}

const statusConfig = {
  ativo: { label: "Ativo", className: "text-green-600 bg-green-50" },
  ferias: { label: "Férias", className: "text-blue-600 bg-blue-50" },
  afastado: { label: "Afastado", className: "text-orange-600 bg-orange-50" },
  desligado: { label: "Desligado", className: "text-muted-foreground bg-muted" },
}

const contractTypeLabels = {
  CLT: "CLT",
  PJ: "PJ",
  Estagio: "Estágio",
  Temporario: "Temporário",
}

export function EmployeeList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [viewMode, setViewMode] = useState<"new" | "edit" | "view">("new")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const [availableFilters, setAvailableFilters] = useState<FilterOption[]>([
    { id: "period", label: "Período", enabled: true },
    { id: "department", label: "Departamento", enabled: true },
    { id: "status", label: "Status", enabled: true },
  ])

  const { data, isLoading, error } = useColaboradores({
    page,
    limit: 20,
    search: searchTerm || undefined,
  })

  const removeColaborador = useRemoveColaborador()

  const employees = (data?.data ?? []) as unknown as Employee[]
  const pagination = data?.pagination

  useEffect(() => {
    const savedFilters = localStorage.getItem("colaboradores-filters")
    if (savedFilters) {
      setAvailableFilters(JSON.parse(savedFilters))
    }
  }, [])

  const departments = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)))

  const filteredEmployees = employees.filter((employee) => {
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter
    const matchesStatus = statusFilter === "all" || employee.status === statusFilter
    return matchesDepartment && matchesStatus
  })

  const handleNewEmployee = () => {
    setEditingEmployee(null)
    setViewMode("new")
    setShowForm(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setViewMode("edit")
    setShowForm(true)
  }

  const handleViewEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setViewMode("view")
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingEmployee(null)
  }

  const handleSaveFilters = (filters: FilterOption[]) => {
    setAvailableFilters(filters)
    localStorage.setItem("colaboradores-filters", JSON.stringify(filters))
  }

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (employeeToDelete) {
      removeColaborador.mutate(employeeToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setEmployeeToDelete(null)
        },
      })
    }
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
                placeholder="Buscar por nome, código, CPF..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="pl-9 h-8"
              />
            </div>
            {availableFilters.find((f) => f.id === "period")?.enabled && <PeriodFilter />}
            {availableFilters.find((f) => f.id === "department")?.enabled && (
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[180px] h-8 text-sm bg-background">
                  <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Departamentos</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
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
                  <SelectItem value="ferias">Férias</SelectItem>
                  <SelectItem value="afastado">Afastado</SelectItem>
                  <SelectItem value="desligado">Desligado</SelectItem>
                </SelectContent>
              </Select>
            )}
            <div className="ml-auto flex items-center gap-2">
              <FilterCustomizer filters={availableFilters} onSave={handleSaveFilters} />
              <button
                type="button"
                onClick={handleNewEmployee}
                className="text-primary hover:text-primary/80 transition-colors"
                title="Novo Colaborador"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário */}
      {showForm && (
        <Card className="transition-all duration-300 ease-in-out">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseForm}
                className="text-muted-foreground hover:text-foreground"
              >
                Fechar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <EmployeeForm
              employee={editingEmployee}
              onClose={handleCloseForm}
              viewMode={viewMode}
            />
          </CardContent>
        </Card>
      )}

      {/* Employees Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Carregando colaboradores...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-destructive">
                Erro ao carregar colaboradores. Verifique sua conexão.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Colaborador
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Dados
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Contato
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Cargo/Depto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Admissão
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Contrato
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
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                          Nenhum colaborador encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((employee, index) => {
                        const status = statusConfig[employee.status] ?? statusConfig.desligado
                        return (
                          <tr
                            key={employee.id}
                            className={cn(
                              "border-b border-border transition-colors hover:bg-muted/30",
                              index % 2 === 0 ? "bg-card" : "bg-muted/10"
                            )}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                  <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{employee.name}</p>
                                  <p className="text-xs text-muted-foreground">{employee.code}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                <p className="font-mono text-sm text-foreground">{employee.cpf}</p>
                                <p className="text-xs text-muted-foreground">{employee.position}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm text-foreground">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  {employee.email}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {employee.phone}
                                  {employee.cellphone && (
                                    <>
                                      <span className="text-muted-foreground/50">•</span>
                                      {employee.cellphone}
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm text-foreground">{employee.department}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm text-foreground">{employee.admissionDate}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center">
                                <Badge variant="outline" className="font-mono">
                                  {contractTypeLabels[employee.contractType] ?? employee.contractType}
                                </Badge>
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
                                    <DropdownMenuItem onClick={() => handleViewEmployee(employee)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Visualizar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => handleDeleteClick(employee)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  {pagination
                    ? `Mostrando ${employees.length} de ${pagination.total} colaboradores`
                    : `Mostrando ${filteredEmployees.length} colaboradores`}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || isLoading}
                    className="bg-transparent"
                  >
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                    {page}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination || page >= pagination.totalPages || isLoading}
                    className="bg-transparent"
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o colaborador{" "}
              <span className="font-semibold">{employeeToDelete?.name}</span>? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setDeleteDialogOpen(false); setEmployeeToDelete(null) }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={removeColaborador.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeColaborador.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
