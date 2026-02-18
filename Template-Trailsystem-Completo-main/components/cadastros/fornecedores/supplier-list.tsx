"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Building2,
  DollarSign,
  Package,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { SupplierForm } from "./supplier-form"

interface Supplier {
  id: string
  code: string
  name: string
  tradeName: string
  document: string
  email: string
  phone: string
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Fornecedores</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie o cadastro de fornecedores do sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-primary hover:text-primary/80 transition-colors"
            title="Importar"
          >
            <Upload className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="text-primary hover:text-primary/80 transition-colors"
            title="Exportar"
          >
            <Download className="h-5 w-5" />
          </button>
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Fornecedores
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fornecedores Ativos
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suppliers.filter((s) => s.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categorias
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total a Pagar
            </CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Math.abs(suppliers.reduce((acc, s) => acc + Math.min(0, s.balance), 0)))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, código ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

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
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {supplier.phone}
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

      {/* Modal de Cadastro/Edição/Visualização */}
      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <SupplierForm
              supplier={editingSupplier}
              onClose={handleCloseForm}
              viewMode={viewMode}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
