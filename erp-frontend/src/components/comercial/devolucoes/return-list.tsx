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
  XCircle,
  AlertCircle,
  DollarSign,
  PackageX,
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
import { ReturnForm } from "./return-form"
import { PeriodFilter } from "@/components/common/period-filter"
import { FilterCustomizer, FilterOption } from "@/components/common/filter-customizer"

interface Return {
  id: string
  number: string
  date: string
  saleNumber: string
  saleDate: string
  clientName: string
  clientDocument: string
  items: number
  returnValue: number
  status: "pending" | "approved" | "rejected" | "processing" | "completed"
  refundStatus: "pending" | "partial" | "completed"
  reason: string
  notes?: string
}

const mockReturns: Return[] = [
  {
    id: "1",
    number: "DEV-2024-001",
    date: "2024-01-25",
    saleNumber: "VND-2024-001",
    saleDate: "2024-01-20",
    clientName: "Construtora Horizonte Ltda",
    clientDocument: "12.345.678/0001-90",
    items: 3,
    returnValue: 5890.00,
    status: "completed",
    refundStatus: "completed",
    reason: "Produto com defeito",
    notes: "Troca realizada em 26/01/2024",
  },
  {
    id: "2",
    number: "DEV-2024-002",
    date: "2024-01-26",
    saleNumber: "VND-2024-002",
    saleDate: "2024-01-22",
    clientName: "MegaObras Construções",
    clientDocument: "23.456.789/0001-01",
    items: 5,
    returnValue: 15890.00,
    status: "processing",
    refundStatus: "partial",
    reason: "Produto errado entregue",
  },
  {
    id: "3",
    number: "DEV-2024-003",
    date: "2024-01-27",
    saleNumber: "VND-2024-003",
    saleDate: "2024-01-23",
    clientName: "José Roberto da Silva",
    clientDocument: "123.456.789-00",
    items: 2,
    returnValue: 2890.00,
    status: "approved",
    refundStatus: "pending",
    reason: "Arrependimento (7 dias)",
  },
  {
    id: "4",
    number: "DEV-2024-004",
    date: "2024-01-28",
    saleNumber: "VND-2024-004",
    saleDate: "2024-01-24",
    clientName: "Decor Plus Acabamentos Ltda",
    clientDocument: "34.567.890/0001-12",
    items: 8,
    returnValue: 28900.00,
    status: "pending",
    refundStatus: "pending",
    reason: "Produto danificado no transporte",
    notes: "Aguardando análise técnica",
  },
  {
    id: "5",
    number: "DEV-2024-005",
    date: "2024-01-29",
    saleNumber: "VND-2024-001",
    saleDate: "2024-01-20",
    clientName: "Construtora Horizonte Ltda",
    clientDocument: "12.345.678/0001-90",
    items: 1,
    returnValue: 890.00,
    status: "rejected",
    refundStatus: "pending",
    reason: "Produto usado além do prazo de garantia",
    notes: "Devolução negada - fora do prazo de garantia",
  },
]

const statusConfig = {
  pending: {
    label: "Pendente",
    icon: Clock,
    className: "text-yellow-600 bg-yellow-50"
  },
  approved: {
    label: "Aprovada",
    icon: CheckCircle,
    className: "text-green-600 bg-green-50"
  },
  rejected: {
    label: "Rejeitada",
    icon: XCircle,
    className: "text-red-600 bg-red-50"
  },
  processing: {
    label: "Processando",
    icon: AlertCircle,
    className: "text-blue-600 bg-blue-50"
  },
  completed: {
    label: "Concluída",
    icon: CheckCircle,
    className: "text-green-600 bg-green-50"
  },
}

const refundStatusConfig = {
  pending: {
    label: "Pendente",
    className: "text-yellow-600 bg-yellow-50"
  },
  partial: {
    label: "Parcial",
    className: "text-orange-600 bg-orange-50"
  },
  completed: {
    label: "Completo",
    className: "text-green-600 bg-green-50"
  },
}

