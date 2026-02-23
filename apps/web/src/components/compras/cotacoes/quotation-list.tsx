"use client"
import { useState } from "react"
import { Plus, Search, MoreHorizontal, Edit, Eye, Trash2, CheckCircle2, Clock, Send, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Quotation { id: string; code: string; title: string; suppliers: string[]; items: number; totalEstimated: number; status: "draft" | "sent" | "received" | "approved" | "cancelled"; createdAt: string; deadline: string }
const statusCfg = { draft: { label: "Rascunho", cls: "text-muted-foreground bg-muted" }, sent: { label: "Enviada", cls: "text-blue-600 bg-blue-50" }, received: { label: "Recebida", cls: "text-amber-600 bg-amber-50" }, approved: { label: "Aprovada", cls: "text-green-600 bg-green-50" }, cancelled: { label: "Cancelada", cls: "text-red-600 bg-red-50" } }
const mock: Quotation[] = [
  { id: "1", code: "COT-001", title: "Reposição Placas Drywall Q1/2026", suppliers: ["Knauf do Brasil", "Placo Saint-Gobain", "Gypsum"], items: 5, totalEstimated: 45000, status: "received", createdAt: "2026-02-20", deadline: "2026-02-27" },
  { id: "2", code: "COT-002", title: "Perfis e Acessórios - Março", suppliers: ["Knauf", "ArcelorMittal"], items: 8, totalEstimated: 22000, status: "sent", createdAt: "2026-02-22", deadline: "2026-03-01" },
  { id: "3", code: "COT-003", title: "Massa e Acabamento", suppliers: ["Eucatex", "Quartzolit"], items: 3, totalEstimated: 12500, status: "approved", createdAt: "2026-02-15", deadline: "2026-02-22" },
  { id: "4", code: "COT-004", title: "Parafusos e Fixação - Lote Grande", suppliers: ["Ciser", "Jomarca"], items: 4, totalEstimated: 8900, status: "draft", createdAt: "2026-02-23", deadline: "2026-03-05" },
]

export function QuotationList() {
  const [search, setSearch] = useState(""); const [statusF, setStatusF] = useState("all")
  const filtered = mock.filter(q => { const s = !search || q.title.toLowerCase().includes(search.toLowerCase()) || q.code.toLowerCase().includes(search.toLowerCase()); const st = statusF === "all" || q.status === statusF; return s && st })
  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
  const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR")
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-lg font-semibold text-foreground">Cotações de Compra</h1><Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Nova Cotação</Button></div>
      <Card><CardContent className="p-0">
        <div className="flex items-center gap-2 border-b border-border px-4 h-12"><Search className="h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar cotação..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 border-0 shadow-none focus-visible:ring-0" /><Select value={statusF} onValueChange={setStatusF}><SelectTrigger className="h-8 w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="draft">Rascunho</SelectItem><SelectItem value="sent">Enviada</SelectItem><SelectItem value="received">Recebida</SelectItem><SelectItem value="approved">Aprovada</SelectItem></SelectContent></Select></div>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border bg-muted/30"><th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Cotação</th><th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Fornecedores</th><th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Itens</th><th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Estimado</th><th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Prazo</th><th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Status</th><th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Ações</th></tr></thead><tbody>
          {filtered.map((q, i) => { const st = statusCfg[q.status]; return (
            <tr key={q.id} className={cn("border-b border-border transition-colors hover:bg-muted/30", i % 2 === 0 ? "bg-card" : "bg-muted/10")}>
              <td className="px-4 py-3"><div><p className="font-medium text-foreground">{q.title}</p><p className="text-xs text-muted-foreground">{q.code} • {fmtDate(q.createdAt)}</p></div></td>
              <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{q.suppliers.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div></td>
              <td className="px-4 py-3 text-center"><span className="text-sm text-foreground">{q.items}</span></td>
              <td className="px-4 py-3 text-right"><span className="text-sm font-medium text-foreground">{fmt(q.totalEstimated)}</span></td>
              <td className="px-4 py-3"><span className="text-sm text-foreground">{fmtDate(q.deadline)}</span></td>
              <td className="px-4 py-3"><div className="flex justify-center"><Badge variant="secondary" className={cn("text-xs", st.cls)}>{st.label}</Badge></div></td>
              <td className="px-4 py-3"><div className="flex justify-center"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem><Eye className="mr-2 h-4 w-4" />Visualizar</DropdownMenuItem><DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>{q.status === "draft" && <DropdownMenuItem><Send className="mr-2 h-4 w-4" />Enviar</DropdownMenuItem>}{q.status === "received" && <DropdownMenuItem><CheckCircle2 className="mr-2 h-4 w-4" />Aprovar</DropdownMenuItem>}<DropdownMenuSeparator /><DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></td>
            </tr>
          )})}
        </tbody></table></div>
        <div className="flex items-center justify-between border-t border-border px-4 h-8"><p className="text-sm text-muted-foreground">Mostrando {filtered.length} cotações</p></div>
      </CardContent></Card>
    </div>
  )
}
