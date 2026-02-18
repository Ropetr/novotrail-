"use client"

import { useState, useEffect } from "react"
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
  Users,
  UserCheck,
  UserX,
  DollarSign,
  Building2,
  User,
  Mail,
  Phone,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { toast } from "sonner"
import { PeriodFilter } from "@/components/common/period-filter"
import { FilterCustomizer, FilterOption } from "@/components/common/filter-customizer"

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

const mockClients: Client[] = [
  {
    id: "1",
    code: "CLI-001",
    name: "Construtora Horizonte Ltda",
    tradeName: "Construtora Horizonte",
    type: "pj",
    document: "12.345.678/0001-90",
    stateRegistration: "123.456.789.012",
    email: "contato@horizonte.com.br",
    phone: "(44) 3025-1234",
    cellphone: "(44) 99123-4567",
    city: "Maringá",
    state: "PR",
    status: "active",
    creditLimit: 150000,
    balance: 89500,
    lastPurchase: "2025-11-20",
  },
  {
    id: "2",
    code: "CLI-002",
    name: "MegaObras Construções e Reformas Ltda",
    tradeName: "MegaObras",
    type: "pj",
    document: "23.456.789/0001-01",
    stateRegistration: "234.567.890.123",
    email: "compras@megaobras.com.br",
    phone: "(43) 3322-5678",
    cellphone: "(43) 99876-5432",
    city: "Londrina",
    state: "PR",
    status: "active",
    creditLimit: 100000,
    balance: 67200,
    lastPurchase: "2025-11-18",
  },
  {
    id: "3",
    code: "CLI-003",
    name: "José Roberto da Silva",
    type: "pf",
    document: "123.456.789-00",
    rg: "12.345.678-9",
    email: "jose.silva@email.com",
    phone: "(44) 3025-8888",
    cellphone: "(44) 99912-3456",
    city: "Maringá",
    state: "PR",
    status: "active",
    creditLimit: 15000,
    balance: 3200,
    lastPurchase: "2025-11-15",
  },
  {
    id: "4",
    code: "CLI-004",
    name: "Decor Plus Acabamentos Ltda",
    tradeName: "Decor Plus",
    type: "pj",
    document: "34.567.890/0001-12",
    email: "financeiro@decorplus.com.br",
    phone: "(41) 3232-9999",
    cellphone: "(41) 99321-7654",
    city: "Curitiba",
    state: "PR",
    status: "active",
    creditLimit: 80000,
    balance: 54800,
    lastPurchase: "2025-11-22",
  },
  {
    id: "5",
    code: "CLI-005",
    name: "Steel House Estruturas Metálicas",
    tradeName: "Steel House",
    type: "pj",
    document: "45.678.901/0001-23",
    email: "contato@steelhouse.com.br",
    phone: "(45) 3025-4567",
    cellphone: "(45) 99654-3210",
    city: "Cascavel",
    state: "PR",
    status: "inactive",
    creditLimit: 50000,
    balance: 0,
    lastPurchase: "2025-08-10",
  },
  {
    id: "6",
    code: "CLI-006",
    name: "Maria Fernanda Oliveira",
    type: "pf",
    document: "987.654.321-00",
    rg: "98.765.432-1",
    email: "maria.oliveira@email.com",
    phone: "(44) 3026-5555",
    cellphone: "(44) 99887-6543",
    city: "Maringá",
    state: "PR",
    status: "blocked",
    creditLimit: 5000,
    balance: -2500,
    lastPurchase: "2025-06-01",
  },
]

const statusConfig = {
  active: { label: "Ativo", className: "text-green-600 bg-green-50" },
  inactive: { label: "Inativo", className: "text-muted-foreground bg-muted" },
  blocked: { label: "Bloqueado", className: "text-red-600 bg-red-50" },
}

