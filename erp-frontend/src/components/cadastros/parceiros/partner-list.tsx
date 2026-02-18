"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Building2,
  User,
  Mail,
  Phone,
  TrendingUp,
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
import { cn } from "@/lib/utils"
import { PartnerForm } from "./partner-form"
import { useExport } from "@/contexts/export-context"
import { useTabs } from "@/contexts/tabs-context"
import { useNavigate } from "react-router-dom"
import { PeriodFilter } from "@/components/common/period-filter"
import { FilterCustomizer, FilterOption } from "@/components/common/filter-customizer"
import { Settings, Plus } from "lucide-react"

interface Partner {
  id: string
  code: string
  name: string
  tradeName?: string
  type: "pf" | "pj"
  document: string
  email: string
  phone: string
  cellphone?: string
  city: string
  state: string
  status: "active" | "inactive"
  clientId: string // Sempre vinculado a um cliente
  commissionRate: number // Percentual de cashback
  totalCommission: number // Total acumulado de comissões
  lastIndicationDate?: string
}

const mockPartners: Partner[] = [
  {
    id: "1",
    code: "PAR-001",
    name: "Carlos Alberto Santos",
    type: "pf",
    document: "123.456.789-00",
    email: "carlos.santos@email.com",
    phone: "(44) 3025-7890",
    cellphone: "(44) 99912-3456",
    city: "Maringá",
    state: "PR",
    status: "active",
    clientId: "CLI-003",
    commissionRate: 5,
    totalCommission: 12500,
    lastIndicationDate: "2025-11-20",
  },
  {
    id: "2",
    code: "PAR-002",
    name: "Imobiliária Horizonte Ltda",
    tradeName: "Horizonte Imóveis",
    type: "pj",
    document: "12.345.678/0001-90",
    email: "contato@horizonteimoveis.com.br",
    phone: "(44) 3025-1234",
    cellphone: "(44) 99876-5432",
    city: "Maringá",
    state: "PR",
    status: "active",
    clientId: "CLI-001",
    commissionRate: 3,
    totalCommission: 45000,
    lastIndicationDate: "2025-11-18",
  },
  {
    id: "3",
    code: "PAR-003",
    name: "Arquitetura & Design Silva",
    tradeName: "AD Silva",
    type: "pj",
    document: "23.456.789/0001-01",
    email: "comercial@adsilva.com.br",
    phone: "(43) 3322-5678",
    cellphone: "(43) 99123-4567",
    city: "Londrina",
    state: "PR",
    status: "active",
    clientId: "CLI-002",
    commissionRate: 4,
    totalCommission: 8900,
    lastIndicationDate: "2025-11-15",
  },
  {
    id: "4",
    code: "PAR-004",
    name: "João Pedro Oliveira",
    type: "pf",
    document: "987.654.321-00",
    email: "joao.oliveira@email.com",
    phone: "(41) 3338-2222",
    cellphone: "(41) 99887-6543",
    city: "Curitiba",
    state: "PR",
    status: "inactive",
    clientId: "CLI-004",
    commissionRate: 2,
    totalCommission: 3200,
    lastIndicationDate: "2025-08-10",
  },
]

const statusConfig = {
  active: { label: "Ativo", className: "text-green-600 bg-green-50" },
  inactive: { label: "Inativo", className: "text-muted-foreground bg-muted" },
}

