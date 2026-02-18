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
  Loader,
  Plus,
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
import { PartnerForm } from "./partner-form"
import { useExport } from "@/contexts/export-context"
import { PeriodFilter } from "@/components/common/period-filter"
import { FilterCustomizer, FilterOption } from "@/components/common/filter-customizer"
import { useParceiros, useRemoveParceiro } from "@/hooks/use-parceiros"

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
  clientId: string
  commissionRate: number
  totalCommission: number
  lastIndicationDate?: string
}

const statusConfig = {
  active: { label: "Ativo", className: "text-green-600 bg-green-50" },
  inactive: { label: "Inativo", className: "text-muted-foreground bg-muted" },
}

export function PartnerList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [viewMode, setViewMode] = useState<"new" | "edit" | "view">("new")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null)
  const { consumeExportData } = useExport()
  const [availableFilters, setAvailableFilters] = useState<FilterOption[]>([
    { id: "period", label: "Período", enabled: true },
    { id: "type", label: "Tipo (PF/PJ)", enabled: true },
    { id: "status", label: "Status", enabled: true },
  ])

  const { data, isLoading, error } = useParceiros({
    page,
    limit: 20,
    search: searchTerm || undefined,
  })

  const removeParceiro = useRemoveParceiro()

  const partners = (data?.data ?? []) as unknown as Partner[]
  const pagination = data?.pagination

  useEffect(() => {
    const savedFilters = localStorage.getItem("parceiros-filters")
    if (savedFilters) {
      setAvailableFilters(JSON.parse(savedFilters))
    }

    const exportData = consumeExportData()
    if (exportData && exportData.targetType === "parceiro" && exportData.sourceType === "cliente") {
      const clientData = exportData.data
      const partnerData: Partial<Partner> = {
        name: clientData.name as string,
        tradeName: clientData.tradeName as string | undefined,
        type: clientData.type as "pf" | "pj",
        document: clientData.document as string,
        email: clientData.email as string,
        phone: clientData.phone as string,
        city: clientData.city as string,
        state: clientData.state as string,
        status: "active",
        clientId: clientData.id as string,
        commissionRate: 5,
        totalCommission: 0,
      }

      setEditingPartner(partnerData as Partner)
      setViewMode("new")
      setShowForm(true)
    }
  }, [])

  const filteredPartners = partners.filter((partner) => {
    const matchesType = typeFilter === "all" || partner.type === typeFilter
    const matchesStatus = statusFilter === "all" || partner.status === statusFilter
    return matchesType && matchesStatus
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleNewPartner = () => {
    setEditingPartner(null)
    setViewMode("new")
    setShowForm(true)
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

  const handleSaveFilters = (filters: FilterOption[]) => {
    setAvailableFilters(filters)
    localStorage.setItem("parceiros-filters", JSON.stringify(filters))
  }

  const handleDeleteClick = (partner: Partner) => {
    setPartnerToDelete(partner)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (partnerToDelete) {
      removeParceiro.mutate(partnerToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setPartnerToDelete(null)
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
                placeholder="Buscar por nome, código, documento ou e-mail..."
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

      {/* Formulário */}
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
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Carregando parceiros...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-destructive">
                Erro ao carregar parceiros. Verifique sua conexão.
              </p>
            </div>
          ) : (
            <>
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
                    {filteredPartners.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                          Nenhum parceiro encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredPartners.map((partner, index) => {
                        const status = statusConfig[partner.status] ?? statusConfig.inactive
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
                                {formatCurrency(partner.totalCommission ?? 0)}
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
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => handleDeleteClick(partner)}
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
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  {pagination
                    ? `Mostrando ${partners.length} de ${pagination.total} parceiros`
                    : `Mostrando ${filteredPartners.length} parceiros`}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o parceiro{" "}
              <span className="font-semibold">
                {partnerToDelete?.tradeName || partnerToDelete?.name}
              </span>
              ? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setDeleteDialogOpen(false); setPartnerToDelete(null) }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={removeParceiro.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeParceiro.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
