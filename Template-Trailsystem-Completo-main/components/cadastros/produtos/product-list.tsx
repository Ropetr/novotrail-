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
  Copy,
  Eye,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { ProductForm } from "./product-form"

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

const mockProducts: Product[] = [
  {
    id: "1",
    sku: "DRY-001",
    name: "Placa Drywall ST 12.5mm",
    category: "Drywall",
    brand: "Placo",
    price: 45.90,
    cost: 32.00,
    stock: 2450,
    status: "active",
    ean: "7891234567890",
  },
  {
    id: "2",
    sku: "PER-001",
    name: "Perfil Montante 70mm",
    category: "Steel Frame",
    brand: "Gypsum",
    price: 28.50,
    cost: 18.00,
    stock: 1820,
    status: "active",
    ean: "7891234567891",
  },
  {
    id: "3",
    sku: "MAS-001",
    name: "Massa para Drywall 28kg",
    category: "Acessórios",
    brand: "Placo",
    price: 85.00,
    cost: 55.00,
    stock: 0,
    status: "out_of_stock",
    ean: "7891234567892",
  },
  {
    id: "4",
    sku: "PAR-001",
    name: "Parafuso Drywall 25mm",
    category: "Ferramentas",
    brand: "Ciser",
    price: 32.00,
    cost: 18.00,
    stock: 3200,
    status: "active",
    ean: "7891234567893",
  },
  {
    id: "5",
    sku: "FIT-001",
    name: "Fita Telada 50m",
    category: "Acessórios",
    brand: "3M",
    price: 28.00,
    cost: 15.00,
    stock: 850,
    status: "active",
    ean: "7891234567894",
  },
  {
    id: "6",
    sku: "CAN-001",
    name: "Perfil Canaleta 40mm",
    category: "Steel Frame",
    brand: "Gypsum",
    price: 22.00,
    cost: 12.00,
    stock: 120,
    status: "inactive",
    ean: "7891234567895",
  },
]

const statusConfig = {
  active: { label: "Ativo", icon: CheckCircle, className: "text-green-600 bg-green-50" },
  inactive: { label: "Inativo", icon: XCircle, className: "text-muted-foreground bg-muted" },
  out_of_stock: { label: "Sem Estoque", icon: AlertCircle, className: "text-orange-600 bg-orange-50" },
}

export function ProductList() {
  const [products] = useState<Product[]>(mockProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewMode, setViewMode] = useState<"new" | "edit" | "view">("new")

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.ean.includes(searchTerm)

    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const categories = [...new Set(products.map((p) => p.category))]

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

  const getDialogTitle = () => {
    if (viewMode === "new") return "Novo Produto"
    if (viewMode === "edit") return "Editar Produto"
    return "Visualizar Produto"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie o cadastro de produtos do sistema
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
            onClick={handleNewProduct}
            className="text-primary hover:text-primary/80 transition-colors"
            title="Novo Produto"
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
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produtos Ativos
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter((p) => p.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sem Estoque
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter((p) => p.status === "out_of_stock").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor em Estoque
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(products.reduce((acc, p) => acc + p.cost * p.stock, 0))}
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
                placeholder="Buscar por nome, SKU ou EAN..."
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
                <SelectItem value="out_of_stock">Sem Estoque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    SKU / EAN
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Custo
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estoque
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
                {filteredProducts.map((product, index) => {
                  const status = statusConfig[product.status]
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
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-mono text-sm text-foreground">{product.sku}</p>
                          <p className="font-mono text-xs text-muted-foreground">{product.ean}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{product.category}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(product.cost)}
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
                            product.stock === 0
                              ? "text-destructive"
                              : product.stock < 200
                              ? "text-orange-600"
                              : "text-foreground"
                          )}
                        >
                          {product.stock.toLocaleString("pt-BR")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <Badge
                            variant="secondary"
                            className={cn("gap-1", status.className)}
                          >
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
              Mostrando {filteredProducts.length} de {products.length} produtos
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled className="bg-transparent">
                Anterior
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                1
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent">
                2
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent">
                3
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
            <ProductForm
              product={editingProduct}
              onClose={handleCloseForm}
              viewMode={viewMode}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
