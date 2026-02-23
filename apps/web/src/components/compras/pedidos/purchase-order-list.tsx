"use client"
import { useState } from "react"
import { Plus, Search, MoreHorizontal, Edit, Eye, Trash2, CheckCircle2, Clock, Truck, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PurchaseOrder { id: string; code: string; supplier: string; items: number; total: number; status: "draft" | "approved" | "ordered" | "partial" | "received" | "cancelled"; createdAt: string; expectedDelivery: string }
const statusCfg = { draft: { label: "Rascunho", cls: "text-muted-foreground bg-muted" }, approved: { label: "Aprovado", cls: "text-blue-600 bg-blue-50" }, ordered: { label: "Pedido Enviado", cls: "text-purple-600 bg-purple-50" }, partial: { label: "Parcial", cls: "text-amber-600 bg-amber-50" }, received: { label: "Recebido", cls: "text-green-600 bg-green-50" }, cancelled: { label: "Cancelado", cls: "text-red-600 bg-red-50" } }
const mock: PurchaseOrder[] = [
  { id: "1", code: "PC-001", supplier: "Knauf do Brasil", items: 5, total: 42500, status: "ordered", createdAt: "2026-02-20", expectedDelivery: "2026-03-05" },
  { id: "2", code: "PC-002", supplier: "Eucatex S/A", items: 3, total: 12500, status: "received", createdAt: "2026-02-15", expectedDelivery: "2026-02-22" },
  { id: "3", code: "PC-003", supplier: "Ciser Parafusos", items: 4, total: 8900, status: "draft", createdAt: "2026-02-23", expectedDelivery: "2026-03-10" },
  { id: "4", code: "PC-004", supplier: "ArcelorMittal", items: 6, total: 18700, status: "partial", createdAt: "2026-02-18", expectedDelivery: "2026-02-28" },
  { id: "5", code: "PC-005", supplier: "Placo Saint-Gobain", items: 2, total: 35200, status: "approved", createdAt: "2026-02-22", expectedDelivery: "2026-03-08" },
]

export function PurchaseOrderList() {
  const [search, setSearch] = useState(""); const [statusF, setStatusF] = useState("all")
  const filtered = mock.filter(p => { const s = !search || p.supplier.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()); const st = statusF === "all" || p.status === statusF; return s && st })
  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
  const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR")
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-lg font-semibold text-foreground">Pedidos de Compra</h1><Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Novo Pedido</Button></div>
      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Total Pedidos</p><p className="text-lg font-bold text-foreground">{fmt(mock.reduce((a,p) => a + p.total, 0))}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Em Trânsito</p><p className="text-lg font-bold text-purple-600">{mock.filter(p => p.status === "ordered").length}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Recebidos</p><p className="text-lg font-bold text-green-600">{mock.filter(p => p.status === "received").length}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Pendentes</p><p className="text-lg font-bold text-amber-600">{mock.filter(p => ["draft","approved"].includes(p.status)).length}</p></CardContent></Card>
      </div>
      <Card><CardContent className="p-0">
        <div className="flex items-center gap-2 border-b border-border px-4 h-12"><Search className="h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar pedido..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 border-0 shadow-none focus-visible:ring-0" /><Select value={statusF} onValueChange={setStatusF}><SelectTrigger className="h-8 w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="draft">Rascunho</SelectItem><SelectItem value="approved">Aprovado</SelectItem><SelectItem value="ordered">Pedido Enviado</SelectItem><SelectItem value="partial">Parcial</SelectItem><SelectItem value="received">Recebido</SelectItem></SelectContent></Select></div>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border bg-muted/30"><th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Pedido</th><th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Fornecedor</th><th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Itens</th><th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Total</th><th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Previsão</th><th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Status</th><th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Ações</th></tr></thead><tbody>
          {filtered.map((p, i) => { const st = statusCfg[p.status]; return (
            <tr key={p.id} className={cn("border-b border-border transition-colors hover:bg-muted/30", i % 2 === 0 ? "bg-card" : "bg-muted/10")}>
              <td className="px-4 py-3"><div><p className="font-medium font-mono text-foreground">{p.code}</p><p className="text-xs text-muted-foreground">{fmtDate(p.createdAt)}</p></div></td>
              <td className="px-4 py-3"><span className="text-sm text-foreground">{p.supplier}</span></td>
              <td className="px-4 py-3 text-center"><span className="text-sm text-foreground">{p.items}</span></td>
              <td className="px-4 py-3 text-right"><span className="text-sm font-medium text-foreground">{fmt(p.total)}</span></td>
              <td className="px-4 py-3"><span className="text-sm text-foreground">{fmtDate(p.expectedDelivery)}</span></td>
              <td className="px-4 py-3"><div className="flex justify-center"><Badge variant="secondary" className={cn("text-xs", st.cls)}>{st.label}</Badge></div></td>
              <td className="px-4 py-3"><div className="flex justify-center"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem><Eye className="mr-2 h-4 w-4" />Visualizar</DropdownMenuItem><DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>{p.status === "ordered" && <DropdownMenuItem><Package className="mr-2 h-4 w-4" />Registrar Recebimento</DropdownMenuItem>}<DropdownMenuSeparator /><DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Cancelar</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></td>
            </tr>
          )})}
        </tbody></table></div>
        <div className="flex items-center justify-between border-t border-border px-4 h-8"><p className="text-sm text-muted-foreground">Mostrando {filtered.length} pedidos</p></div>
      </CardContent></Card>
    </div>
  )
}
