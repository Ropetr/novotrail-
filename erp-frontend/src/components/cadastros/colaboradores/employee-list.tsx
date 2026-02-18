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
import { cn } from "@/lib/utils"
import { EmployeeForm } from "./employee-form"
import { PeriodFilter } from "@/components/common/period-filter"
import { FilterCustomizer, FilterOption } from "@/components/common/filter-customizer"
import { Settings } from "lucide-react"

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

const mockEmployees: Employee[] = [
  {
    id: "1",
    code: "FUNC-001",
    name: "Rodrigo Silva",
    cpf: "123.456.789-00",
    email: "rodrigo.silva@empresa.com",
    phone: "(11) 3025-1234",
    cellphone: "(11) 98765-4321",
    position: "Gerente de Vendas",
    department: "Comercial",
    admissionDate: "15/01/2020",
    contractType: "CLT",
    status: "ativo",
  },
  {
    id: "2",
    code: "FUNC-002",
    name: "Maria Santos",
    cpf: "234.567.890-11",
    email: "maria.santos@empresa.com",
    phone: "(11) 3025-2345",
    cellphone: "(11) 97654-3210",
    position: "Vendedora",
    department: "Comercial",
    admissionDate: "10/03/2021",
    contractType: "CLT",
    status: "ativo",
  },
  {
    id: "3",
    code: "FUNC-003",
    name: "João Oliveira",
    cpf: "345.678.901-22",
    email: "joao.oliveira@empresa.com",
    phone: "(11) 3025-3456",
    cellphone: "(11) 96543-2109",
    position: "Estoquista",
    department: "Logística",
    admissionDate: "05/07/2019",
    contractType: "CLT",
    status: "ativo",
  },
  {
    id: "4",
    code: "FUNC-004",
    name: "Ana Costa",
    cpf: "456.789.012-33",
    email: "ana.costa@empresa.com",
    phone: "(11) 3025-4567",
    cellphone: "(11) 95432-1098",
    position: "Analista Financeiro",
    department: "Financeiro",
    admissionDate: "20/09/2020",
    contractType: "CLT",
    status: "ferias",
  },
  {
    id: "5",
    code: "FUNC-005",
    name: "Pedro Mendes",
    cpf: "567.890.123-44",
    email: "pedro.mendes@empresa.com",
    phone: "(11) 3025-5678",
    cellphone: "(11) 94321-0987",
    position: "Auxiliar Administrativo",
    department: "Administrativo",
    admissionDate: "12/02/2022",
    contractType: "CLT",
    status: "ativo",
  },
  {
    id: "6",
    code: "FUNC-006",
    name: "Carla Souza",
    cpf: "678.901.234-55",
    email: "carla.souza@empresa.com",
    phone: "(11) 3025-6789",
    cellphone: "(11) 93210-9876",
    position: "Desenvolvedora",
    department: "TI",
    admissionDate: "01/06/2021",
    contractType: "PJ",
    status: "ativo",
  },
  {
    id: "7",
    code: "FUNC-007",
    name: "Ricardo Lima",
    cpf: "789.012.345-66",
    email: "ricardo.lima@empresa.com",
    phone: "(11) 3025-7890",
    cellphone: "(11) 92109-8765",
    position: "Estagiário de Marketing",
    department: "Marketing",
    admissionDate: "15/08/2023",
    contractType: "Estagio",
    status: "ativo",
  },
  {
    id: "8",
    code: "FUNC-008",
    name: "Juliana Martins",
    cpf: "890.123.456-77",
    email: "juliana.martins@empresa.com",
    phone: "(11) 3025-8901",
    cellphone: "(11) 91098-7654",
    position: "Gerente de RH",
    department: "Recursos Humanos",
    admissionDate: "10/04/2018",
    contractType: "CLT",
    status: "ativo",
  },
  {
    id: "9",
    code: "FUNC-009",
    name: "Fernando Alves",
    cpf: "901.234.567-88",
    email: "fernando.alves@empresa.com",
    phone: "(11) 3025-9012",
    cellphone: "(11) 90987-6543",
    position: "Motorista",
    department: "Logística",
    admissionDate: "22/11/2019",
    contractType: "CLT",
    status: "afastado",
  },
  {
    id: "10",
    code: "FUNC-010",
    name: "Patricia Rocha",
    cpf: "012.345.678-99",
    email: "patricia.rocha@empresa.com",
    phone: "(11) 3025-0123",
    cellphone: "(11) 89876-5432",
    position: "Consultora",
    department: "Comercial",
    admissionDate: "05/05/2022",
    contractType: "Temporario",
    status: "ativo",
  },
  {
    id: "11",
    code: "FUNC-011",
    name: "Marcos Ferreira",
    cpf: "111.222.333-44",
    email: "marcos.ferreira@empresa.com",
    phone: "(11) 3025-1112",
    cellphone: "(11) 88765-4321",
    position: "Vendedor",
    department: "Comercial",
    admissionDate: "18/03/2020",
    contractType: "CLT",
    status: "desligado",
  },
]

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
  const [employees] = useState<Employee[]>(mockEmployees)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [viewMode, setViewMode] = useState<"new" | "edit" | "view">("new")
  const [availableFilters, setAvailableFilters] = useState<FilterOption[]>([
    { id: "period", label: "Período", enabled: true },
    { id: "department", label: "Departamento", enabled: true },
    { id: "status", label: "Status", enabled: true },
  ])

  useEffect(() => {
    const savedFilters = localStorage.getItem("colaboradores-filters")
    if (savedFilters) {
      setAvailableFilters(JSON.parse(savedFilters))
    }
  }, [])

  // Extrai departamentos únicos
  const departments = Array.from(new Set(employees.map((e) => e.department)))

  const filteredEmployees = employees.filter((employee) => {
    const normalizeText = (text: string) =>
      text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[.\-/\s()]/g, "")

    const searchNormalized = normalizeText(searchTerm)

    const matchesSearch =
      searchTerm === "" ||
      normalizeText(employee.name).includes(searchNormalized) ||
      normalizeText(employee.code).includes(searchNormalized) ||
      normalizeText(employee.cpf).includes(searchNormalized) ||
      normalizeText(employee.email).includes(searchNormalized) ||
      normalizeText(employee.phone).includes(searchNormalized) ||
      (employee.cellphone && normalizeText(employee.cellphone).includes(searchNormalized)) ||
      normalizeText(employee.position).includes(searchNormalized) ||
      normalizeText(employee.department).includes(searchNormalized)

    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter
    const matchesStatus = statusFilter === "all" || employee.status === statusFilter

    return matchesSearch && matchesDepartment && matchesStatus
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
                onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Formulário - Aparece entre filtros e tabela */}
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
                {filteredEmployees.map((employee, index) => {
                  const status = statusConfig[employee.status]
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
                            {contractTypeLabels[employee.contractType]}
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
              Mostrando {filteredEmployees.length} de {employees.length} colaboradores
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