export function ReturnList() {
  const [returns] = useState<Return[]>(mockReturns)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [refundFilter, setRefundFilter] = useState("all")
  const [periodFilter, setPeriodFilter] = useState("30dias")
  const [sellerFilter, setSellerFilter] = useState("todos")
  const [partnerFilter, setPartnerFilter] = useState("todos")
  const [showForm, setShowForm] = useState(false)
  const [editingReturn, setEditingReturn] = useState<Return | null>(null)
  const [viewMode, setViewMode] = useState<"new" | "edit" | "view">("new")

  // Filtros customizáveis
  const [availableFilters, setAvailableFilters] = useState<FilterOption[]>([
    { id: "period", label: "Período", enabled: true },
    { id: "seller", label: "Vendedor", enabled: true },
    { id: "partner", label: "Parceiro", enabled: true },
    { id: "status", label: "Status", enabled: true },
    { id: "refund", label: "Reembolso", enabled: true },
  ])

  const handleSaveFilters = (filters: FilterOption[]) => {
    setAvailableFilters(filters)
    localStorage.setItem("devolucoes-filters", JSON.stringify(filters))
  }

  useEffect(() => {
    const savedFilters = localStorage.getItem("devolucoes-filters")
    if (savedFilters) {
      setAvailableFilters(JSON.parse(savedFilters))
    }
  }, [])

  const handleNewReturn = () => {
    setEditingReturn(null)
    setViewMode("new")
    setShowForm(true)
  }

  const handleEditReturn = (returnItem: Return) => {
    setEditingReturn(returnItem)
    setViewMode("edit")
    setShowForm(true)
  }

  const handleViewReturn = (returnItem: Return) => {
    setEditingReturn(returnItem)
    setViewMode("view")
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingReturn(null)
    setViewMode("new")
  }

  const filteredReturns = returns.filter((returnItem) => {
    const normalizeText = (text: string) =>
      text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[.\-/\s()]/g, "")

    const searchNormalized = normalizeText(searchTerm)

    const matchesSearch =
      searchTerm === "" ||
      normalizeText(returnItem.number).includes(searchNormalized) ||
      normalizeText(returnItem.saleNumber).includes(searchNormalized) ||
      normalizeText(returnItem.clientName).includes(searchNormalized) ||
      normalizeText(returnItem.clientDocument).includes(searchNormalized)

    const matchesStatus = statusFilter === "all" || returnItem.status === statusFilter
    const matchesRefund = refundFilter === "all" || returnItem.refundStatus === refundFilter

    return matchesSearch && matchesStatus && matchesRefund
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
      {/* Formulário de Devolução */}
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
            <ReturnForm returnData={editingReturn} onClose={handleCloseForm} viewMode={viewMode} />
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
                placeholder="Buscar por número, venda ou cliente..."
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
                  <SelectItem value="approved">Aprovada</SelectItem>
                  <SelectItem value="rejected">Rejeitada</SelectItem>
                  <SelectItem value="processing">Processando</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Filtro de Reembolso */}
            {availableFilters.find((f) => f.id === "refund")?.enabled && (
              <Select value={refundFilter} onValueChange={setRefundFilter}>
                <SelectTrigger className="w-[160px] h-8">
                  <DollarSign className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Reembolso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="completed">Completo</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Ações: Customizar e Novo */}
            <div className="ml-auto flex items-center gap-2">
              <FilterCustomizer filters={availableFilters} onSave={handleSaveFilters} />
              <button
                type="button"
                onClick={handleNewReturn}
                className="text-primary hover:text-primary/80 transition-colors"
                title="Nova Devolução"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Returns Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Devolução
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Venda Origem
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Itens
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Reembolso
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
                {filteredReturns.map((returnItem, index) => {
                  const status = statusConfig[returnItem.status]
                  const StatusIcon = status.icon
                  const refundStatus = refundStatusConfig[returnItem.refundStatus]

                  return (
                    <tr
                      key={returnItem.id}
                      className={cn(
                        "border-b border-border transition-colors hover:bg-muted/30",
                        index % 2 === 0 ? "bg-card" : "bg-muted/10"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <PackageX className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{returnItem.number}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(returnItem.date)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{returnItem.saleNumber}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(returnItem.saleDate)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{returnItem.clientName}</p>
                          <p className="text-xs font-mono text-muted-foreground">{returnItem.clientDocument}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-foreground max-w-[200px] truncate" title={returnItem.reason}>
                          {returnItem.reason}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="secondary">
                          {returnItem.items} {returnItem.items === 1 ? "item" : "itens"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium text-foreground">
                          {formatCurrency(returnItem.returnValue)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <Badge variant="secondary" className={cn("gap-1", refundStatus.className)}>
                            <DollarSign className="h-3 w-3" />
                            {refundStatus.label}
                          </Badge>
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
                              <DropdownMenuItem onClick={() => handleViewReturn(returnItem)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Baixar PDF
                              </DropdownMenuItem>
                              {returnItem.status === "pending" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleEditReturn(returnItem)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-green-600">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Aprovar Devolução
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Rejeitar Devolução
                                  </DropdownMenuItem>
                                </>
                              )}
                              {returnItem.status === "approved" && returnItem.refundStatus !== "completed" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-blue-600">
                                    <Send className="mr-2 h-4 w-4" />
                                    Iniciar Processamento
                                  </DropdownMenuItem>
                                </>
                              )}
                              {returnItem.status === "processing" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-green-600">
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Registrar Reembolso
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-green-600">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Concluir Devolução
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
              Mostrando {filteredReturns.length} de {returns.length} devoluções
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
