"use client"
import { useState } from "react"
import { Search, Package, AlertTriangle, TrendingDown, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface InventoryItem { id: string; code: string; name: string; category: string; currentStock: number; minStock: number; maxStock: number; unit: string; avgCost: number; totalValue: number; lastMovement: string; status: "ok" | "low" | "critical" | "over" }

const statusConfig = { ok: { label: "Normal", className: "text-green-600 bg-green-50" }, low: { label: "Baixo", className: "text-amber-600 bg-amber-50" }, critical: { label: "Crítico", className: "text-red-600 bg-red-50" }, over: { label: "Excesso", className: "text-blue-600 bg-blue-50" } }

const mockInventory: InventoryItem[] = [
  { id: "1", code: "PRO-001", name: "Placa Drywall ST 12.5mm", category: "Chapas", currentStock: 420, minStock: 100, maxStock: 800, unit: "un", avgCost: 38.50, totalValue: 16170.00, lastMovement: "2026-02-23", status: "ok" },
  { id: "2", code: "PRO-002", name: "Perfil Montante 48mm", category: "Perfis", currentStock: 850, minStock: 200, maxStock: 1500, unit: "un", avgCost: 9.80, totalValue: 8330.00, lastMovement: "2026-02-23", status: "ok" },
  { id: "3", code: "PRO-003", name: "Massa Corrida 25kg", category: "Acabamento", currentStock: 180, minStock: 150, maxStock: 500, unit: "un", avgCost: 28.00, totalValue: 5040.00, lastMovement: "2026-02-22", status: "low" },
  { id: "4", code: "PRO-004", name: "Fita Papel 50m", category: "Acessórios", currentStock: 320, minStock: 100, maxStock: 600, unit: "un", avgCost: 4.20, totalValue: 1344.00, lastMovement: "2026-02-22", status: "ok" },
  { id: "5", code: "PRO-005", name: "Parafuso Drywall 3.5x25", category: "Fixação", currentStock: 5000, minStock: 2000, maxStock: 10000, unit: "un", avgCost: 0.18, totalValue: 900.00, lastMovement: "2026-02-21", status: "ok" },
  { id: "6", code: "PRO-006", name: "Perfil Guia 48mm", category: "Perfis", currentStock: 45, minStock: 100, maxStock: 800, unit: "un", avgCost: 8.50, totalValue: 382.50, lastMovement: "2026-02-19", status: "critical" },
  { id: "7", code: "PRO-007", name: "Placa Drywall RU 12.5mm", category: "Chapas", currentStock: 620, minStock: 80, maxStock: 500, unit: "un", avgCost: 52.00, totalValue: 32240.00, lastMovement: "2026-02-20", status: "over" },
  { id: "8", code: "PRO-008", name: "Cantoneira 25x25mm", category: "Acessórios", currentStock: 280, minStock: 100, maxStock: 500, unit: "un", avgCost: 6.90, totalValue: 1932.00, lastMovement: "2026-02-18", status: "ok" },
]

export function InventoryList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const filtered = mockInventory.filter((item) => { const s = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.code.toLowerCase().includes(searchTerm.toLowerCase()); const st = statusFilter === "all" || item.status === statusFilter; return s && st })
  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
  const totalValue = mockInventory.reduce((a, i) => a + i.totalValue, 0)
  const totalItems = mockInventory.reduce((a, i) => a + i.currentStock, 0)
  const criticalCount = mockInventory.filter(i => i.status === "critical").length
  const lowCount = mockInventory.filter(i => i.status === "low").length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-lg font-semibold text-foreground">Inventário</h1><Button size="sm" variant="outline" className="gap-2"><BarChart3 className="h-4 w-4" />Exportar</Button></div>
      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="p-3"><div className="flex items-center gap-2"><Package className="h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Total em Estoque</p></div><p className="text-lg font-bold text-foreground mt-1">{totalItems.toLocaleString("pt-BR")} un</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Valor Total</p><p className="text-lg font-bold text-foreground">{fmt(totalValue)}</p></CardContent></Card>
        <Card><CardContent className="p-3"><div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-600" /><p className="text-xs text-muted-foreground">Itens Críticos</p></div><p className="text-lg font-bold text-red-600 mt-1">{criticalCount}</p></CardContent></Card>
        <Card><CardContent className="p-3"><div className="flex items-center gap-2"><TrendingDown className="h-4 w-4 text-amber-600" /><p className="text-xs text-muted-foreground">Estoque Baixo</p></div><p className="text-lg font-bold text-amber-600 mt-1">{lowCount}</p></CardContent></Card>
      </div>
      <Card><CardContent className="p-0">
        <div className="flex items-center gap-2 border-b border-border px-4 h-12"><Search className="h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar produto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-8 border-0 shadow-none focus-visible:ring-0" /><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="h-8 w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="ok">Normal</SelectItem><SelectItem value="low">Baixo</SelectItem><SelectItem value="critical">Crítico</SelectItem><SelectItem value="over">Excesso</SelectItem></SelectContent></Select></div>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border bg-muted/30"><th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Produto</th><th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Categoria</th><th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Estoque</th><th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Mín / Máx</th><th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Custo Médio</th><th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Valor Total</th><th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Status</th></tr></thead><tbody>
          {filtered.map((item, i) => { const st = statusConfig[item.status]; return (
            <tr key={item.id} className={cn("border-b border-border transition-colors hover:bg-muted/30", i % 2 === 0 ? "bg-card" : "bg-muted/10")}>
              <td className="px-4 py-3"><div><p className="font-medium text-foreground">{item.name}</p><p className="text-xs text-muted-foreground">{item.code}</p></div></td>
              <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{item.category}</Badge></td>
              <td className="px-4 py-3 text-right"><span className="text-sm font-medium text-foreground">{item.currentStock.toLocaleString("pt-BR")} {item.unit}</span></td>
              <td className="px-4 py-3 text-right"><span className="text-xs text-muted-foreground">{item.minStock} / {item.maxStock}</span></td>
              <td className="px-4 py-3 text-right"><span className="text-sm text-foreground">{fmt(item.avgCost)}</span></td>
              <td className="px-4 py-3 text-right"><span className="text-sm font-medium text-foreground">{fmt(item.totalValue)}</span></td>
              <td className="px-4 py-3"><div className="flex justify-center"><Badge variant="secondary" className={cn("text-xs", st.className)}>{st.label}</Badge></div></td>
            </tr>
          )})}
        </tbody></table></div>
        <div className="flex items-center justify-between border-t border-border px-4 h-8"><p className="text-sm text-muted-foreground">Mostrando {filtered.length} produtos</p></div>
      </CardContent></Card>
    </div>
  )
}
