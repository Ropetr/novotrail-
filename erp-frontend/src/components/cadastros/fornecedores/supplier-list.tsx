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
  Building2,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { SupplierForm } from "./supplier-form"
import { PeriodFilter } from "@/components/common/period-filter"
import { FilterCustomizer, FilterOption } from "@/components/common/filter-customizer"
import { Settings } from "lucide-react"

interface Supplier {
  id: string
  code: string
  name: string
  tradeName: string
  document: string
  email: string
  phone: string
  cellphone?: string
  city: string
  state: string
  status: "active" | "inactive" | "pending"
  category: string
  deliveryDays: number
  balance: number
  lastPurchase?: string
}

const mockSuppliers: Supplier[] = [
  {
    id: "1",
    code: "FOR-001",
    name: "Placo do Brasil S.A.",
    tradeName: "Placo",
    document: "12.345.678/0001-90",
    email: "comercial@placo.com.br",
    phone: "(11) 3025-1234",
    cellphone: "(11) 99876-5432",
    city: "São Paulo",
    state: "SP",
    status: "active",
    category: "Drywall",
    deliveryDays: 7,
    balance: -45000,
    lastPurchase: "2025-11-20",
  },
  {
    id: "2",
    code: "FOR-002",
    name: "Gypsum Nordeste Ltda",
    tradeName: "Gypsum",
    document: "23.456.789/0001-01",
    email: "vendas@gypsum.com.br",
    phone: "(81) 3322-5678",
    cellphone: "(81) 99123-4567",
    city: "Recife",
    state: "PE",
    status: "active",
    category: "Steel Frame",
    deliveryDays: 10,
    balance: -28500,
    lastPurchase: "2025-11-18",
  },
  {
    id: "3",
    code: "FOR-003",
    name: "Ciser Parafusos e Fixadores S.A.",
    tradeName: "Ciser",
    document: "34.567.890/0001-12",
    email: "vendas@ciser.com.br",
    phone: "(47) 3251-0000",
    cellphone: "(47) 99888-7777",
    city: "Joinville",
    state: "SC",
    status: "active",
    category: "Ferramentas",
    deliveryDays: 5,
    balance: -12800,
    lastPurchase: "2025-11-22",
  },
  {
    id: "4",
    code: "FOR-004",
    name: "3M do Brasil Ltda",
    tradeName: "3M",
    document: "45.678.901/0001-23",
    email: "industrial@3m.com.br",
    phone: "(11) 3838-3636",
    cellphone: "(11) 99765-4321",
    city: "Sumaré",
    state: "SP",
    status: "active",
    category: "Acessórios",
    deliveryDays: 3,
    balance: -8900,
    lastPurchase: "2025-11-15",
  },
  {
    id: "5",
    code: "FOR-005",
    name: "Distribuidora Centro Sul",
    tradeName: "Centro Sul",
    document: "56.789.012/0001-34",
    email: "compras@centrosul.com.br",
    phone: "(41) 3333-4444",
    cellphone: "(41) 99555-6666",
    city: "Curitiba",
    state: "PR",
    status: "inactive",
    category: "Diversos",
    deliveryDays: 14,
    balance: 0,
    lastPurchase: "2025-06-10",
  },
  {
    id: "6",
    code: "FOR-006",
    name: "Metalúrgica Paraná",
    tradeName: "Metalpar",
    document: "67.890.123/0001-45",
    email: "contato@metalpar.com.br",
    phone: "(44) 3025-9999",
    cellphone: "(44) 99444-3333",
    city: "Maringá",
    state: "PR",
    status: "pending",
    category: "Steel Frame",
    deliveryDays: 8,
    balance: 0,
  },
]

const statusConfig = {
  active: { label: "Ativo", icon: CheckCircle, className: "text-green-600 bg-green-50" },
  inactive: { label: "Inativo", icon: XCircle, className: "text-muted-foreground bg-muted" },
  pending: { label: "Pendente", icon: Clock, className: "text-orange-600 bg-orange-50" },
}

export function SupplierList() {
  const [suppliers] = useState<Supplier[]>(mockSuppliers)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [viewMode, setViewMode] = useState<"new" | "edit" | "view">("new")
  const [availableFilters, setAvailableFilters] = useState<FilterOption[]>([
    { id: "period", label: "Período", enabled: true },
    { id: "category", label: "Categoria", enabled: true },
    { id: "status", label: "Status", enabled: true },
  ])

  useEffect(() => {
    const savedFilters = localStorage.getItem("fornecedores-filters")
    if (savedFilters) {
      setAvailableFilters(JSON.parse(savedFilters))
    }
  }, [])

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.document.includes(searchTerm) ||
      supplier.tradeName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || supplier.category === categoryFilter
    const matchesStatus = statusFilter === "all" || supplier.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const categories = [...new Set(suppliers.map((s) => s.category))]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleNewSupplier = () => {
    setEditingSupplier(null)
    setViewMode("new")
    setShowForm(true)
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setViewMode("edit")
    setShowForm(true)
  }

  const handleViewSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setViewMode("view")
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingSupplier(null)
  }

  const getDialogTitle = () => {
    if (viewMode === "new") return "Novo Fornecedor"
    if (viewMode === "edit") return "Editar Fornecedor"
    return "Visualizar Fornecedor"
  }

  const handleSaveFilters = (filters: FilterOption[]) => {
    setAvailableFilters(filters)
    localStorage.setItem("fornecedores-filters", JSON.stringify(filters))
  }

  return (
    <div className="space-y-6">
      {/* Filters + Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, código ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-8"
              />
            </div>
            {availableFilters.find((f) => f.id === "period")?.enabled && <PeriodFilter />}
            {availableFilters.find((f) => f.id === "category")?.enabled && (
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px] h-8 text-sm bg-background">
                  <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
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
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>
            )}
            <div className="ml-auto flex items-center gap-2">
              <FilterCustomizer filters={availableFilters} onSave={handleSaveFilters} />
              <button
                type="button"
                onClick={handleNewSupplier}
                className="text-primary hover:text-primary/80 transition-colors"
                title="Novo Fornecedor"
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
            <SupplierForm
              supplier={editingSupplier}
              onClose={handleCloseForm}
              viewMode={viewMode}
            />
          </CardContent>
        </Card>
      )}

      {/* Suppliers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Fornecedor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    CNPJ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Prazo Entrega
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Saldo
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
                {filteredSuppliers.map((supplier, index) => {
                  const status = statusConfig[supplier.status]
                  const StatusIcon = status.icon
                  return (
                    <tr
                      key={supplier.id}
                      className={cn(
                        "border-b border-border transition-colors hover:bg-muted/30",
                        index % 2 === 0 ? "bg-card" : "bg-muted/10"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{supplier.tradeName}</p>
                            <p className="text-xs text-muted-foreground">{supplier.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-sm text-foreground">{supplier.document}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-foreground">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {supplier.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {supplier.phone}
                            {supplier.cellphone && (
                              <>
                                <span className="text-muted-foreground/50">•</span>
                                {supplier.cellphone}
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{supplier.category}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-foreground">{supplier.deliveryDays} dias</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            supplier.balance < 0 ? "text-red-600" : "text-foreground"
                          )}
                        >
                          {formatCurrency(supplier.balance)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <Badge variant="secondary" className={cn("gap-1", status.className)}>
                            <StatusIcon className="h-3 w-3" />
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
                              <DropdownMenuItem onClick={() => handleViewSupplier(supplier)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditSupplier(supplier)}>
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
              Mostrando {filteredSuppliers.length} de {suppliers.length} fornecedores
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
