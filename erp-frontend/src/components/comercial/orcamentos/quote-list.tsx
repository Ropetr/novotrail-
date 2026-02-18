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
  User,
  Users,
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
import { cn } from "@/lib/utils"
import { QuoteForm } from "./quote-form"
import { PeriodFilter } from "@/components/common/period-filter"
import { FilterCustomizer, FilterOption } from "@/components/common/filter-customizer"
import { useOrcamentos, useConverterOrcamentoEmVenda } from "@/hooks/use-orcamentos"

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

const statusConfig = {
  pending: { label: "Pendente", icon: Clock, className: "text-yellow-600 bg-yellow-50" },
  approved: { label: "Aprovado", icon: CheckCircle, className: "text-green-600 bg-green-50" },
  rejected: { label: "Recusado", icon: XCircle, className: "text-red-600 bg-red-50" },
  expired: { label: "Expirado", icon: Clock, className: "text-muted-foreground bg-muted" },
  converted: { label: "Convertido", icon: ShoppingCart, className: "text-blue-600 bg-blue-50" },
}

export function QuoteList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("all")
  const [sellerFilter, setSellerFilter] = useState("todos")
  const [partnerFilter, setPartnerFilter] = useState("todos")
  const [showForm, setShowForm] = useState(false)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  const [viewMode, setViewMode] = useState<"new" | "edit" | "view">("new")

  const [availableFilters, setAvailableFilters] = useState<FilterOption[]>([
    { id: "period", label: "Período", enabled: true },
    { id: "seller", label: "Vendedor", enabled: true },
    { id: "partner", label: "Parceiro", enabled: true },
    { id: "status", label: "Status", enabled: true },
  ])

  const { data, isLoading, error } = useOrcamentos({
    page,
    limit: 20,
    search: searchTerm || undefined,
  })

  const converterEmVenda = useConverterOrcamentoEmVenda()

  const quotes = (data?.data ?? []) as unknown as Quote[]
  const pagination = data?.pagination

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
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter
    return matchesStatus
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
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="pl-9 h-8"
              />
            </div>

            {availableFilters.find((f) => f.id === "period")?.enabled && <PeriodFilter />}

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
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Carregando orçamentos...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-destructive">
                Erro ao carregar orçamentos. Verifique sua conexão.
              </p>
            </div>
          ) : (
            <>
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
                    {filteredQuotes.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-12 text-center text-sm text-muted-foreground">
                          Nenhum orçamento encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredQuotes.map((quote, index) => {
                        const status = statusConfig[quote.status] ?? statusConfig.pending
                        const StatusIcon = status.icon

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
                                {formatCurrency(quote.totalValue ?? 0)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm text-muted-foreground">
                                {(quote.discount ?? 0) > 0 ? formatCurrency(quote.discount) : "-"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm font-medium text-foreground">
                                {formatCurrency(quote.finalValue ?? 0)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm">
                                <p className={cn("text-foreground", isExpiringSoon && "text-orange-600 font-medium")}>
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
                                        <DropdownMenuItem
                                          className="text-green-600"
                                          onClick={() => converterEmVenda.mutate(quote.id)}
                                        >
                                          <ShoppingCart className="mr-2 h-4 w-4" />
                                          Converter em Venda
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {quote.status === "approved" && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="text-green-600"
                                          onClick={() => converterEmVenda.mutate(quote.id)}
                                        >
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
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  {pagination
                    ? `Mostrando ${quotes.length} de ${pagination.total} orçamentos`
                    : `Mostrando ${filteredQuotes.length} orçamentos`}
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
    </div>
  )
}
