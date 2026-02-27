"use client"
import React, { useState } from "react"
import { FileText, Download, Calendar, Clock, BarChart3, DollarSign, Users, Package, Truck, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface Report { id: string; name: string; description: string; category: string; icon: React.ElementType; lastGenerated?: string; format: string[] }

const reports: Report[] = [
  { id: "1", name: "Faturamento por Período", description: "Receita total, descontos e impostos por período selecionado", category: "Financeiro", icon: DollarSign, lastGenerated: "2026-02-23", format: ["PDF", "Excel"] },
  { id: "2", name: "Ranking de Clientes", description: "Clientes ordenados por faturamento, ticket médio e frequência", category: "Comercial", icon: Users, lastGenerated: "2026-02-22", format: ["PDF", "Excel"] },
  { id: "3", name: "Posição de Estoque", description: "Estoque atual por produto, custo médio e valor total", category: "Estoque", icon: Package, lastGenerated: "2026-02-23", format: ["PDF", "Excel"] },
  { id: "4", name: "Contas a Pagar/Receber", description: "Aging de contas, vencidos e a vencer por período", category: "Financeiro", icon: DollarSign, lastGenerated: "2026-02-21", format: ["PDF", "Excel"] },
  { id: "5", name: "Vendas por Vendedor", description: "Performance individual, metas e comissões", category: "Comercial", icon: BarChart3, format: ["PDF", "Excel"] },
  { id: "6", name: "Curva ABC de Produtos", description: "Classificação ABC por faturamento e margem", category: "Estoque", icon: Package, lastGenerated: "2026-02-20", format: ["PDF"] },
  { id: "7", name: "Entregas por Região", description: "Relatório de entregas, tempos e custos por região", category: "Logística", icon: Truck, format: ["PDF", "Excel"] },
  { id: "8", name: "DRE Simplificado", description: "Demonstrativo de Resultado do Exercício mensal", category: "Financeiro", icon: DollarSign, lastGenerated: "2026-02-01", format: ["PDF"] },
  { id: "9", name: "Comissões do Período", description: "Comissões calculadas por vendedor e regra", category: "Comercial", icon: Users, format: ["PDF", "Excel"] },
  { id: "10", name: "Inventário Valorizado", description: "Posição de estoque com custo médio e valor total por depósito", category: "Estoque", icon: Package, format: ["PDF", "Excel"] },
]

export function ReportList() {
  const [categoryFilter, setCategoryFilter] = useState("all")
  const filtered = reports.filter(r => categoryFilter === "all" || r.category === categoryFilter)
  const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Relatórios</h1>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-8 w-[160px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Todas</SelectItem><SelectItem value="Financeiro">Financeiro</SelectItem><SelectItem value="Comercial">Comercial</SelectItem><SelectItem value="Estoque">Estoque</SelectItem><SelectItem value="Logística">Logística</SelectItem></SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map(report => (
          <Card key={report.id} className="hover:border-primary/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <report.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-foreground">{report.name}</h3>
                    <Badge variant="outline" className="text-xs ml-2">{report.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {report.lastGenerated ? (<><Clock className="h-3 w-3" />Último: {fmtDate(report.lastGenerated)}</>) : <span>Nunca gerado</span>}
                    </div>
                    <div className="flex gap-1">
                      {report.format.map(f => (
                        <Button key={f} variant="outline" size="sm" className="h-7 text-xs gap-1">
                          <Download className="h-3 w-3" />{f}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
