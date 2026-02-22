"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
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
import { ProductForm } from "./product-form"
import { PeriodFilter } from "@/components/common/period-filter"
import { FilterCustomizer, FilterOption } from "@/components/common/filter-customizer"
import { useProdutos, useRemoveProduto } from "@/hooks/use-produtos"

interface Product {
  id: string
  sku: string
  name: string
  category: string
  brand: string
  price: number
  cost: number
  stock: number
  status: "active" | "inactive" | "out_of_stock"
  ean: string
  image?: string
}

const statusConfig = {
  active: { label: "Ativo", icon: CheckCircle, className: "text-green-600 bg-green-50" },
  inactive: { label: "Inativo", icon: XCircle, className: "text-muted-foreground bg-muted" },
  out_of_stock: { label: "Sem Estoque", icon: AlertCircle, className: "text-orange-600 bg-orange-50" },
}

export function ProductList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewMode, setViewMode] = useState<"new" | "edit" | "view">("new")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [availableFilters, setAvailableFilters] = useState<FilterOption[]>([
    { id: "period", label: "Período", enabled: true },
    { id: "category", label: "Categoria", enabled: true },
    { id: "status", label: "Status", enabled: true },
  ])

  const { data, isLoading, error } = useProdutos({
    page,
    limit: 20,
    search: searchTerm || undefined,
  })

  const removeProduto = useRemoveProduto()

  const products = (data?.data ?? []) as unknown as Product[]
  const pagination = data?.pagination

  useEffect(() => {
    const savedFilters = localStorage.getItem("produtos-filters")
    if (savedFilters) {
      setAvailableFilters(JSON.parse(savedFilters))
    }
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter
    return matchesCategory && matchesStatus
  })

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleNewProduct = () => {
    setEditingProduct(null)
    setViewMode("new")
    setShowForm(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setViewMode("edit")
    setShowForm(true)
  }

  const handleViewProduct = (product: Product) => {
    setEditingProduct(product)
    setViewMode("view")
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  const handleSaveFilters = (filters: FilterOption[]) => {
    setAvailableFilters(filters)
    localStorage.setItem("produtos-filters", JSON.stringify(filters))
  }

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (productToDelete) {
      removeProduto.mutate(productToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setProductToDelete(null)
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
                placeholder="Buscar por nome, SKU ou EAN..."
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
                  <SelectItem value="out_of_stock">Sem Estoque</SelectItem>
                </SelectContent>
              </Select>
            )}
            <div className="ml-auto flex items-center gap-2">
              <FilterCustomizer filters={availableFilters} onSave={handleSaveFilters} />
              <button
                type="button"
                onClick={handleNewProduct}
                className="text-primary hover:text-primary/80 transition-colors"
                title="Novo Produto"
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
            <ProductForm
              product={editingProduct}
              onClose={handleCloseForm}
              viewMode={viewMode}
            />
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Carregando produtos...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-destructive">
                Erro ao carregar produtos. Verifique sua conexão.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 h-8">
                      <th className="px-4 py-0 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-4 py-0 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-4 py-0 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Marca
                      </th>
                      <th className="px-4 py-0 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Custo
                      </th>
                      <th className="px-4 py-0 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Preço
                      </th>
                      <th className="px-4 py-0 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Estoque
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
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                          Nenhum produto encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product, index) => {
                        const status = statusConfig[product.status] ?? statusConfig.inactive
                        const StatusIcon = status.icon
                        return (
                          <tr
                            key={product.id}
                            className={cn(
                              "border-b border-border transition-colors hover:bg-muted/30",
                              index % 2 === 0 ? "bg-card" : "bg-muted/10"
                            )}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <Package className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="font-medium text-foreground">{product.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    SKU: <span className="font-mono">{product.sku}</span>
                                    <span className="mx-2 text-muted-foreground/50">|</span>
                                    EAN: <span className="font-mono">{product.ean}</span>
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary">{product.category}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-muted-foreground">{product.brand}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm text-muted-foreground">
                                {formatCurrency(product.cost ?? 0)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm font-medium text-foreground">
                                {formatCurrency(product.price)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span
                                className={cn(
                                  "text-sm font-medium",
                                  (product.stock ?? 0) === 0
                                    ? "text-destructive"
                                    : (product.stock ?? 0) < 200
                                    ? "text-orange-600"
                                    : "text-foreground"
                                )}
                              >
                                {(product.stock ?? 0).toLocaleString("pt-BR")}
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
                                    <DropdownMenuItem onClick={() => handleViewProduct(product)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Visualizar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Copy className="mr-2 h-4 w-4" />
                                      Duplicar
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => handleDeleteClick(product)}
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
                    ? `Mostrando ${products.length} de ${pagination.total} produtos`
                    : `Mostrando ${filteredProducts.length} produtos`}
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
              Tem certeza que deseja excluir o produto{" "}
              <span className="font-semibold">{productToDelete?.name}</span>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setDeleteDialogOpen(false); setProductToDelete(null) }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={removeProduto.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeProduto.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}









