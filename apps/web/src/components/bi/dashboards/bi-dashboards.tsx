"use client"
import { useState } from "react"
import { BarChart3, TrendingUp, Users, Package, DollarSign, ShoppingCart, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

const kpis = [
  { label: "Faturamento Mensal", value: 248500, prev: 215300, icon: DollarSign, color: "text-green-600" },
  { label: "Ticket Médio", value: 4850, prev: 4200, icon: ShoppingCart, color: "text-blue-600" },
  { label: "Clientes Ativos", value: 142, prev: 128, icon: Users, color: "text-purple-600" },
  { label: "Produtos Vendidos", value: 3420, prev: 2980, icon: Package, color: "text-amber-600" },
]

const monthlyRevenue = [
  { month: "Set", value: 185000 }, { month: "Out", value: 198000 }, { month: "Nov", value: 212000 },
  { month: "Dez", value: 245000 }, { month: "Jan", value: 215300 }, { month: "Fev", value: 248500 },
]

const topProducts = [
  { name: "Placa Drywall ST 12.5mm", qty: 1250, revenue: 48125 },
  { name: "Perfil Montante 48mm", qty: 3200, revenue: 31360 },
  { name: "Massa Corrida 25kg", qty: 890, revenue: 24920 },
  { name: "Placa Drywall RU 12.5mm", qty: 420, revenue: 21840 },
  { name: "Fita Papel 50m", qty: 2100, revenue: 8820 },
]

const topClients = [
  { name: "Construtora Horizonte", revenue: 85200, orders: 12 },
  { name: "Casa & Cia Materiais", revenue: 52400, orders: 8 },
  { name: "Condomínio Park Tower", revenue: 38600, orders: 3 },
  { name: "Mendes Reformas", revenue: 28500, orders: 15 },
  { name: "PF Construções", revenue: 22300, orders: 6 },
]

export function BiDashboards() {
  const [period, setPeriod] = useState("month")
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.value))
  const maxProdRevenue = Math.max(...topProducts.map(p => p.revenue))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Dashboards BI</h1>
        <Select value={period} onValueChange={setPeriod}><SelectTrigger className="h-8 w-[160px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="week">Esta Semana</SelectItem><SelectItem value="month">Este Mês</SelectItem><SelectItem value="quarter">Trimestre</SelectItem><SelectItem value="year">Este Ano</SelectItem></SelectContent></Select>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {kpis.map(kpi => { const change = ((kpi.value - kpi.prev) / kpi.prev * 100).toFixed(1); const up = kpi.value >= kpi.prev; return (
          <Card key={kpi.label}><CardContent className="p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <kpi.icon className={cn("h-4 w-4", kpi.color)} />
            </div>
            <p className="text-xl font-bold text-foreground mt-1">{typeof kpi.value === "number" && kpi.value > 1000 ? fmt(kpi.value) : kpi.value.toLocaleString("pt-BR")}</p>
            <div className="flex items-center gap-1 mt-1">
              {up ? <ArrowUpRight className="h-3 w-3 text-green-600" /> : <ArrowDownRight className="h-3 w-3 text-red-600" />}
              <span className={cn("text-xs font-medium", up ? "text-green-600" : "text-red-600")}>{up ? "+" : ""}{change}%</span>
              <span className="text-xs text-muted-foreground">vs mês anterior</span>
            </div>
          </CardContent></Card>
        )})}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2"><CardHeader className="border-b border-border/60 py-3 px-4"><CardTitle className="text-base">Faturamento Mensal</CardTitle></CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {monthlyRevenue.map(m => (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-8">{m.month}</span>
                  <div className="flex-1 h-6 bg-muted/30 rounded-sm overflow-hidden">
                    <div className="h-full bg-primary/80 rounded-sm transition-all" style={{ width: `${(m.value / maxRevenue) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium text-foreground w-24 text-right">{fmt(m.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card><CardHeader className="border-b border-border/60 py-3 px-4"><CardTitle className="text-base">Top Clientes</CardTitle></CardHeader>
          <CardContent className="p-0"><div className="divide-y divide-border">
            {topClients.map((c, i) => (
              <div key={c.name} className="px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2"><span className="text-xs font-bold text-muted-foreground w-4">{i+1}</span><div><p className="text-xs font-medium text-foreground">{c.name}</p><p className="text-xs text-muted-foreground">{c.orders} pedidos</p></div></div>
                <span className="text-xs font-medium text-foreground">{fmt(c.revenue)}</span>
              </div>
            ))}
          </div></CardContent>
        </Card>
      </div>

      <Card><CardHeader className="border-b border-border/60 py-3 px-4"><CardTitle className="text-base">Top Produtos por Faturamento</CardTitle></CardHeader>
        <CardContent className="p-4"><div className="space-y-3">
          {topProducts.map((p, i) => (
            <div key={p.name} className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted-foreground w-4">{i+1}</span>
              <div className="flex-1"><div className="flex items-center justify-between mb-1"><span className="text-sm text-foreground">{p.name}</span><span className="text-sm font-medium text-foreground">{fmt(p.revenue)}</span></div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden"><div className="h-full bg-primary/60 rounded-full" style={{ width: `${(p.revenue / maxProdRevenue) * 100}%` }} /></div>
                <p className="text-xs text-muted-foreground mt-0.5">{p.qty.toLocaleString("pt-BR")} unidades</p>
              </div>
            </div>
          ))}
        </div></CardContent>
      </Card>
    </div>
  )
}
