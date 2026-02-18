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
  Copy,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ShoppingCart,
  Download,
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
import { QuoteForm } from "./quote-form"
import { PeriodFilter } from "@/components/common/period-filter"
import { FilterCustomizer, FilterOption } from "@/components/common/filter-customizer"

interface Quote {
  id: string
  number: string
  date: string
  validUntil: string
  clientName: string
  clientDocument: string
  seller: string
  items: number
  totalValue: number
  discount: number
  finalValue: number
  status: "pending" | "approved" | "rejected" | "expired" | "converted"
  notes?: string
}

const mockQuotes: Quote[] = [
  {
    id: "1",
    number: "ORC-2024-001",
    date: "2024-01-15",
    validUntil: "2024-02-15",
    clientName: "Construtora Horizonte Ltda",
    clientDocument: "12.345.678/0001-90",
    seller: "Rodrigo Silva",
    items: 8,
    totalValue: 45890.00,
    discount: 2294.50,
    finalValue: 43595.50,
    status: "approved",
    notes: "Cliente solicitou desconto por volume",
  },
  {
    id: "2",
    number: "ORC-2024-002",
    date: "2024-01-18",
    validUntil: "2024-02-18",
    clientName: "MegaObras Construções",
    clientDocument: "23.456.789/0001-01",
    seller: "Maria Santos",
    items: 12,
    totalValue: 89450.00,
    discount: 0,
    finalValue: 89450.00,
    status: "pending",
  },
  {
    id: "3",
    number: "ORC-2024-003",
    date: "2024-01-20",
    validUntil: "2024-02-20",
    clientName: "José Roberto da Silva",
    clientDocument: "123.456.789-00",
    seller: "Rodrigo Silva",
    items: 5,
    totalValue: 12890.00,
    discount: 644.50,
    finalValue: 12245.50,
    status: "converted",
    notes: "Convertido em venda VND-2024-015",
  },
  {
    id: "4",
    number: "ORC-2024-004",
    date: "2024-01-22",
    validUntil: "2024-02-22",
    clientName: "Decor Plus Acabamentos Ltda",
    clientDocument: "34.567.890/0001-12",
    seller: "Maria Santos",
    items: 15,
    totalValue: 67890.00,
    discount: 3394.50,
    finalValue: 64495.50,
    status: "pending",
  },
  {
    id: "5",
    number: "ORC-2024-005",
    date: "2024-01-10",
    validUntil: "2024-02-10",
    clientName: "Steel House Estruturas",
    clientDocument: "45.678.901/0001-23",
    seller: "Rodrigo Silva",
    items: 6,
    totalValue: 28900.00,
    discount: 0,
    finalValue: 28900.00,
    status: "rejected",
    notes: "Cliente achou o prazo de entrega muito longo",
  },
  {
    id: "6",
    number: "ORC-2024-006",
    date: "2023-12-15",
    validUntil: "2024-01-15",
    clientName: "Obras & Reformas XYZ",
    clientDocument: "56.789.012/0001-34",
    seller: "Maria Santos",
    items: 10,
    totalValue: 54200.00,
    discount: 2710.00,
    finalValue: 51490.00,
    status: "expired",
    notes: "Cliente não retornou contato",
  },
]

const statusConfig = {
  pending: {
    label: "Pendente",
    icon: Clock,
    className: "text-yellow-600 bg-yellow-50"
  },
  approved: {
    label: "Aprovado",
    icon: CheckCircle,
    className: "text-green-600 bg-green-50"
  },
  rejected: {
    label: "Recusado",
    icon: XCircle,
    className: "text-red-600 bg-red-50"
  },
  expired: {
    label: "Expirado",
    icon: Clock,
    className: "text-muted-foreground bg-muted"
  },
  converted: {
    label: "Convertido",
    icon: ShoppingCart,
    className: "text-blue-600 bg-blue-50"
  },
}

