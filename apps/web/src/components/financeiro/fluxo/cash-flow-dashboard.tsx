"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

const mockFluxo = [
  { semana: "17-23 Fev", entradas: 42500, saidas: 31200, saldo: 11300 },
  { semana: "24-02 Mar", entradas: 38900, saidas: 45600, saldo: -6700 },
  { semana: "03-09 Mar", entradas: 55200, saidas: 28400, saldo: 26800 },
  { semana: "10-16 Mar", entradas: 31000, saidas: 35800, saldo: -4800 },
  { semana: "17-23 Mar", entradas: 48700, saidas: 32100, saldo: 16600 },
  { semana: "24-30 Mar", entradas: 29500, saidas: 41300, saldo: -11800 },
]

const mockMovimentos = [
  { id: "1", date: "2026-02-23", desc: "Recebimento - Construtora Horizonte (VND-001)", type: "entrada" as const, value: 24250.00, balance: 89750.00 },
  { id: "2", date: "2026-02-23", desc: "Pagamento - Knauf do Brasil (NF-45821)", type: "saida" as const, value: 11250.00, balance: 78500.00 },
  { id: "3", date: "2026-02-22", desc: "Recebimento - Mendes Reformas (PIX)", type: "entrada" as const, value: 4200.00, balance: 82700.00 },
  { id: "4", date: "2026-02-22", desc: "Pagamento - Transportadora Rápido (Frete)", type: "saida" as const, value: 3100.00, balance: 79600.00 },
  { id: "5", date: "2026-02-21", desc: "Recebimento - PF Construções (Boleto)", type: "entrada" as const, value: 3650.00, balance: 83250.00 },
  { id: "6", date: "2026-02-21", desc: "Pagamento - Copel Energia (Débito)", type: "saida" as const, value: 3420.00, balance: 79830.00 },
  { id: "7", date: "2026-02-20", desc: "Recebimento - Casa & Cia (Parcela 1/3)", type: "entrada" as const, value: 12800.00, balance: 92630.00 },
  { id: "8", date: "2026-02-20", desc: "Pagamento - Gypsum Mineração (Boleto)", type: "saida" as const, value: 18750.00, balance: 73880.00 },
]

export function CashFlowDashboard() {
  const [period, setPeriod] = useState("month")

  const saldoAtual = 89750.00
  const totalEntradas = mockFluxo.reduce((a, f) => a + f.entradas, 0)
  const totalSaidas = mockFluxo.reduce((a, f) => a + f.saidas, 0)
  const saldoPeriodo = totalEntradas - totalSaidas

  const maxValue = Math.max(...mockFluxo.map(f => Math.max(f.entradas, f.saidas)))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Fluxo de Caixa</h1>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="h-8 w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
            <SelectItem value="quarter">Este Trimestre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Saldo Atual</p></div>
          <p className="text-xl font-bold text-foreground mt-1">{fmt(saldoAtual)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2"><ArrowUpRight className="h-4 w-4 text-green-600" /><p className="text-xs text-muted-foreground">Total Entradas</p></div>
          <p className="text-xl font-bold text-green-600 mt-1">{fmt(totalEntradas)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2"><ArrowDownRight className="h-4 w-4 text-red-600" /><p className="text-xs text-muted-foreground">Total Saídas</p></div>
          <p className="text-xl font-bold text-red-600 mt-1">{fmt(totalSaidas)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2">{saldoPeriodo >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}<p className="text-xs text-muted-foreground">Saldo Período</p></div>
          <p className={cn("text-xl font-bold mt-1", saldoPeriodo >= 0 ? "text-green-600" : "text-red-600")}>{fmt(saldoPeriodo)}</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Chart */}
        <Card className="col-span-2">
          <CardHeader className="border-b border-border/60 py-3 px-4">
            <CardTitle className="text-base">Entradas vs Saídas (Semanal)</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {mockFluxo.map((f) => (
                <div key={f.semana} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground w-20">{f.semana}</span>
                    <span className={cn("font-medium", f.saldo >= 0 ? "text-green-600" : "text-red-600")}>{fmt(f.saldo)}</span>
                  </div>
                  <div className="flex gap-1 h-5">
                    <div className="bg-green-500/80 rounded-sm transition-all" style={{ width: `${(f.entradas / maxValue) * 100}%` }} title={`Entradas: ${fmt(f.entradas)}`} />
                    <div className="bg-red-400/80 rounded-sm transition-all" style={{ width: `${(f.saidas / maxValue) * 100}%` }} title={`Saídas: ${fmt(f.saidas)}`} />
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-sm bg-green-500/80" />Entradas</div>
                <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-sm bg-red-400/80" />Saídas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Movements */}
        <Card>
          <CardHeader className="border-b border-border/60 py-3 px-4">
            <CardTitle className="text-base">Últimas Movimentações</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {mockMovimentos.slice(0, 6).map((m) => (
                <div key={m.id} className="px-3 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{new Date(m.date + "T00:00:00").toLocaleDateString("pt-BR")}</p>
                      <p className="text-xs text-foreground truncate">{m.desc}</p>
                    </div>
                    <span className={cn("text-xs font-medium ml-2 whitespace-nowrap", m.type === "entrada" ? "text-green-600" : "text-red-600")}>
                      {m.type === "entrada" ? "+" : "-"}{fmt(m.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Movement Table */}
      <Card>
        <CardHeader className="border-b border-border/60 py-3 px-4"><CardTitle className="text-base">Extrato Detalhado</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full"><thead><tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Data</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Descrição</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Tipo</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Valor</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Saldo</th>
          </tr></thead><tbody>
            {mockMovimentos.map((m, i) => (
              <tr key={m.id} className={cn("border-b border-border", i % 2 === 0 ? "bg-card" : "bg-muted/10")}>
                <td className="px-4 py-2 text-sm text-foreground">{new Date(m.date + "T00:00:00").toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-2 text-sm text-foreground">{m.desc}</td>
                <td className="px-4 py-2 text-center">
                  <Badge variant="secondary" className={cn("text-xs", m.type === "entrada" ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50")}>
                    {m.type === "entrada" ? "Entrada" : "Saída"}
                  </Badge>
                </td>
                <td className={cn("px-4 py-2 text-right text-sm font-medium", m.type === "entrada" ? "text-green-600" : "text-red-600")}>{m.type === "entrada" ? "+" : "-"}{fmt(m.value)}</td>
                <td className="px-4 py-2 text-right text-sm text-foreground">{fmt(m.balance)}</td>
              </tr>
            ))}
          </tbody></table>
        </CardContent>
      </Card>
    </div>
  )
}
