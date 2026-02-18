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
import { ClientForm } from "./client-form"

interface Client {
  id: string
  code: string
  name: string
  tradeName?: string
  type: "pf" | "pj"
  document: string
  email: string
  phone: string
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
    email: "contato@horizonte.com.br",
    phone: "(44) 3025-1234",
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
    email: "compras@megaobras.com.br",
    phone: "(43) 3322-5678",
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
    email: "jose.silva@email.com",
    phone: "(44) 99912-3456",
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
    email: "maria.oliveira@email.com",
    phone: "(44) 99887-6543",
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

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.document.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie o cadastro de clientes do sistema
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
            onClick={handleNewClient}
            className="text-primary hover:text-primary/80 transition-colors"
            title="Novo Cliente"
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
              Total de Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clientes Ativos
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter((c) => c.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clientes Bloqueados
            </CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter((c) => c.status === "blocked").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total a Receber
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(clients.reduce((acc, c) => acc + Math.max(0, c.balance), 0))}
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
                placeholder="Buscar por nome, código, documento ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="pf">Pessoa Física</SelectItem>
                <SelectItem value="pj">Pessoa Jurídica</SelectItem>
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
                <SelectItem value="blocked">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

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
                    Documento
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
                        <div>
                          <Badge variant="outline" className="mb-1">
                            {client.type === "pj" ? "CNPJ" : "CPF"}
                          </Badge>
                          <p className="font-mono text-sm text-foreground">{client.document}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-foreground">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {client.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {client.phone}
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

      {/* Modal de Cadastro/Edição/Visualização */}
      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <ClientForm
              client={editingClient}
              onClose={handleCloseForm}
              viewMode={viewMode}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
