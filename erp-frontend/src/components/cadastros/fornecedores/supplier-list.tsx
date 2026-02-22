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
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
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
import { Card, CardContent } from "@/components/ui/card"
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
import { SupplierForm } from "./supplier-form"
import { PeriodFilter } from "@/components/common/period-filter"
import { FilterCustomizer, FilterOption } from "@/components/common/filter-customizer"
import { useFornecedores, useRemoveFornecedor } from "@/hooks/use-fornecedores"

interface Supplier {
  id: string
  code: string
  name: string
  tradeName: string
  document: string
  stateRegistration?: string
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

const statusConfig = {
  active: { label: "Ativo", icon: CheckCircle, className: "text-green-600 bg-green-50" },
  inactive: { label: "Inativo", icon: XCircle, className: "text-muted-foreground bg-muted" },
  pending: { label: "Pendente", icon: Clock, className: "text-orange-600 bg-orange-50" },
}

export function SupplierList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [viewMode, setViewMode] = useState<"new" | "edit" | "view">("new")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null)
  const [availableFilters, setAvailableFilters] = useState<FilterOption[]>([
    { id: "period", label: "Período", enabled: true },
    { id: "category", label: "Categoria", enabled: true },
    { id: "status", label: "Status", enabled: true },
  ])

  const { data, isLoading, error } = useFornecedores({
    page,
    limit: 20,
    search: searchTerm || undefined,
  })

  const removeFornecedor = useRemoveFornecedor()

  const suppliers = (data?.data ?? []) as unknown as Supplier[]
  const pagination = data?.pagination

  useEffect(() => {
    const savedFilters = localStorage.getItem("fornecedores-filters")
    if (savedFilters) {
      setAvailableFilters(JSON.parse(savedFilters))
    }
  }, [])

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesCategory = categoryFilter === "all" || supplier.category === categoryFilter
    const matchesStatus = statusFilter === "all" || supplier.status === statusFilter
    return matchesCategory && matchesStatus
  })

  const categories = [...new Set(suppliers.map((s) => s.category).filter(Boolean))]

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

  const handleSaveFilters = (filters: FilterOption[]) => {
    setAvailableFilters(filters)
    localStorage.setItem("fornecedores-filters", JSON.stringify(filters))
  }

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (supplierToDelete) {
      removeFornecedor.mutate(supplierToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setSupplierToDelete(null)
        },
      })
    }
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
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
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

      {/* Formulário */}
      {showForm && (
        <Card className="transition-all duration-300 ease-in-out">
          
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
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Carregando fornecedores...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-destructive">
                Erro ao carregar fornecedores. Verifique sua conexão.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 h-8">
                      <th className="px-4 py-0 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Fornecedor
                      </th>
                      <th className="px-4 py-0 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        CNPJ
                      </th>
                      <th className="px-4 py-0 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Contato
                      </th>
                      <th className="px-4 py-0 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-4 py-0 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Prazo Entrega
                      </th>
                      <th className="px-4 py-0 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Saldo
                      </th>
                      <th className="px-4 py-0 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-0 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                          Nenhum fornecedor encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredSuppliers.map((supplier, index) => {
                        const status = statusConfig[supplier.status] ?? statusConfig.inactive
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
                                <div>
                                  <p className="font-medium text-foreground">{supplier.tradeName || supplier.name}</p>
                                  <p className="text-xs text-muted-foreground">{supplier.code}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-mono text-sm text-foreground">{supplier.document}</p>
                              <p className="text-xs text-muted-foreground">
                                {supplier.stateRegistration || "Isento"}
                              </p>
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
                                  (supplier.balance ?? 0) < 0 ? "text-primary" : "text-foreground"
                                )}
                              >
                                {formatCurrency(supplier.balance ?? 0)}
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
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => handleDeleteClick(supplier)}
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
              <div className="flex items-center justify-between border-t border-border px-4 h-8">
                <p className="text-sm text-muted-foreground">
                  {pagination
                    ? `Mostrando ${suppliers.length} de ${pagination.total} fornecedores`
                    : `Mostrando ${filteredSuppliers.length} fornecedores`}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || isLoading}
                    className="h-8 w-8"
                    title="Anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[24px] text-center text-sm font-medium text-primary">
                    {page}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination || page >= pagination.totalPages || isLoading}
                    className="h-8 w-8"
                    title="Pr�ximo"
                  >
                    <ChevronRight className="h-4 w-4" />
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
              Tem certeza que deseja excluir o fornecedor{" "}
              <span className="font-semibold">
                {supplierToDelete?.tradeName || supplierToDelete?.name}
              </span>
              ? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setDeleteDialogOpen(false); setSupplierToDelete(null) }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={removeFornecedor.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeFornecedor.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}