export function PartnerList() {
  const [partners] = useState<Partner[]>(mockPartners)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [viewMode, setViewMode] = useState<"new" | "edit" | "view">("new")
  const { consumeExportData, setExportData } = useExport()
  const { addTab } = useTabs()
  const navigate = useNavigate()
  const [availableFilters, setAvailableFilters] = useState<FilterOption[]>([
    { id: "period", label: "Período", enabled: true },
    { id: "type", label: "Tipo (PF/PJ)", enabled: true },
    { id: "status", label: "Status", enabled: true },
  ])

  // Verifica se há dados de exportação de Cliente ao montar o componente
  useEffect(() => {
    const savedFilters = localStorage.getItem("parceiros-filters")
    if (savedFilters) {
      setAvailableFilters(JSON.parse(savedFilters))
    }

    const exportData = consumeExportData()
    if (exportData && exportData.targetType === "parceiro" && exportData.sourceType === "cliente") {
      // Converte os dados do cliente para o formato de parceiro
      const clientData = exportData.data
      const partnerData: Partial<Partner> = {
        name: clientData.name,
        tradeName: clientData.tradeName,
        type: clientData.type,
        document: clientData.document,
        email: clientData.email,
        phone: clientData.phone,
        city: clientData.city,
        state: clientData.state,
        status: "active",
        clientId: clientData.id, // Vincula ao cliente
        commissionRate: 5, // Default 5% de cashback
        totalCommission: 0, // Inicia zerado
      }

      setEditingPartner(partnerData as Partner)
      setViewMode("new")
      setShowForm(true)
    }
  }, [])

  const filteredPartners = partners.filter((partner) => {
    const matchesSearch =
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.document.includes(searchTerm) ||
      partner.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || partner.type === typeFilter
    const matchesStatus = statusFilter === "all" || partner.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleEditPartner = (partner: Partner) => {
    setEditingPartner(partner)
    setViewMode("edit")
    setShowForm(true)
  }

  const handleViewPartner = (partner: Partner) => {
    setEditingPartner(partner)
    setViewMode("view")
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingPartner(null)
  }

  const getDialogTitle = () => {
    if (viewMode === "new") return "Novo Parceiro"
    if (viewMode === "edit") return "Editar Parceiro"
    return "Visualizar Parceiro"
  }

  const handleSaveFilters = (filters: FilterOption[]) => {
    setAvailableFilters(filters)
    localStorage.setItem("parceiros-filters", JSON.stringify(filters))
  }

  const handleNewPartner = () => {
    setEditingPartner(null)
    setViewMode("new")
    setShowForm(true)
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
                placeholder="Buscar por nome, código, documento ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-8"
              />
            </div>
            {availableFilters.find((f) => f.id === "period")?.enabled && <PeriodFilter />}
            {availableFilters.find((f) => f.id === "type")?.enabled && (
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px] h-8 text-sm bg-background">
                  <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
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
                <SelectTrigger className="w-[160px] h-8 text-sm bg-background">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            )}
            <div className="ml-auto flex items-center gap-2">
              <FilterCustomizer filters={availableFilters} onSave={handleSaveFilters} />
              <button
                type="button"
                onClick={handleNewPartner}
                className="text-primary hover:text-primary/80 transition-colors"
                title="Novo Parceiro"
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
            <PartnerForm
              partner={editingPartner}
              onClose={handleCloseForm}
              viewMode={viewMode}
            />
          </CardContent>
        </Card>
      )}

      {/* Partners Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Parceiro
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    % Cashback
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Acumulado
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
                {filteredPartners.map((partner, index) => {
                  const status = statusConfig[partner.status]
                  return (
                    <tr
                      key={partner.id}
                      className={cn(
                        "border-b border-border transition-colors hover:bg-muted/30",
                        index % 2 === 0 ? "bg-card" : "bg-muted/10"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            {partner.type === "pj" ? (
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <User className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {partner.tradeName || partner.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{partner.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <Badge variant="outline" className="mb-1">
                            {partner.type === "pj" ? "CNPJ" : "CPF"}
                          </Badge>
                          <p className="font-mono text-sm text-foreground">{partner.document}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-foreground">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {partner.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {partner.phone}
                            {partner.cellphone && (
                              <>
                                <span className="text-muted-foreground/50">•</span>
                                {partner.cellphone}
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-sm font-medium text-foreground">
                            {partner.commissionRate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(partner.totalCommission)}
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
                              <DropdownMenuItem onClick={() => handleViewPartner(partner)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditPartner(partner)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar Comissão
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
              Mostrando {filteredPartners.length} de {partners.length} parceiros
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
