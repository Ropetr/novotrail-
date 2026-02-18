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
  FileText,
  CheckCircle,
  Clock,
  Truck,
  DollarSign,
  XCircle,
  Package,
  Download,
  Send,
  Calendar,
  User,
  Users,
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
import { SaleForm } from "./sale-form"
import { PeriodFilter } from "@/components/common/period-filter"
import { FilterCustomizer, FilterOption } from "@/components/common/filter-customizer"

interface Sale {
  id: string
  number: string
  date: string
  clientName: string
  clientDocument: string
  seller: string
  items: number
  totalValue: number
  discount: number
  finalValue: number
  status: "pending" | "confirmed" | "separated" | "shipped" | "delivered" | "cancelled"
  paymentStatus: "pending" | "partial" | "paid"
  paymentMethod: string
  notes?: string
}

const mockSales: Sale[] = [
  {
    id: "1",
    number: "VND-2024-001",
    date: "2024-01-20",
    clientName: "Construtora Horizonte Ltda",
    clientDocument: "12.345.678/0001-90",
    seller: "Rodrigo Silva",
    items: 8,
    totalValue: 45890.00,
    discount: 2294.50,
    finalValue: 43595.50,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Boleto Bancário",
    notes: "Entrega realizada em 25/01/2024",
  },
  {
    id: "2",
    number: "VND-2024-002",
    date: "2024-01-22",
    clientName: "MegaObras Construções",
    clientDocument: "23.456.789/0001-01",
    seller: "Maria Santos",
    items: 12,
    totalValue: 89450.00,
    discount: 0,
    finalValue: 89450.00,
    status: "shipped",
    paymentStatus: "partial",
    paymentMethod: "Cartão de Crédito",
    notes: "Entrega prevista para 28/01/2024",
  },
  {
    id: "3",
    number: "VND-2024-003",
    date: "2024-01-23",
    clientName: "José Roberto da Silva",
    clientDocument: "123.456.789-00",
    seller: "Rodrigo Silva",
    items: 5,
    totalValue: 12890.00,
    discount: 644.50,
    finalValue: 12245.50,
    status: "separated",
    paymentStatus: "paid",
    paymentMethod: "PIX",
  },
  {
    id: "4",
    number: "VND-2024-004",
    date: "2024-01-24",
    clientName: "Decor Plus Acabamentos Ltda",
    clientDocument: "34.567.890/0001-12",
    seller: "Maria Santos",
    items: 15,
    totalValue: 67890.00,
    discount: 3394.50,
    finalValue: 64495.50,
    status: "confirmed",
    paymentStatus: "pending",
    paymentMethod: "Boleto Bancário",
    notes: "Aguardando confirmação do pagamento",
  },
  {
    id: "5",
    number: "VND-2024-005",
    date: "2024-01-25",
    clientName: "Steel House Estruturas",
    clientDocument: "45.678.901/0001-23",
    seller: "Rodrigo Silva",
    items: 6,
    totalValue: 28900.00,
    discount: 0,
    finalValue: 28900.00,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "À definir",
  },
  {
    id: "6",
    number: "VND-2024-006",
    date: "2024-01-18",
    clientName: "Obras & Reformas XYZ",
    clientDocument: "56.789.012/0001-34",
    seller: "Maria Santos",
    items: 10,
    totalValue: 54200.00,
    discount: 2710.00,
    finalValue: 51490.00,
    status: "cancelled",
    paymentStatus: "pending",
    paymentMethod: "Cartão de Crédito",
    notes: "Cancelado por solicitação do cliente",
  },
]

const statusConfig = {
  pending: {
    label: "Pendente",
    icon: Clock,
    className: "text-yellow-600 bg-yellow-50"
  },
  confirmed: {
    label: "Confirmada",
    icon: CheckCircle,
    className: "text-blue-600 bg-blue-50"
  },
  separated: {
    label: "Separada",
    icon: Package,
    className: "text-purple-600 bg-purple-50"
  },
  shipped: {
    label: "Enviada",
    icon: Truck,
    className: "text-orange-600 bg-orange-50"
  },
  delivered: {
    label: "Entregue",
    icon: CheckCircle,
    className: "text-green-600 bg-green-50"
  },
  cancelled: {
    label: "Cancelada",
    icon: XCircle,
    className: "text-red-600 bg-red-50"
  },
}

const paymentStatusConfig = {
  pending: {
    label: "Pendente",
    className: "text-red-600 bg-red-50"
  },
  partial: {
    label: "Parcial",
    className: "text-orange-600 bg-orange-50"
  },
  paid: {
    label: "Pago",
    className: "text-green-600 bg-green-50"
  },
}

