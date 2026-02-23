"use client"
import { useState } from "react"
import { Plus, Search, MoreHorizontal, Edit, Eye, MessageSquare, Clock, CheckCircle2, AlertCircle, XCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Ticket { id: string; code: string; subject: string; requester: string; category: string; priority: "low" | "medium" | "high" | "urgent"; status: "open" | "in_progress" | "waiting" | "resolved" | "closed"; createdAt: string; updatedAt: string; assignee?: string; slaDeadline?: string }

const priorityCfg = { low: { label: "Baixa", cls: "text-muted-foreground bg-muted" }, medium: { label: "Média", cls: "text-blue-600 bg-blue-50" }, high: { label: "Alta", cls: "text-amber-600 bg-amber-50" }, urgent: { label: "Urgente", cls: "text-red-600 bg-red-50" } }
const statusCfg = { open: { label: "Aberto", cls: "text-blue-600 bg-blue-50", icon: AlertCircle }, in_progress: { label: "Em Andamento", cls: "text-amber-600 bg-amber-50", icon: Clock }, waiting: { label: "Aguardando", cls: "text-purple-600 bg-purple-50", icon: Clock }, resolved: { label: "Resolvido", cls: "text-green-600 bg-green-50", icon: CheckCircle2 }, closed: { label: "Fechado", cls: "text-muted-foreground bg-muted", icon: XCircle } }

const mock: Ticket[] = [
  { id: "1", code: "TKT-001", subject: "Erro ao gerar NF-e para cliente PJ", requester: "Vendedor Carlos", category: "Fiscal", priority: "high", status: "in_progress", createdAt: "2026-02-23T10:30:00", updatedAt: "2026-02-23T14:15:00", assignee: "Admin Demo", slaDeadline: "2026-02-23T18:30:00" },
  { id: "2", code: "TKT-002", subject: "Cliente não consegue acessar portal", requester: "Construtora Horizonte", category: "Acesso", priority: "medium", status: "open", createdAt: "2026-02-23T09:00:00", updatedAt: "2026-02-23T09:00:00" },
  { id: "3", code: "TKT-003", subject: "Divergência de estoque após inventário", requester: "Estoquista João", category: "Estoque", priority: "high", status: "waiting", createdAt: "2026-02-22T16:00:00", updatedAt: "2026-02-23T08:00:00", assignee: "Admin Demo" },
  { id: "4", code: "TKT-004", subject: "Solicitar aumento de limite de crédito", requester: "Mendes Reformas", category: "Financeiro", priority: "low", status: "resolved", createdAt: "2026-02-21T11:00:00", updatedAt: "2026-02-22T15:00:00", assignee: "Admin Demo" },
  { id: "5", code: "TKT-005", subject: "Boleto vencido não baixado automaticamente", requester: "Financeiro Maria", category: "Financeiro", priority: "urgent", status: "in_progress", createdAt: "2026-02-23T08:00:00", updatedAt: "2026-02-23T11:00:00", assignee: "Admin Demo", slaDeadline: "2026-02-23T16:00:00" },
  { id: "6", code: "TKT-006", subject: "Novo relatório de comissões por região", requester: "Gerente Paulo", category: "BI", priority: "low", status: "open", createdAt: "2026-02-22T14:00:00", updatedAt: "2026-02-22T14:00:00" },
  { id: "7", code: "TKT-007", subject: "Entrega atrasada - Pedido PC-004", requester: "Cliente Casa & Cia", category: "Logística", priority: "high", status: "resolved", createdAt: "2026-02-20T09:00:00", updatedAt: "2026-02-22T10:00:00", assignee: "Admin Demo" },
]

export function TicketList() {
  const [search, setSearch] = useState(""); const [statusF, setStatusF] = useState("all"); const [priorityF, setPriorityF] = useState("all")
  const filtered = mock.filter(t => { const s = !search || t.subject.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase()) || t.requester.toLowerCase().includes(search.toLowerCase()); const st = statusF === "all" || t.status === statusF; const pr = priorityF === "all" || t.priority === priorityF; return s && st && pr })
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
  const openCount = mock.filter(t => ["open","in_progress","waiting"].includes(t.status)).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-lg font-semibold text-foreground">Tickets de Suporte</h1><Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Novo Ticket</Button></div>
      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Abertos</p><p className="text-lg font-bold text-blue-600">{mock.filter(t => t.status === "open").length}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Em Andamento</p><p className="text-lg font-bold text-amber-600">{mock.filter(t => t.status === "in_progress").length}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Resolvidos (mês)</p><p className="text-lg font-bold text-green-600">{mock.filter(t => t.status === "resolved").length}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Urgentes</p><p className="text-lg font-bold text-red-600">{mock.filter(t => t.priority === "urgent" && !["resolved","closed"].includes(t.status)).length}</p></CardContent></Card>
      </div>
      <Card><CardContent className="p-0">
        <div className="flex items-center gap-2 border-b border-border px-4 h-12"><Search className="h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar ticket..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 border-0 shadow-none focus-visible:ring-0" />
          <Select value={statusF} onValueChange={setStatusF}><SelectTrigger className="h-8 w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="open">Aberto</SelectItem><SelectItem value="in_progress">Em Andamento</SelectItem><SelectItem value="waiting">Aguardando</SelectItem><SelectItem value="resolved">Resolvido</SelectItem></SelectContent></Select>
          <Select value={priorityF} onValueChange={setPriorityF}><SelectTrigger className="h-8 w-[130px]"><SelectValue placeholder="Prioridade" /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem><SelectItem value="urgent">Urgente</SelectItem><SelectItem value="high">Alta</SelectItem><SelectItem value="medium">Média</SelectItem><SelectItem value="low">Baixa</SelectItem></SelectContent></Select>
        </div>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border bg-muted/30"><th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Ticket</th><th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Solicitante</th><th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Categoria</th><th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Prioridade</th><th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Status</th><th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Atualizado</th><th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Ações</th></tr></thead><tbody>
          {filtered.map((t, i) => { const st = statusCfg[t.status]; const pr = priorityCfg[t.priority]; return (
            <tr key={t.id} className={cn("border-b border-border transition-colors hover:bg-muted/30", i % 2 === 0 ? "bg-card" : "bg-muted/10")}>
              <td className="px-4 py-3"><div><p className="font-medium text-foreground">{t.subject}</p><p className="text-xs text-muted-foreground">{t.code} • {fmtDate(t.createdAt)}</p></div></td>
              <td className="px-4 py-3"><div className="flex items-center gap-1"><User className="h-3 w-3 text-muted-foreground" /><span className="text-sm text-foreground">{t.requester}</span></div></td>
              <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{t.category}</Badge></td>
              <td className="px-4 py-3"><div className="flex justify-center"><Badge variant="secondary" className={cn("text-xs", pr.cls)}>{pr.label}</Badge></div></td>
              <td className="px-4 py-3"><div className="flex justify-center"><Badge variant="secondary" className={cn("gap-1 text-xs", st.cls)}><st.icon className="h-3 w-3" />{st.label}</Badge></div></td>
              <td className="px-4 py-3"><span className="text-xs text-muted-foreground">{fmtDate(t.updatedAt)}</span>{t.assignee && <p className="text-xs text-muted-foreground">→ {t.assignee}</p>}</td>
              <td className="px-4 py-3"><div className="flex justify-center"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem><Eye className="mr-2 h-4 w-4" />Visualizar</DropdownMenuItem><DropdownMenuItem><MessageSquare className="mr-2 h-4 w-4" />Responder</DropdownMenuItem><DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>{!["resolved","closed"].includes(t.status) && <><DropdownMenuSeparator /><DropdownMenuItem><CheckCircle2 className="mr-2 h-4 w-4" />Resolver</DropdownMenuItem></>}</DropdownMenuContent></DropdownMenu></div></td>
            </tr>
          )})}
        </tbody></table></div>
        <div className="flex items-center justify-between border-t border-border px-4 h-8"><p className="text-sm text-muted-foreground">Mostrando {filtered.length} tickets</p></div>
      </CardContent></Card>
    </div>
  )
}