export function ClientList() {
  const [clients] = useState<Client[]>(mockClients)
  const [searchTerm, setSearchTerm] = useState("")
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

  // Carrega filtros salvos e verifica dados de exportação
  useEffect(() => {
    const savedFilters = localStorage.getItem("clientes-filters")
    if (savedFilters) {
      setAvailableFilters(JSON.parse(savedFilters))
    }

    const exportData = consumeExportData()
    if (exportData && exportData.targetType === "cliente") {
      // Converte os dados da fonte para o formato de cliente
      const sourceData = exportData.data
      const clientData: Partial<Client> = {
        name: sourceData.name,
        tradeName: sourceData.tradeName,
        type: sourceData.type,
        document: sourceData.document,
        email: sourceData.email,
        phone: sourceData.phone,
        city: sourceData.city,
        state: sourceData.state,
        status: "active",
        creditLimit: 10000, // Default
        balance: 0, // Default
      }

      setEditingClient(clientData as Client)
      setViewMode("new")
      setShowForm(true)
    }
  }, [])

  const filteredClients = clients.filter((client) => {
    // Normaliza o termo de busca removendo pontuação e acentuação
    const normalizeText = (text: string) =>
      text
        .toLowerCase()
        .normalize("NFD") // Decompõe os caracteres acentuados
        .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
        .replace(/[.\-/\s()]/g, "") // Remove pontuação

    const searchNormalized = normalizeText(searchTerm)

    const matchesSearch = searchTerm === "" ||
      normalizeText(client.name).includes(searchNormalized) ||
      normalizeText(client.code).includes(searchNormalized) ||
      normalizeText(client.document).includes(searchNormalized) ||
      normalizeText(client.email).includes(searchNormalized) ||
      normalizeText(client.phone).includes(searchNormalized) ||
      normalizeText(client.city).includes(searchNormalized)

    const matchesType = typeFilter === "all" || client.type === typeFilter
    const matchesStatus = statusFilter === "all" || client.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDocument = (doc: string, type: "pf" | "pj") => {
    return doc
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

  const getDialogTitle = () => {
    if (viewMode === "new") return "Novo Cliente"
    if (viewMode === "edit") return "Editar Cliente"
    return "Visualizar Cliente"
  }

  const handleExportToSupplier = (client: Client) => {
    // Define os dados de exportação no context
    setExportData({
      sourceType: "cliente",
      targetType: "fornecedor",
      data: client,
    })

    // Cria nova aba de Fornecedores com dados do cliente
    const tabId = addTab({
      title: `Novo Fornecedor (de ${client.tradeName || client.name})`,
      href: "/cadastros/fornecedores",
      closable: true,
      allowDuplicates: true,
      type: "fornecedores",
    })

    // Navega para a aba de fornecedores
    navigate("/cadastros/fornecedores")
  }

  const handleExportToPartner = (client: Client) => {
    // Define os dados de exportação no context
    setExportData({
      sourceType: "cliente",
      targetType: "parceiro",
      data: client,
    })

    // Cria nova aba de Parceiros com dados do cliente
    const tabId = addTab({
      title: `Novo Parceiro (de ${client.tradeName || client.name})`,
      href: "/cadastros/parceiros",
      closable: true,
      allowDuplicates: true,
      type: "parceiros",
    })

    // Navega para a aba de parceiros
    navigate("/cadastros/parceiros")
  }

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (clientToDelete) {
      // Aqui você faria a chamada para a API para excluir o cliente
      toast.success(`Cliente "${clientToDelete.tradeName || clientToDelete.name}" excluído com sucesso!`)
      setDeleteDialogOpen(false)
      setClientToDelete(null)
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-8"
              />
            </div>

            {/* Filtro de Período */}
            {availableFilters.find((f) => f.id === "period")?.enabled && <PeriodFilter />}

            {/* Filtro de Tipo */}
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

            {/* Filtro de Status */}
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

            {/* Ações: Customizar e Novo */}
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Dados
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Cidade/UF
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Limite
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
                {filteredClients.map((client, index) => {
                  const status = statusConfig[client.status]
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
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            {client.type === "pj" ? (
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <User className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
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
                              : (client.rg || "-")
                            }
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
                          {formatCurrency(client.creditLimit)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            client.balance < 0 ? "text-red-600" : "text-foreground"
                          )}
                        >
                          {formatCurrency(client.balance)}
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
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredClients.length} de {clients.length} clientes
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
