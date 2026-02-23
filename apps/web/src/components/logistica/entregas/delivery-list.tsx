"use client"

import { useState } from "react"
import {
  Plus, Search, MoreHorizontal, Eye, Edit, Truck, MapPin,
  CheckCircle2, Clock, AlertTriangle, Package, Phone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Delivery {
  id: string; code: string; client: string; address: string; city: string
  saleCode: string; items: number; weight: number; status: "pending" | "loading" | "in_transit" | "delivered" | "returned"
  driver?: string; vehicle?: string; scheduledDate: string; deliveredAt?: string
}

const statusConfig = {
  pending: { label: "Pendente", className: "text-amber-600 bg-amber-50", icon: Clock },
  loading: { label: "Carregando", className: "text-blue-600 bg-blue-50", icon: Package },
  in_transit: { label: "Em Trânsito", className: "text-purple-600 bg-purple-50", icon: Truck },
  delivered: { label: "Entregue", className: "text-green-600 bg-green-50", icon: CheckCircle2 },
  returned: { label: "Devolvido", className: "text-red-600 bg-red-50", icon: AlertTriangle },
}

const mockDeliveries: Delivery[] = [
  { id: "1", code: "ENT-001", client: "Construtora Horizonte", address: "Av. das Torres, 1500", city: "Curitiba/PR", saleCode: "VND-001", items: 450, weight: 4500, status: "in_transit", driver: "Carlos Motorista", vehicle: "Truck KLM-9876", scheduledDate: "2026-02-23" },
  { id: "2", code: "ENT-002", client: "Mendes Reformas", address: "Rua XV de Novembro, 320", city: "Curitiba/PR", saleCode: "VND-002", items: 80, weight: 850, status: "delivered", driver: "João Entregador", vehicle: "Van ABC-1234", scheduledDate: "2026-02-22", deliveredAt: "2026-02-22" },
  { id: "3", code: "ENT-003", client: "Casa & Cia Materiais", address: "Rod. BR-116, km 98", city: "São José dos Pinhais/PR", saleCode: "VND-003", items: 120, weight: 1400, status: "pending", scheduledDate: "2026-02-24" },
  { id: "4", code: "ENT-004", client: "PF Construções", address: "Rua Marechal Deodoro, 85", city: "Curitiba/PR", saleCode: "VND-004", items: 35, weight: 280, status: "loading", driver: "Carlos Motorista", vehicle: "Truck KLM-9876", scheduledDate: "2026-02-23" },
  { id: "5", code: "ENT-005", client: "Condomínio Park Tower", address: "Rua Batel, 1800, Bl A", city: "Curitiba/PR", saleCode: "VND-007", items: 200, weight: 2200, status: "pending", scheduledDate: "2026-02-25" },
  { id: "6", code: "ENT-006", client: "Distribuidora Norte", address: "Av. Industrial, 500", city: "Londrina/PR", saleCode: "VND-005", items: 150, weight: 1800, status: "in_transit", driver: "Pedro Caminhoneiro", vehicle: "Truck DEF-5678", scheduledDate: "2026-02-23" },
  { id: "7", code: "ENT-007", client: "Arquiteto Lima & Assoc.", address: "Rua São Paulo, 42", city: "Curitiba/PR", saleCode: "VND-006", items: 15, weight: 90, status: "delivered", driver: "João Entregador", vehicle: "Van ABC-1234", scheduledDate: "2026-02-21", deliveredAt: "2026-02-21" },
]

export function DeliveryList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filtered = mockDeliveries.filter((d) => {
    const matchesSearch = !searchTerm || d.client.toLowerCase().includes(searchTerm.toLowerCase()) || d.code.toLowerCase().includes(searchTerm.toLowerCase()) || d.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || d.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Entregas</h1>
        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Nova Entrega</Button>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {(["pending", "loading", "in_transit", "delivered", "returned"] as const).map((s) => {
          const cfg = statusConfig[s]; const count = mockDeliveries.filter(d => d.status === s).length
          return (<Card key={s}><CardContent className="p-3"><div className="flex items-center gap-2"><cfg.icon className={cn("h-4 w-4", cfg.className.split(" ")[0])} /><p className="text-xs text-muted-foreground">{cfg.label}</p></div><p className={cn("text-lg font-bold mt-1", cfg.className.split(" ")[0])}>{count}</p></CardContent></Card>)
        })}
      </div>

      <Card><CardContent className="p-0">
        <div className="flex items-center gap-2 border-b border-border px-4 h-12">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por cliente, código ou cidade..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-8 border-0 shadow-none focus-visible:ring-0" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="pending">Pendente</SelectItem><SelectItem value="loading">Carregando</SelectItem><SelectItem value="in_transit">Em Trânsito</SelectItem><SelectItem value="delivered">Entregue</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border bg-muted/30">
          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Entrega</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Destino</th>
          <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Itens / Peso</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Motorista</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Programado</th>
          <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Status</th>
          <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Ações</th>
        </tr></thead><tbody>
          {filtered.map((d, i) => {
            const status = statusConfig[d.status]
            return (
              <tr key={d.id} className={cn("border-b border-border transition-colors hover:bg-muted/30", i % 2 === 0 ? "bg-card" : "bg-muted/10")}>
                <td className="px-4 py-3"><div><p className="font-medium text-foreground">{d.client}</p><p className="text-xs text-muted-foreground">{d.code} • {d.saleCode}</p></div></td>
                <td className="px-4 py-3"><div><p className="text-sm text-foreground">{d.address}</p><p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{d.city}</p></div></td>
                <td className="px-4 py-3 text-center"><div><p className="text-sm text-foreground">{d.items} un</p><p className="text-xs text-muted-foreground">{(d.weight / 1000).toFixed(1)}t</p></div></td>
                <td className="px-4 py-3"><div>{d.driver ? (<><p className="text-sm text-foreground">{d.driver}</p><p className="text-xs text-muted-foreground">{d.vehicle}</p></>) : <span className="text-xs text-muted-foreground">Não atribuído</span>}</div></td>
                <td className="px-4 py-3"><span className="text-sm text-foreground">{fmtDate(d.scheduledDate)}</span>{d.deliveredAt && <p className="text-xs text-green-600">Entregue {fmtDate(d.deliveredAt)}</p>}</td>
                <td className="px-4 py-3"><div className="flex justify-center"><Badge variant="secondary" className={cn("gap-1", status.className)}><status.icon className="h-3 w-3" />{status.label}</Badge></div></td>
                <td className="px-4 py-3"><div className="flex justify-center"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />Visualizar</DropdownMenuItem>
                    <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                    {d.status === "pending" && <DropdownMenuItem><Truck className="mr-2 h-4 w-4" />Atribuir Motorista</DropdownMenuItem>}
                    {d.status === "in_transit" && <DropdownMenuItem><CheckCircle2 className="mr-2 h-4 w-4" />Confirmar Entrega</DropdownMenuItem>}
                    {d.driver && <DropdownMenuItem><Phone className="mr-2 h-4 w-4" />Contatar Motorista</DropdownMenuItem>}
                  </DropdownMenuContent>
                </DropdownMenu></div></td>
              </tr>
            )
          })}
        </tbody></table></div>
        <div className="flex items-center justify-between border-t border-border px-4 h-8"><p className="text-sm text-muted-foreground">Mostrando {filtered.length} entregas</p></div>
      </CardContent></Card>
    </div>
  )
}
