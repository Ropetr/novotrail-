"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { ClientForm } from "./client-form"
import { useTabs } from "@/contexts/tabs-context"
import { useExport } from "@/contexts/export-context"
import { useNavigate } from "react-router-dom"
import { PeriodFilter } from "@/components/common/period-filter"
import { FilterCustomizer, FilterOption } from "@/components/common/filter-customizer"
import { useClientes, useRemoveCliente } from "@/hooks/use-clientes"

interface Client {
  id: string
  code: string
  name: string
  tradeName?: string
  type: "pf" | "pj"
  document: string
  rg?: string
  stateRegistration?: string
  email: string
  phone: string
  cellphone?: string
  city: string
  state: string
  status: "active" | "inactive" | "blocked"
  creditLimit: number
  balance: number
  lastPurchase?: string
}

const statusConfig = {
  active: { label: "Ativo", className: "text-green-600 bg-green-50" },
  inactive: { label: "Inativo", className: "text-muted-foreground bg-muted" },
  blocked: { label: "Bloqueado", className: "text-primary bg-primary/10" },
}

export function ClientList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [viewMode, setViewMode] = useState<"new" | "edit" | "view">("new")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const { addTab } = useTabs()
  const { setExportData, consumeExportData } = useExport()
  const navigate = useNavigate()

  const { data, isLoading, error } = useClientes({
    page,
    limit: 20,
    search: searchTerm || undefined,
  })

  const removeCliente = useRemoveCliente()

  const clients = (data?.data ?? []) as unknown as Client[]
  const pagination = data?.pagination

  // Filtros customizáveis
  const [availableFilters, setAvailableFilters] = useState<FilterOption[]>([
    { id: "period", label: "Período", enabled: true },
    { id: "type", label: "Tipo (PF/PJ)", enabled: true },
    { id: "status", label: "Status", enabled: true },
  ])

  const handleSaveFilters = (filters: FilterOption[]) => {
    setAvailableFilters(filters)
    localStorage.setItem("clientes-filters", JSON.stringify(filters))
  }

  useEffect(() => {
    const savedFilters = localStorage.getItem("clientes-filters")
    if (savedFilters) {
      setAvailableFilters(JSON.parse(savedFilters))
    }

    const exportData = consumeExportData()
    if (exportData && exportData.targetType === "cliente") {
      const sourceData = exportData.data
      const clientData: Partial<Client> = {
        name: sourceData.name as string,
        tradeName: sourceData.tradeName as string | undefined,
        type: sourceData.type as "pf" | "pj",
        document: sourceData.document as string,
        email: sourceData.email as string,
        phone: sourceData.phone as string,
        city: sourceData.city as string,
        state: sourceData.state as string,
        status: "active",
        creditLimit: 10000,
        balance: 0,
      }

      setEditingClient(clientData as Client)
      setViewMode("new")
      setShowForm(true)
    }
  }, [])

  // Client-side filtering for type and status (server sends all, we filter locally)
  const filteredClients = clients.filter((client) => {
    const matchesType = typeFilter === "all" || client.type === typeFilter
    const matchesStatus = statusFilter === "all" || client.status === statusFilter
    return matchesType && matchesStatus
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleNewClient = () => {
    setEditingClient(null)
    setViewMode("new")
    setShowForm(true)
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setViewMode("edit")
    setShowForm(true)
  }

  const handleViewClient = (client: Client) => {
    setEditingClient(client)
    setViewMode("view")
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingClient(null)
  }

  const handleExportToSupplier = (client: Client) => {
    setExportData({
      sourceType: "cliente",
      targetType: "fornecedor",
      data: client,
    })
    addTab({
      title: `Novo Fornecedor (de ${client.tradeName || client.name})`,
      href: "/cadastros/fornecedores",
      closable: true,
      allowDuplicates: true,
      type: "fornecedores",
    })
    navigate("/cadastros/fornecedores")
  }

  const handleExportToPartner = (client: Client) => {
    setExportData({
      sourceType: "cliente",
      targetType: "parceiro",
      data: client,
    })
    addTab({
      title: `Novo Parceiro (de ${client.tradeName || client.name})`,
      href: "/cadastros/parceiros",
      closable: true,
      allowDuplicates: true,
      type: "parceiros",
    })
    navigate("/cadastros/parceiros")
  }

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (clientToDelete) {
      removeCliente.mutate(clientToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setClientToDelete(null)
        },
      })
    }
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setClientToDelete(null)
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
                placeholder="Buscar por nome, código, documento..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="pl-9 h-8"
              />
            </div>

            {availableFilters.find((f) => f.id === "period")?.enabled && <PeriodFilter />}

            {availableFilters.find((f) => f.id === "type")?.enabled && (
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px] h-8">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="pf">Pessoa Física</SelectItem>
                  <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            )}

            {availableFilters.find((f) => f.id === "status")?.enabled && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] h-8">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="blocked">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            )}

            <div className="ml-auto flex items-center gap-2">
              <FilterCustomizer filters={availableFilters} onSave={handleSaveFilters} />
              <button
                type="button"
                onClick={handleNewClient}
                className="text-primary hover:text-primary/80 transition-colors"
                title="Novo Cliente"
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
          <CardContent className="pt-6">
            <ClientForm
              client={editingClient}
              onClose={handleCloseForm}
              viewMode={viewMode}
            />
          </CardContent>
        </Card>
      )}

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Carregando clientes...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-destructive">
                Erro ao carregar clientes. Verifique sua conexão e tente novamente.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 h-8">
                      <th className="px-4 py-0 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-4 py-0 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Dados
                      </th>
                      <th className="px-4 py-0 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Contato
                      </th>
                      <th className="px-4 py-0 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Cidade/UF
                      </th>
                      <th className="px-4 py-0 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Limite
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
                    {filteredClients.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                          Nenhum cliente encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredClients.map((client, index) => {
                        const status = statusConfig[client.status] ?? statusConfig.inactive
                        return (
                          <tr
                            key={client.id}
                            className={cn(
                              "border-b border-border transition-colors hover:bg-muted/30",
                              index % 2 === 0 ? "bg-card" : "bg-muted/10"
                            )}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="font-medium text-foreground">
                                    {client.tradeName || client.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{client.code}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                <p className="font-mono text-sm text-foreground">{client.document}</p>
                                <p className="font-mono text-xs text-muted-foreground">
                                  {client.type === "pj"
                                    ? (client.stateRegistration || "Isento")
                                    : (client.rg || "-")}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm text-foreground">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  {client.email}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {client.phone}
                                  {client.cellphone && (
                                    <>
                                      <span className="text-muted-foreground/50">•</span>
                                      {client.cellphone}
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-foreground">
                                {client.city}/{client.state}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm text-foreground">
                                {formatCurrency(client.creditLimit ?? 0)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span
                                className={cn(
                                  "text-sm font-medium",
                                  (client.balance ?? 0) < 0 ? "text-primary" : "text-foreground"
                                )}
                              >
                                {formatCurrency(client.balance ?? 0)}
                              </span>
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
                                    <DropdownMenuItem onClick={() => handleViewClient(client)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Visualizar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEditClient(client)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuSub>
                                      <DropdownMenuSubTrigger>
                                        <Download className="mr-2 h-4 w-4" />
                                        Exportar
                                      </DropdownMenuSubTrigger>
                                      <DropdownMenuSubContent>
                                        <DropdownMenuItem onClick={() => handleExportToSupplier(client)}>
                                          Para Fornecedor
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExportToPartner(client)}>
                                          Para Parceiro
                                        </DropdownMenuItem>
                                      </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => handleDeleteClick(client)}
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
                    ? `Mostrando ${clients.length} de ${pagination.total} clientes (página ${pagination.page} de ${pagination.totalPages})`
                    : `Mostrando ${filteredClients.length} clientes`}
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
              Tem certeza que deseja excluir o cliente{" "}
              <span className="font-semibold">
                {clientToDelete?.tradeName || clientToDelete?.name}
              </span>
              ? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={removeCliente.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeCliente.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}






