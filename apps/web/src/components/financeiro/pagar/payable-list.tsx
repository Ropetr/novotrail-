"use client"

import { useState } from "react"
import {
  Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Loader,
  ChevronLeft, ChevronRight, DollarSign, AlertTriangle, CheckCircle2, Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { PayableForm } from "./payable-form"

interface Payable {
  id: string
  code: string
  supplier: string
  description: string
  category: string
  dueDate: string
  value: number
  paidValue: number
  status: "pending" | "paid" | "overdue" | "partial" | "cancelled"
  paymentMethod?: string
  paidAt?: string
  nfNumber?: string
  notes?: string
}

const statusConfig = {
  pending: { label: "Pendente", className: "text-amber-600 bg-amber-50", icon: Clock },
  paid: { label: "Pago", className: "text-green-600 bg-green-50", icon: CheckCircle2 },
  overdue: { label: "Vencido", className: "text-red-600 bg-red-50", icon: AlertTriangle },
  partial: { label: "Parcial", className: "text-blue-600 bg-blue-50", icon: DollarSign },
  cancelled: { label: "Cancelado", className: "text-muted-foreground bg-muted", icon: Trash2 },
}

// Mock data realista para distribuidora de materiais de construção
const mockPayables: Payable[] = [
  { id: "1", code: "CP-001", supplier: "Knauf do Brasil", description: "Placas Drywall ST 12.5mm - Lote 450", category: "Mercadorias", dueDate: "2026-03-05", value: 22500.00, paidValue: 0, status: "pending", nfNumber: "NF-45821" },
  { id: "2", code: "CP-002", supplier: "Gypsum Mineração", description: "Perfis Montante 48mm - 2.000 un", category: "Mercadorias", dueDate: "2026-02-20", value: 18750.00, paidValue: 18750.00, status: "paid", paymentMethod: "Boleto", paidAt: "2026-02-19", nfNumber: "NF-12094" },
  { id: "3", code: "CP-003", supplier: "Eucatex S/A", description: "Massa Corrida 25kg - 300 baldes", category: "Mercadorias", dueDate: "2026-02-18", value: 8550.00, paidValue: 0, status: "overdue", nfNumber: "NF-78432" },
  { id: "4", code: "CP-004", supplier: "Copel - Energia", description: "Fatura energia elétrica Fev/2026", category: "Energia", dueDate: "2026-03-10", value: 3420.00, paidValue: 0, status: "pending" },
  { id: "5", code: "CP-005", supplier: "Sanepar", description: "Fatura água e esgoto Fev/2026", category: "Água", dueDate: "2026-03-08", value: 890.00, paidValue: 0, status: "pending" },
  { id: "6", code: "CP-006", supplier: "Vivo Telefônica", description: "Internet + telefonia fixa", category: "Telecom", dueDate: "2026-02-15", value: 450.00, paidValue: 450.00, status: "paid", paymentMethod: "Débito Automático", paidAt: "2026-02-15" },
  { id: "7", code: "CP-007", supplier: "Contabilidade Alpha", description: "Honorários contábeis Mar/2026", category: "Serviços", dueDate: "2026-03-01", value: 2800.00, paidValue: 0, status: "pending" },
  { id: "8", code: "CP-008", supplier: "Transportadora Rápido", description: "Frete entrega clientes - Fev/2026", category: "Frete", dueDate: "2026-02-17", value: 6200.00, paidValue: 3100.00, status: "partial", paymentMethod: "PIX" },
  { id: "9", code: "CP-009", supplier: "Aluguel Galpão", description: "Aluguel galpão industrial Mar/2026", category: "Aluguel", dueDate: "2026-03-05", value: 12000.00, paidValue: 0, status: "pending" },
  { id: "10", code: "CP-010", supplier: "Placo Saint-Gobain", description: "Chapas Gesso Acartonado - Lote 200", category: "Mercadorias", dueDate: "2026-02-10", value: 15300.00, paidValue: 0, status: "overdue", nfNumber: "NF-33210" },
]

export function PayableList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingPayable, setEditingPayable] = useState<Payable | null>(null)
  const [viewMode, setViewMode] = useState<"new" | "edit" | "view">("new")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [payableToDelete, setPayableToDelete] = useState<Payable | null>(null)

  const filteredPayables = mockPayables.filter((p) => {
    const matchesSearch = !searchTerm ||
      p.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || p.status === statusFilter
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00")
    return date.toLocaleDateString("pt-BR")
  }

  const totals = {
    total: mockPayables.reduce((acc, p) => acc + p.value, 0),
    paid: mockPayables.filter(p => p.status === "paid").reduce((acc, p) => acc + p.value, 0),
    pending: mockPayables.filter(p => p.status === "pending").reduce((acc, p) => acc + p.value, 0),
    overdue: mockPayables.filter(p => p.status === "overdue").reduce((acc, p) => acc + p.value, 0),
  }

  const handleNewPayable = () => { setEditingPayable(null); setViewMode("new"); setShowForm(true) }
  const handleEditPayable = (p: Payable) => { setEditingPayable(p); setViewMode("edit"); setShowForm(true) }
  const handleViewPayable = (p: Payable) => { setEditingPayable(p); setViewMode("view"); setShowForm(true) }
  const handleCloseForm = () => { setShowForm(false); setEditingPayable(null) }

  if (showForm) {
    return <PayableForm payable={editingPayable} onClose={handleCloseForm} viewMode={viewMode} />
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Contas a Pagar</h1>
        <Button size="sm" className="gap-2" onClick={handleNewPayable}>
          <Plus className="h-4 w-4" /> Nova Conta
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Total Período</p>
          <p className="text-lg font-bold text-foreground">{formatCurrency(totals.total)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Pagos</p>
          <p className="text-lg font-bold text-green-600">{formatCurrency(totals.paid)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Pendentes</p>
          <p className="text-lg font-bold text-amber-600">{formatCurrency(totals.pending)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Vencidos</p>
          <p className="text-lg font-bold text-red-600">{formatCurrency(totals.overdue)}</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center gap-2 border-b border-border px-4 h-12">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por fornecedor, descrição ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 border-0 shadow-none focus-visible:ring-0"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="overdue">Vencido</SelectItem>
                <SelectItem value="partial">Parcial</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-8 w-[140px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Mercadorias">Mercadorias</SelectItem>
                <SelectItem value="Energia">Energia</SelectItem>
                <SelectItem value="Água">Água</SelectItem>
                <SelectItem value="Telecom">Telecom</SelectItem>
                <SelectItem value="Serviços">Serviços</SelectItem>
                <SelectItem value="Frete">Frete</SelectItem>
                <SelectItem value="Aluguel">Aluguel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Fornecedor</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Categoria</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Vencimento</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Valor</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Pago</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayables.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">Nenhuma conta encontrada.</td></tr>
                ) : (
                  filteredPayables.map((payable, index) => {
                    const status = statusConfig[payable.status]
                    return (
                      <tr key={payable.id} className={cn("border-b border-border transition-colors hover:bg-muted/30", index % 2 === 0 ? "bg-card" : "bg-muted/10")}>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-foreground">{payable.supplier}</p>
                            <p className="text-xs text-muted-foreground">{payable.code} {payable.nfNumber ? `• ${payable.nfNumber}` : ""}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[250px]">{payable.description}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{payable.category}</Badge></td>
                        <td className="px-4 py-3">
                          <span className={cn("text-sm", payable.status === "overdue" ? "text-red-600 font-medium" : "text-foreground")}>{formatDate(payable.dueDate)}</span>
                        </td>
                        <td className="px-4 py-3 text-right"><span className="text-sm font-medium text-foreground">{formatCurrency(payable.value)}</span></td>
                        <td className="px-4 py-3 text-right"><span className="text-sm text-muted-foreground">{payable.paidValue > 0 ? formatCurrency(payable.paidValue) : "—"}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <Badge variant="secondary" className={cn("gap-1", status.className)}>
                              <status.icon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewPayable(payable)}><Eye className="mr-2 h-4 w-4" />Visualizar</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditPayable(payable)}><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                                {payable.status !== "paid" && (
                                  <DropdownMenuItem><CheckCircle2 className="mr-2 h-4 w-4" />Baixar (Pagar)</DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => { setPayableToDelete(payable); setDeleteDialogOpen(true) }}>
                                  <Trash2 className="mr-2 h-4 w-4" />Excluir
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
            <p className="text-sm text-muted-foreground">Mostrando {filteredPayables.length} contas</p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" disabled className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
              <span className="min-w-[24px] text-center text-sm font-medium text-primary">1</span>
              <Button variant="ghost" size="icon" disabled className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a conta <span className="font-semibold">{payableToDelete?.code}</span> de{" "}
              <span className="font-semibold">{payableToDelete?.supplier}</span>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => setDeleteDialogOpen(false)}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
