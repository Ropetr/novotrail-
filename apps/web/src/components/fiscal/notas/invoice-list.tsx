"use client"

import { useState } from "react"
import {
  Plus, Search, MoreHorizontal, Eye, Download, Send, XCircle,
  FileText, CheckCircle2, Clock, AlertTriangle, Printer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Invoice {
  id: string
  number: string
  series: string
  type: "nfe" | "nfse" | "nfce"
  operation: "saida" | "entrada"
  client: string
  clientDoc: string
  value: number
  icms: number
  status: "authorized" | "pending" | "cancelled" | "rejected" | "processing"
  issuedAt: string
  accessKey?: string
  saleCode?: string
}

const statusConfig = {
  authorized: { label: "Autorizada", className: "text-green-600 bg-green-50", icon: CheckCircle2 },
  pending: { label: "Pendente", className: "text-amber-600 bg-amber-50", icon: Clock },
  cancelled: { label: "Cancelada", className: "text-muted-foreground bg-muted", icon: XCircle },
  rejected: { label: "Rejeitada", className: "text-red-600 bg-red-50", icon: AlertTriangle },
  processing: { label: "Processando", className: "text-blue-600 bg-blue-50", icon: Clock },
}

const typeLabels = { nfe: "NF-e", nfse: "NFS-e", nfce: "NFC-e" }

const mockInvoices: Invoice[] = [
  { id: "1", number: "000145", series: "1", type: "nfe", operation: "saida", client: "Construtora Horizonte", clientDoc: "12.345.678/0001-90", value: 48500.00, icms: 5820.00, status: "authorized", issuedAt: "2026-02-23", accessKey: "4126 0212 3456 7800 0190 5500 1000 0001 4510 0000 1459", saleCode: "VND-001" },
  { id: "2", number: "000144", series: "1", type: "nfe", operation: "saida", client: "Mendes Reformas", clientDoc: "98.765.432/0001-10", value: 4200.00, icms: 504.00, status: "authorized", issuedAt: "2026-02-22", accessKey: "4126 0298 7654 3200 0110 5500 1000 0001 4410 0000 1440", saleCode: "VND-002" },
  { id: "3", number: "000143", series: "1", type: "nfe", operation: "saida", client: "Casa & Cia Materiais", clientDoc: "45.678.901/0001-23", value: 12800.00, icms: 1536.00, status: "authorized", issuedAt: "2026-02-20", saleCode: "VND-003" },
  { id: "4", number: "000146", series: "1", type: "nfe", operation: "saida", client: "PF Construções", clientDoc: "11.222.333/0001-44", value: 3650.00, icms: 438.00, status: "pending", issuedAt: "2026-02-23", saleCode: "VND-004" },
  { id: "5", number: "000142", series: "1", type: "nfe", operation: "saida", client: "Condomínio Park Tower", clientDoc: "56.789.012/0001-56", value: 22400.00, icms: 2688.00, status: "cancelled", issuedAt: "2026-02-18" },
  { id: "6", number: "000141", series: "1", type: "nfse", operation: "saida", client: "Arquiteto Lima & Assoc.", clientDoc: "67.890.123/0001-78", value: 8900.00, icms: 0, status: "authorized", issuedAt: "2026-02-17" },
  { id: "7", number: "045821", series: "1", type: "nfe", operation: "entrada", client: "Knauf do Brasil", clientDoc: "01.234.567/0001-89", value: 22500.00, icms: 2700.00, status: "authorized", issuedAt: "2026-02-20" },
  { id: "8", number: "000147", series: "1", type: "nfe", operation: "saida", client: "Distribuidora Norte", clientDoc: "78.901.234/0001-01", value: 15750.00, icms: 1890.00, status: "rejected", issuedAt: "2026-02-23" },
]

export function InvoiceList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [operationFilter, setOperationFilter] = useState("all")

  const filtered = mockInvoices.filter((inv) => {
    const matchesSearch = !searchTerm ||
      inv.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.number.includes(searchTerm) ||
      inv.clientDoc.includes(searchTerm)
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter
    const matchesType = typeFilter === "all" || inv.type === typeFilter
    const matchesOp = operationFilter === "all" || inv.operation === operationFilter
    return matchesSearch && matchesStatus && matchesType && matchesOp
  })

  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
  const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR")

  const totalAuthorized = mockInvoices.filter(i => i.status === "authorized" && i.operation === "saida").reduce((a, i) => a + i.value, 0)
  const totalIcms = mockInvoices.filter(i => i.status === "authorized").reduce((a, i) => a + i.icms, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Notas Fiscais</h1>
        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Emitir NF-e</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Notas Emitidas (mês)</p></div>
          <p className="text-lg font-bold text-foreground mt-1">{mockInvoices.filter(i => i.operation === "saida").length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Faturamento Autorizado</p>
          <p className="text-lg font-bold text-green-600">{fmt(totalAuthorized)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">ICMS Total</p>
          <p className="text-lg font-bold text-amber-600">{fmt(totalIcms)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-600" /><p className="text-xs text-muted-foreground">Rejeitadas</p></div>
          <p className="text-lg font-bold text-red-600 mt-1">{mockInvoices.filter(i => i.status === "rejected").length}</p>
        </CardContent></Card>
      </div>

      {/* Table */}
      <Card><CardContent className="p-0">
        <div className="flex items-center gap-2 border-b border-border px-4 h-12">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por cliente, número ou CNPJ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-8 border-0 shadow-none focus-visible:ring-0" />
          <Select value={operationFilter} onValueChange={setOperationFilter}>
            <SelectTrigger className="h-8 w-[120px]"><SelectValue placeholder="Operação" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todas</SelectItem><SelectItem value="saida">Saída</SelectItem><SelectItem value="entrada">Entrada</SelectItem></SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-[110px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="nfe">NF-e</SelectItem><SelectItem value="nfse">NFS-e</SelectItem><SelectItem value="nfce">NFC-e</SelectItem></SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="authorized">Autorizada</SelectItem><SelectItem value="pending">Pendente</SelectItem><SelectItem value="rejected">Rejeitada</SelectItem><SelectItem value="cancelled">Cancelada</SelectItem></SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full"><thead><tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Número</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Cliente / Fornecedor</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Tipo</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Valor</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">ICMS</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Emissão</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Ações</th>
          </tr></thead><tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">Nenhuma nota encontrada.</td></tr>
            ) : filtered.map((inv, i) => {
              const status = statusConfig[inv.status]
              return (
                <tr key={inv.id} className={cn("border-b border-border transition-colors hover:bg-muted/30", i % 2 === 0 ? "bg-card" : "bg-muted/10")}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium font-mono text-foreground">{inv.number}</p>
                      <p className="text-xs text-muted-foreground">Série {inv.series} {inv.saleCode ? `• ${inv.saleCode}` : ""}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{inv.client}</p>
                      <p className="text-xs text-muted-foreground font-mono">{inv.clientDoc}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <Badge variant="outline" className="text-xs">{typeLabels[inv.type]}</Badge>
                      <span className="text-[10px] text-muted-foreground">{inv.operation === "saida" ? "Saída" : "Entrada"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right"><span className="text-sm font-medium text-foreground">{fmt(inv.value)}</span></td>
                  <td className="px-4 py-3 text-right"><span className="text-sm text-muted-foreground">{inv.icms > 0 ? fmt(inv.icms) : "—"}</span></td>
                  <td className="px-4 py-3"><span className="text-sm text-foreground">{fmtDate(inv.issuedAt)}</span></td>
                  <td className="px-4 py-3"><div className="flex justify-center"><Badge variant="secondary" className={cn("gap-1", status.className)}><status.icon className="h-3 w-3" />{status.label}</Badge></div></td>
                  <td className="px-4 py-3"><div className="flex justify-center">
                    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />Visualizar XML</DropdownMenuItem>
                        <DropdownMenuItem><Printer className="mr-2 h-4 w-4" />Imprimir DANFE</DropdownMenuItem>
                        <DropdownMenuItem><Download className="mr-2 h-4 w-4" />Download PDF</DropdownMenuItem>
                        {inv.status === "pending" && <DropdownMenuItem><Send className="mr-2 h-4 w-4" />Transmitir</DropdownMenuItem>}
                        {inv.status === "rejected" && <DropdownMenuItem><Send className="mr-2 h-4 w-4" />Retransmitir</DropdownMenuItem>}
                        {inv.status === "authorized" && (<><DropdownMenuSeparator /><DropdownMenuItem className="text-destructive"><XCircle className="mr-2 h-4 w-4" />Cancelar NF-e</DropdownMenuItem></>)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div></td>
                </tr>
              )
            })}
          </tbody></table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 h-8">
          <p className="text-sm text-muted-foreground">Mostrando {filtered.length} notas fiscais</p>
        </div>
      </CardContent></Card>
    </div>
  )
}
