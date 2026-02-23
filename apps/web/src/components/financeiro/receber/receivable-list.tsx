"use client"

import { useState } from "react"
import {
  Plus, Search, MoreHorizontal, Edit, Trash2, Eye,
  ChevronLeft, ChevronRight, DollarSign, AlertTriangle, CheckCircle2, Clock, Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { ReceivableForm } from "./receivable-form"

interface Receivable {
  id: string; code: string; client: string; description: string; origin: string; dueDate: string
  value: number; receivedValue: number; status: "pending" | "received" | "overdue" | "partial" | "cancelled"
  paymentMethod?: string; receivedAt?: string; saleCode?: string
}

const statusConfig = {
  pending: { label: "Pendente", className: "text-amber-600 bg-amber-50", icon: Clock },
  received: { label: "Recebido", className: "text-green-600 bg-green-50", icon: CheckCircle2 },
  overdue: { label: "Vencido", className: "text-red-600 bg-red-50", icon: AlertTriangle },
  partial: { label: "Parcial", className: "text-blue-600 bg-blue-50", icon: DollarSign },
  cancelled: { label: "Cancelado", className: "text-muted-foreground bg-muted", icon: Trash2 },
}

const mockReceivables: Receivable[] = [
  { id: "1", code: "CR-001", client: "Construtora Horizonte", description: "Venda Drywall + Perfis - Obra Torre Sul", origin: "Venda", dueDate: "2026-03-10", value: 48500.00, receivedValue: 0, status: "pending", saleCode: "VND-001" },
  { id: "2", code: "CR-002", client: "Mendes Reformas", description: "Massa Corrida + Fita - 1/3", origin: "Venda", dueDate: "2026-02-20", value: 4200.00, receivedValue: 4200.00, status: "received", paymentMethod: "PIX", receivedAt: "2026-02-20", saleCode: "VND-002" },
  { id: "3", code: "CR-003", client: "Casa & Cia Materiais", description: "Revenda placas ST - Parcela 2/3", origin: "Venda", dueDate: "2026-02-15", value: 12800.00, receivedValue: 0, status: "overdue", saleCode: "VND-003" },
  { id: "4", code: "CR-004", client: "PF Construções", description: "Parafusos e acessórios Drywall", origin: "Venda", dueDate: "2026-03-05", value: 3650.00, receivedValue: 0, status: "pending", saleCode: "VND-004" },
  { id: "5", code: "CR-005", client: "Construtora Horizonte", description: "Venda anterior - saldo remanescente", origin: "Venda", dueDate: "2026-02-28", value: 15200.00, receivedValue: 7600.00, status: "partial", paymentMethod: "Boleto", saleCode: "VND-001" },
  { id: "6", code: "CR-006", client: "Arquiteto Lima & Assoc.", description: "Projeto especial forros decorativos", origin: "Serviço", dueDate: "2026-03-15", value: 8900.00, receivedValue: 0, status: "pending" },
  { id: "7", code: "CR-007", client: "Condomínio Park Tower", description: "Fornecimento drywall áreas comuns", origin: "Venda", dueDate: "2026-02-10", value: 22400.00, receivedValue: 0, status: "overdue", saleCode: "VND-007" },
  { id: "8", code: "CR-008", client: "Mendes Reformas", description: "Massa Corrida + Fita - 2/3", origin: "Venda", dueDate: "2026-03-20", value: 4200.00, receivedValue: 0, status: "pending", saleCode: "VND-002" },
]

export function ReceivableList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingReceivable, setEditingReceivable] = useState<Receivable | null>(null)
  const [viewMode, setViewMode] = useState<"new" | "edit" | "view">("new")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [receivableToDelete, setReceivableToDelete] = useState<Receivable | null>(null)

  const filteredReceivables = mockReceivables.filter((r) => {
    const matchesSearch = !searchTerm || r.client.toLowerCase().includes(searchTerm.toLowerCase()) || r.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
  const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR")

  const totals = {
    total: mockReceivables.reduce((a, r) => a + r.value, 0),
    received: mockReceivables.filter(r => r.status === "received").reduce((a, r) => a + r.value, 0),
    pending: mockReceivables.filter(r => r.status === "pending").reduce((a, r) => a + r.value, 0),
    overdue: mockReceivables.filter(r => r.status === "overdue").reduce((a, r) => a + r.value, 0),
  }

  if (showForm) return <ReceivableForm receivable={editingReceivable} onClose={() => { setShowForm(false); setEditingReceivable(null) }} viewMode={viewMode} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Contas a Receber</h1>
        <Button size="sm" className="gap-2" onClick={() => { setEditingReceivable(null); setViewMode("new"); setShowForm(true) }}><Plus className="h-4 w-4" /> Novo Recebível</Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Total Período</p><p className="text-lg font-bold text-foreground">{fmt(totals.total)}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Recebidos</p><p className="text-lg font-bold text-green-600">{fmt(totals.received)}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Pendentes</p><p className="text-lg font-bold text-amber-600">{fmt(totals.pending)}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Vencidos</p><p className="text-lg font-bold text-red-600">{fmt(totals.overdue)}</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-0">
        <div className="flex items-center gap-2 border-b border-border px-4 h-12">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por cliente ou código..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-8 border-0 shadow-none focus-visible:ring-0" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="received">Recebido</SelectItem>
              <SelectItem value="overdue">Vencido</SelectItem>
              <SelectItem value="partial">Parcial</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border bg-muted/30">
          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Cliente</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Origem</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Vencimento</th>
          <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Valor</th>
          <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Recebido</th>
          <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Status</th>
          <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Ações</th>
        </tr></thead><tbody>
          {filteredReceivables.length === 0 ? (
            <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">Nenhum recebível encontrado.</td></tr>
          ) : filteredReceivables.map((r, i) => {
            const status = statusConfig[r.status]
            return (
              <tr key={r.id} className={cn("border-b border-border transition-colors hover:bg-muted/30", i % 2 === 0 ? "bg-card" : "bg-muted/10")}>
                <td className="px-4 py-3"><div><p className="font-medium text-foreground">{r.client}</p><p className="text-xs text-muted-foreground">{r.code} {r.saleCode ? `• ${r.saleCode}` : ""}</p><p className="text-xs text-muted-foreground truncate max-w-[250px]">{r.description}</p></div></td>
                <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{r.origin}</Badge></td>
                <td className="px-4 py-3"><span className={cn("text-sm", r.status === "overdue" ? "text-red-600 font-medium" : "text-foreground")}>{fmtDate(r.dueDate)}</span></td>
                <td className="px-4 py-3 text-right"><span className="text-sm font-medium text-foreground">{fmt(r.value)}</span></td>
                <td className="px-4 py-3 text-right"><span className="text-sm text-muted-foreground">{r.receivedValue > 0 ? fmt(r.receivedValue) : "—"}</span></td>
                <td className="px-4 py-3"><div className="flex justify-center"><Badge variant="secondary" className={cn("gap-1", status.className)}><status.icon className="h-3 w-3" />{status.label}</Badge></div></td>
                <td className="px-4 py-3"><div className="flex justify-center"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditingReceivable(r); setViewMode("view"); setShowForm(true) }}><Eye className="mr-2 h-4 w-4" />Visualizar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setEditingReceivable(r); setViewMode("edit"); setShowForm(true) }}><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                    {r.status !== "received" && <DropdownMenuItem><CheckCircle2 className="mr-2 h-4 w-4" />Baixar (Receber)</DropdownMenuItem>}
                    {r.status === "overdue" && <DropdownMenuItem><Send className="mr-2 h-4 w-4" />Enviar Cobrança</DropdownMenuItem>}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => { setReceivableToDelete(r); setDeleteDialogOpen(true) }}><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu></div></td>
              </tr>
            )
          })}
        </tbody></table></div>
        <div className="flex items-center justify-between border-t border-border px-4 h-8">
          <p className="text-sm text-muted-foreground">Mostrando {filteredReceivables.length} recebíveis</p>
        </div>
      </CardContent></Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja excluir o recebível <span className="font-semibold">{receivableToDelete?.code}</span>?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => setDeleteDialogOpen(false)}>Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  )
}
