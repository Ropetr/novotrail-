"use client"

import { useState } from "react"
import { Plus, Search, MoreHorizontal, Edit, Eye, ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MovementForm } from "./movement-form"

interface Movement {
  id: string; code: string; type: "entrada" | "saida" | "ajuste" | "transferencia"
  product: string; productCode: string; quantity: number; unit: string
  warehouse: string; reason: string; date: string; user: string; nfNumber?: string
}

const typeConfig = {
  entrada: { label: "Entrada", className: "text-green-600 bg-green-50", icon: ArrowDownCircle },
  saida: { label: "Saída", className: "text-red-600 bg-red-50", icon: ArrowUpCircle },
  ajuste: { label: "Ajuste", className: "text-amber-600 bg-amber-50", icon: RefreshCw },
  transferencia: { label: "Transferência", className: "text-blue-600 bg-blue-50", icon: RefreshCw },
}

const mockMovements: Movement[] = [
  { id: "1", code: "MOV-001", type: "entrada", product: "Placa Drywall ST 12.5mm", productCode: "PRO-001", quantity: 450, unit: "un", warehouse: "Galpão Principal", reason: "Compra NF-45821", date: "2026-02-23", user: "Admin Demo", nfNumber: "NF-45821" },
  { id: "2", code: "MOV-002", type: "saida", product: "Perfil Montante 48mm", productCode: "PRO-002", quantity: 200, unit: "un", warehouse: "Galpão Principal", reason: "Venda VND-001 - Construtora Horizonte", date: "2026-02-23", user: "Admin Demo" },
  { id: "3", code: "MOV-003", type: "saida", product: "Massa Corrida 25kg", productCode: "PRO-003", quantity: 50, unit: "un", warehouse: "Galpão Principal", reason: "Venda VND-002 - Mendes Reformas", date: "2026-02-22", user: "Admin Demo" },
  { id: "4", code: "MOV-004", type: "ajuste", product: "Fita Papel 50m", productCode: "PRO-004", quantity: -12, unit: "un", warehouse: "Galpão Principal", reason: "Ajuste inventário - avaria", date: "2026-02-22", user: "Admin Demo" },
  { id: "5", code: "MOV-005", type: "entrada", product: "Parafuso Drywall 3.5x25", productCode: "PRO-005", quantity: 10000, unit: "un", warehouse: "Galpão Principal", reason: "Compra NF-12094", date: "2026-02-21", user: "Admin Demo", nfNumber: "NF-12094" },
  { id: "6", code: "MOV-006", type: "transferencia", product: "Placa Drywall ST 12.5mm", productCode: "PRO-001", quantity: 100, unit: "un", warehouse: "Galpão Secundário", reason: "Transferência para filial", date: "2026-02-21", user: "Admin Demo" },
  { id: "7", code: "MOV-007", type: "saida", product: "Placa Drywall ST 12.5mm", productCode: "PRO-001", quantity: 80, unit: "un", warehouse: "Galpão Principal", reason: "Venda VND-003 - Casa & Cia", date: "2026-02-20", user: "Admin Demo" },
  { id: "8", code: "MOV-008", type: "entrada", product: "Massa Corrida 25kg", productCode: "PRO-003", quantity: 300, unit: "un", warehouse: "Galpão Principal", reason: "Compra NF-78432", date: "2026-02-20", user: "Admin Demo", nfNumber: "NF-78432" },
]

export function MovementList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null)
  const [viewMode, setViewMode] = useState<"new" | "view">("new")

  const filtered = mockMovements.filter((m) => {
    const matchesSearch = !searchTerm || m.product.toLowerCase().includes(searchTerm.toLowerCase()) || m.code.toLowerCase().includes(searchTerm.toLowerCase()) || m.reason.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || m.type === typeFilter
    return matchesSearch && matchesType
  })

  const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR")

  if (showForm) return <MovementForm movement={editingMovement} onClose={() => { setShowForm(false); setEditingMovement(null) }} viewMode={viewMode} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Movimentações de Estoque</h1>
        <Button size="sm" className="gap-2" onClick={() => { setEditingMovement(null); setViewMode("new"); setShowForm(true) }}><Plus className="h-4 w-4" />Nova Movimentação</Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Entradas (mês)</p><p className="text-lg font-bold text-green-600">+10.750 un</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Saídas (mês)</p><p className="text-lg font-bold text-red-600">-330 un</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Ajustes</p><p className="text-lg font-bold text-amber-600">-12 un</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Transferências</p><p className="text-lg font-bold text-blue-600">100 un</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-0">
        <div className="flex items-center gap-2 border-b border-border px-4 h-12">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por produto, código ou motivo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-8 border-0 shadow-none focus-visible:ring-0" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-[160px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="entrada">Entrada</SelectItem><SelectItem value="saida">Saída</SelectItem><SelectItem value="ajuste">Ajuste</SelectItem><SelectItem value="transferencia">Transferência</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border bg-muted/30">
          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Código</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Produto</th>
          <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Tipo</th>
          <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Quantidade</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Depósito</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Data</th>
          <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Ações</th>
        </tr></thead><tbody>
          {filtered.map((m, i) => {
            const type = typeConfig[m.type]
            return (
              <tr key={m.id} className={cn("border-b border-border transition-colors hover:bg-muted/30", i % 2 === 0 ? "bg-card" : "bg-muted/10")}>
                <td className="px-4 py-3"><span className="text-sm font-mono text-foreground">{m.code}</span></td>
                <td className="px-4 py-3"><div><p className="text-sm font-medium text-foreground">{m.product}</p><p className="text-xs text-muted-foreground">{m.reason}</p></div></td>
                <td className="px-4 py-3"><div className="flex justify-center"><Badge variant="secondary" className={cn("gap-1", type.className)}><type.icon className="h-3 w-3" />{type.label}</Badge></div></td>
                <td className="px-4 py-3 text-right"><span className={cn("text-sm font-medium", m.type === "entrada" ? "text-green-600" : m.type === "saida" ? "text-red-600" : "text-foreground")}>{m.type === "entrada" ? "+" : m.type === "saida" ? "-" : ""}{Math.abs(m.quantity)} {m.unit}</span></td>
                <td className="px-4 py-3"><span className="text-sm text-foreground">{m.warehouse}</span></td>
                <td className="px-4 py-3"><span className="text-sm text-foreground">{fmtDate(m.date)}</span></td>
                <td className="px-4 py-3"><div className="flex justify-center"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => { setEditingMovement(m); setViewMode("view"); setShowForm(true) }}><Eye className="mr-2 h-4 w-4" />Visualizar</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></td>
              </tr>
            )
          })}
        </tbody></table></div>
        <div className="flex items-center justify-between border-t border-border px-4 h-8"><p className="text-sm text-muted-foreground">Mostrando {filtered.length} movimentações</p></div>
      </CardContent></Card>
    </div>
  )
}
