"use client"

import { useState } from "react"
import { Plus, Search, MoreHorizontal, Eye, Edit, Truck, MapPin, Clock, CheckCircle2, Route } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DeliveryRoute {
  id: string; code: string; name: string; region: string; driver: string; vehicle: string
  deliveries: number; totalWeight: number; distance: number; status: "planned" | "in_progress" | "completed"
  scheduledDate: string; startedAt?: string; completedAt?: string
}

const statusConfig = {
  planned: { label: "Planejada", className: "text-amber-600 bg-amber-50" },
  in_progress: { label: "Em Andamento", className: "text-blue-600 bg-blue-50" },
  completed: { label: "Concluída", className: "text-green-600 bg-green-50" },
}

const mockRoutes: DeliveryRoute[] = [
  { id: "1", code: "ROT-001", name: "Curitiba Centro + Batel", region: "Curitiba - Centro", driver: "Carlos Motorista", vehicle: "Truck KLM-9876", deliveries: 4, totalWeight: 5800, distance: 32, status: "in_progress", scheduledDate: "2026-02-23", startedAt: "2026-02-23T08:30:00" },
  { id: "2", code: "ROT-002", name: "Região Metropolitana Sul", region: "São José dos Pinhais", driver: "Pedro Caminhoneiro", vehicle: "Truck DEF-5678", deliveries: 3, totalWeight: 3200, distance: 85, status: "in_progress", scheduledDate: "2026-02-23", startedAt: "2026-02-23T07:00:00" },
  { id: "3", code: "ROT-003", name: "Curitiba Bairros + Almirante", region: "Curitiba - Bairros", driver: "João Entregador", vehicle: "Van ABC-1234", deliveries: 5, totalWeight: 1200, distance: 28, status: "planned", scheduledDate: "2026-02-24" },
  { id: "4", code: "ROT-004", name: "Londrina e Região", region: "Norte do Paraná", driver: "Pedro Caminhoneiro", vehicle: "Truck DEF-5678", deliveries: 2, totalWeight: 4500, distance: 380, status: "planned", scheduledDate: "2026-02-25" },
  { id: "5", code: "ROT-005", name: "Curitiba Portão + CIC", region: "Curitiba - Industrial", driver: "Carlos Motorista", vehicle: "Truck KLM-9876", deliveries: 6, totalWeight: 7200, distance: 45, status: "completed", scheduledDate: "2026-02-22", startedAt: "2026-02-22T07:30:00", completedAt: "2026-02-22T16:45:00" },
]

export function RouteList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const filtered = mockRoutes.filter((r) => { const s = !searchTerm || r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.driver.toLowerCase().includes(searchTerm.toLowerCase()); const st = statusFilter === "all" || r.status === statusFilter; return s && st })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Rotas de Entrega</h1>
        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Nova Rota</Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="p-3"><div className="flex items-center gap-2"><Route className="h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Rotas Hoje</p></div><p className="text-lg font-bold text-foreground mt-1">{mockRoutes.filter(r => r.scheduledDate === "2026-02-23").length}</p></CardContent></Card>
        <Card><CardContent className="p-3"><div className="flex items-center gap-2"><Truck className="h-4 w-4 text-blue-600" /><p className="text-xs text-muted-foreground">Em Andamento</p></div><p className="text-lg font-bold text-blue-600 mt-1">{mockRoutes.filter(r => r.status === "in_progress").length}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Entregas Programadas</p><p className="text-lg font-bold text-foreground">{mockRoutes.reduce((a, r) => a + r.deliveries, 0)}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Km Total Hoje</p><p className="text-lg font-bold text-foreground">{mockRoutes.filter(r => r.scheduledDate === "2026-02-23").reduce((a, r) => a + r.distance, 0)} km</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-0">
        <div className="flex items-center gap-2 border-b border-border px-4 h-12">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar rota ou motorista..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-8 border-0 shadow-none focus-visible:ring-0" />
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="h-8 w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem><SelectItem value="planned">Planejada</SelectItem><SelectItem value="in_progress">Em Andamento</SelectItem><SelectItem value="completed">Concluída</SelectItem></SelectContent></Select>
        </div>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border bg-muted/30">
          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Rota</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Motorista / Veículo</th>
          <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Entregas</th>
          <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Peso</th>
          <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Distância</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Data</th>
          <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Status</th>
          <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Ações</th>
        </tr></thead><tbody>
          {filtered.map((r, i) => {
            const st = statusConfig[r.status]
            return (
              <tr key={r.id} className={cn("border-b border-border transition-colors hover:bg-muted/30", i % 2 === 0 ? "bg-card" : "bg-muted/10")}>
                <td className="px-4 py-3"><div><p className="font-medium text-foreground">{r.name}</p><p className="text-xs text-muted-foreground">{r.code} • <MapPin className="h-3 w-3 inline" /> {r.region}</p></div></td>
                <td className="px-4 py-3"><div><p className="text-sm text-foreground">{r.driver}</p><p className="text-xs text-muted-foreground">{r.vehicle}</p></div></td>
                <td className="px-4 py-3 text-center"><span className="text-sm font-medium text-foreground">{r.deliveries}</span></td>
                <td className="px-4 py-3 text-center"><span className="text-sm text-foreground">{(r.totalWeight / 1000).toFixed(1)}t</span></td>
                <td className="px-4 py-3 text-center"><span className="text-sm text-foreground">{r.distance} km</span></td>
                <td className="px-4 py-3"><span className="text-sm text-foreground">{new Date(r.scheduledDate + "T00:00:00").toLocaleDateString("pt-BR")}</span></td>
                <td className="px-4 py-3"><div className="flex justify-center"><Badge variant="secondary" className={cn("text-xs", st.className)}>{st.label}</Badge></div></td>
                <td className="px-4 py-3"><div className="flex justify-center"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end"><DropdownMenuItem><Eye className="mr-2 h-4 w-4" />Visualizar</DropdownMenuItem><DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>{r.status === "planned" && <DropdownMenuItem><Truck className="mr-2 h-4 w-4" />Iniciar Rota</DropdownMenuItem>}{r.status === "in_progress" && <DropdownMenuItem><CheckCircle2 className="mr-2 h-4 w-4" />Finalizar Rota</DropdownMenuItem>}</DropdownMenuContent>
                </DropdownMenu></div></td>
              </tr>
            )
          })}
        </tbody></table></div>
        <div className="flex items-center justify-between border-t border-border px-4 h-8"><p className="text-sm text-muted-foreground">Mostrando {filtered.length} rotas</p></div>
      </CardContent></Card>
    </div>
  )
}