export function QuoteList() {
  const [quotes] = useState<Quote[]>(mockQuotes)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [periodFilter, setPeriodFilter] = useState("30dias")
  const [sellerFilter, setSellerFilter] = useState("todos")
  const [partnerFilter, setPartnerFilter] = useState("todos")
  const [showForm, setShowForm] = useState(false)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  const [viewMode, setViewMode] = useState<"new" | "edit" | "view">("new")

  // Filtros customizáveis
  const [availableFilters, setAvailableFilters] = useState<FilterOption[]>([
    { id: "period", label: "Período", enabled: true },
    { id: "seller", label: "Vendedor", enabled: true },
    { id: "partner", label: "Parceiro", enabled: true },
    { id: "status", label: "Status", enabled: true },
  ])

  const handleSaveFilters = (filters: FilterOption[]) => {
    setAvailableFilters(filters)
    localStorage.setItem("orcamentos-filters", JSON.stringify(filters))
  }

  useEffect(() => {
    const savedFilters = localStorage.getItem("orcamentos-filters")
    if (savedFilters) {
      setAvailableFilters(JSON.parse(savedFilters))
    }
  }, [])

  const handleNewQuote = () => {
    setEditingQuote(null)
    setViewMode("new")
    setShowForm(true)
  }

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote)
    setViewMode("edit")
    setShowForm(true)
  }

  const handleViewQuote = (quote: Quote) => {
    setEditingQuote(quote)
    setViewMode("view")
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingQuote(null)
    setViewMode("new")
  }

  const filteredQuotes = quotes.filter((quote) => {
    const normalizeText = (text: string) =>
      text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[.\-/\s()]/g, "")

    const searchNormalized = normalizeText(searchTerm)

    const matchesSearch =
      searchTerm === "" ||
      normalizeText(quote.number).includes(searchNormalized) ||
      normalizeText(quote.clientName).includes(searchNormalized) ||
      normalizeText(quote.clientDocument).includes(searchNormalized) ||
      normalizeText(quote.seller).includes(searchNormalized)

    const matchesStatus = statusFilter === "all" || quote.status === statusFilter

    // Filtro de data (últimos 30 dias, 60 dias, etc.)
    let matchesDate = true
    if (dateFilter !== "all") {
      const quoteDate = new Date(quote.date)
      const today = new Date()
      const daysDiff = Math.floor((today.getTime() - quoteDate.getTime()) / (1000 * 60 * 60 * 24))

      switch (dateFilter) {
        case "30":
          matchesDate = daysDiff <= 30
          break
        case "60":
          matchesDate = daysDiff <= 60
          break
        case "90":
          matchesDate = daysDiff <= 90
          break
      }
    }

    return matchesSearch && matchesStatus && matchesDate
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
      {/* Formulário de Orçamento */}
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
            <QuoteForm quote={editingQuote} onClose={handleCloseForm} viewMode={viewMode} />
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
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Recusado</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                  <SelectItem value="converted">Convertido</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Ações: Customizar e Novo */}
            <div className="ml-auto flex items-center gap-2">
              <FilterCustomizer filters={availableFilters} onSave={handleSaveFilters} />
              <button
                type="button"
                onClick={handleNewQuote}
                className="text-primary hover:text-primary/80 transition-colors"
                title="Novo Orçamento"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Orçamento
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
                    Total
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Desconto
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Valor Final
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Validade
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
                {filteredQuotes.map((quote, index) => {
                  const status = statusConfig[quote.status]
                  const StatusIcon = status.icon

                  // Verifica se está próximo do vencimento (últimos 7 dias)
                  const validDate = new Date(quote.validUntil)
                  const today = new Date()
                  const daysUntilExpiry = Math.floor((validDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 7 && quote.status === "pending"

                  return (
                    <tr
                      key={quote.id}
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
                            <p className="font-medium text-foreground">{quote.number}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(quote.date)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{quote.clientName}</p>
                          <p className="text-xs font-mono text-muted-foreground">{quote.clientDocument}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-foreground">{quote.seller}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="secondary">
                          {quote.items} {quote.items === 1 ? "item" : "itens"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(quote.totalValue)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm text-muted-foreground">
                          {quote.discount > 0 ? formatCurrency(quote.discount) : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium text-foreground">
                          {formatCurrency(quote.finalValue)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p className={cn(
                            "text-foreground",
                            isExpiringSoon && "text-orange-600 font-medium"
                          )}>
                            {formatDate(quote.validUntil)}
                          </p>
                          {isExpiringSoon && (
                            <p className="text-xs text-orange-600">
                              Expira em {daysUntilExpiry} {daysUntilExpiry === 1 ? "dia" : "dias"}
                            </p>
                          )}
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
                              <DropdownMenuItem onClick={() => handleViewQuote(quote)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Baixar PDF
                              </DropdownMenuItem>
                              {quote.status === "pending" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleEditQuote(quote)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-green-600">
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Converter em Venda
                                  </DropdownMenuItem>
                                </>
                              )}
                              {(quote.status === "approved" && quote.status !== "converted") && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-green-600">
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Converter em Venda
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
              Mostrando {filteredQuotes.length} de {quotes.length} orçamentos
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