export function SaleList() {
  const [sales] = useState<Sale[]>(mockSales)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [periodFilter, setPeriodFilter] = useState("30dias")
  const [sellerFilter, setSellerFilter] = useState("todos")
  const [partnerFilter, setPartnerFilter] = useState("todos")
  const [showForm, setShowForm] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [viewMode, setViewMode] = useState<"new" | "edit" | "view">("new")

  // Filtros customizáveis
  const [availableFilters, setAvailableFilters] = useState<FilterOption[]>([
    { id: "period", label: "Período", enabled: true },
    { id: "seller", label: "Vendedor", enabled: true },
    { id: "partner", label: "Parceiro", enabled: true },
    { id: "status", label: "Status", enabled: true },
    { id: "payment", label: "Pagamento", enabled: true },
  ])

  const handleSaveFilters = (filters: FilterOption[]) => {
    setAvailableFilters(filters)
    // Aqui você pode salvar no localStorage ou backend
    localStorage.setItem("vendas-filters", JSON.stringify(filters))
  }

  // Carregar filtros salvos ao montar o componente
  useEffect(() => {
    const savedFilters = localStorage.getItem("vendas-filters")
    if (savedFilters) {
      setAvailableFilters(JSON.parse(savedFilters))
    }
  }, [])

  const handleNewSale = () => {
    setEditingSale(null)
    setViewMode("new")
    setShowForm(true)
  }

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale)
    setViewMode("edit")
    setShowForm(true)
  }

  const handleViewSale = (sale: Sale) => {
    setEditingSale(sale)
    setViewMode("view")
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingSale(null)
    setViewMode("new")
  }

  const filteredSales = sales.filter((sale) => {
    const normalizeText = (text: string) =>
      text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[.\-/\s()]/g, "")

    const searchNormalized = normalizeText(searchTerm)

    const matchesSearch =
      searchTerm === "" ||
      normalizeText(sale.number).includes(searchNormalized) ||
      normalizeText(sale.clientName).includes(searchNormalized) ||
      normalizeText(sale.clientDocument).includes(searchNormalized) ||
      normalizeText(sale.seller).includes(searchNormalized)

    const matchesStatus = statusFilter === "all" || sale.status === statusFilter
    const matchesPayment = paymentFilter === "all" || sale.paymentStatus === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR")
  }

  return (
    <div className="space-y-6">
      {/* Formulário de Venda */}
      {showForm && (
        <Card className="transition-all duration-300 ease-in-out">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-end">
              <Button variant="ghost" size="sm" onClick={handleCloseForm}>
                Fechar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <SaleForm sale={editingSale} onClose={handleCloseForm} viewMode={viewMode} />
          </CardContent>
        </Card>
      )}

      {/* Filters + Action Button */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, cliente ou vendedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-8"
              />
            </div>

            {/* Filtro de Período */}
            {availableFilters.find((f) => f.id === "period")?.enabled && <PeriodFilter />}

            {/* Filtro de Vendedor */}
            {availableFilters.find((f) => f.id === "seller")?.enabled && (
              <Select value={sellerFilter} onValueChange={setSellerFilter}>
                <SelectTrigger className="w-[155px] h-8 text-sm bg-background">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Vendedor:</span>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="rodrigo">Rodrigo Silva</SelectItem>
                  <SelectItem value="maria">Maria Santos</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Filtro de Parceiro */}
            {availableFilters.find((f) => f.id === "partner")?.enabled && (
              <Select value={partnerFilter} onValueChange={setPartnerFilter}>
                <SelectTrigger className="w-[145px] h-8 text-sm bg-background">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Parceiro:</span>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="direto">Direto</SelectItem>
                  <SelectItem value="revenda">Revenda</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Filtro de Status */}
            {availableFilters.find((f) => f.id === "status")?.enabled && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] h-8">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="separated">Separada</SelectItem>
                  <SelectItem value="shipped">Enviada</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Filtro de Pagamento */}
            {availableFilters.find((f) => f.id === "payment")?.enabled && (
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-[160px] h-8">
                  <DollarSign className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Ações: Customizar e Novo */}
            <div className="ml-auto flex items-center gap-2">
              <FilterCustomizer filters={availableFilters} onSave={handleSaveFilters} />
              <button
                type="button"
                onClick={handleNewSale}
                className="text-primary hover:text-primary/80 transition-colors"
                title="Nova Venda"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Venda
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Vendedor
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Itens
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Valor Final
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Pagamento
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
                {filteredSales.map((sale, index) => {
                  const status = statusConfig[sale.status]
                  const StatusIcon = status.icon
                  const paymentStatus = paymentStatusConfig[sale.paymentStatus]

                  return (
                    <tr
                      key={sale.id}
                      className={cn(
                        "border-b border-border transition-colors hover:bg-muted/30",
                        index % 2 === 0 ? "bg-card" : "bg-muted/10"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{sale.number}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(sale.date)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{sale.clientName}</p>
                          <p className="text-xs font-mono text-muted-foreground">{sale.clientDocument}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-foreground">{sale.seller}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="secondary">
                          {sale.items} {sale.items === 1 ? "item" : "itens"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div>
                          <span className="text-sm font-medium text-foreground">
                            {formatCurrency(sale.finalValue)}
                          </span>
                          {sale.discount > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Desc: {formatCurrency(sale.discount)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant="secondary" className={cn("gap-1", paymentStatus.className)}>
                            <DollarSign className="h-3 w-3" />
                            {paymentStatus.label}
                          </Badge>
                          <p className="text-xs text-muted-foreground">{sale.paymentMethod}</p>
                        </div>
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
                              <DropdownMenuItem onClick={() => handleViewSale(sale)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Baixar PDF
                              </DropdownMenuItem>
                              {(sale.status === "pending" || sale.status === "confirmed") && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleEditSale(sale)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                </>
                              )}
                              {sale.status !== "cancelled" && sale.status !== "delivered" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-blue-600">
                                    <Send className="mr-2 h-4 w-4" />
                                    Avançar Status
                                  </DropdownMenuItem>
                                </>
                              )}
                              {sale.paymentStatus !== "paid" && (
                                <DropdownMenuItem className="text-green-600">
                                  <DollarSign className="mr-2 h-4 w-4" />
                                  Registrar Pagamento
                                </DropdownMenuItem>
                              )}
                              {sale.status === "pending" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancelar Venda
                                  </DropdownMenuItem>
                                </>
                              )}
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
              Mostrando {filteredSales.length} de {sales.length} vendas
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
