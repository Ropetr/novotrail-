"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, DollarSign, User, Calendar } from "lucide-react"

interface PipelineStage {
  id: string
  name: string
  color: string
  probability: number
}

interface Opportunity {
  id: string
  title: string
  clientName: string
  value: number
  stageId: string
  assignedTo: string
  expectedClose: string
  daysInStage: number
}

const stages: PipelineStage[] = [
  { id: "1", name: "Prospecção", color: "#6B7280", probability: 10 },
  { id: "2", name: "Contato", color: "#3B82F6", probability: 25 },
  { id: "3", name: "Proposta", color: "#F59E0B", probability: 50 },
  { id: "4", name: "Negociação", color: "#8B5CF6", probability: 75 },
  { id: "5", name: "Fechamento", color: "#10B981", probability: 100 },
]

const mockOpportunities: Opportunity[] = [
  { id: "1", title: "Drywall obra Maringá", clientName: "Construtora Horizonte", value: 45000, stageId: "3", assignedTo: "João", expectedClose: "2026-03-15", daysInStage: 5 },
  { id: "2", title: "Steel Frame residencial", clientName: "Mendes Reformas", value: 12000, stageId: "1", assignedTo: "Maria", expectedClose: "2026-04-01", daysInStage: 2 },
  { id: "3", title: "Material geral loja", clientName: "Casa & Cia", value: 78000, stageId: "4", assignedTo: "João", expectedClose: "2026-03-01", daysInStage: 8 },
  { id: "4", title: "Reforma comercial", clientName: "PF Construções", value: 23000, stageId: "2", assignedTo: "Maria", expectedClose: "2026-03-20", daysInStage: 3 },
  { id: "5", title: "Acabamento prédio", clientName: "MegaObras", value: 95000, stageId: "3", assignedTo: "João", expectedClose: "2026-03-10", daysInStage: 12 },
  { id: "6", title: "Forro PVC escola", clientName: "Decor Plus", value: 18000, stageId: "5", assignedTo: "Maria", expectedClose: "2026-02-28", daysInStage: 1 },
  { id: "7", title: "Gesso acartonado", clientName: "Reforma Express", value: 8500, stageId: "2", assignedTo: "João", expectedClose: "2026-04-15", daysInStage: 4 },
]

export default function PipelinePage() {
  const getStageOpportunities = (stageId: string) =>
    mockOpportunities.filter((o) => o.stageId === stageId)

  const getStageTotal = (stageId: string) =>
    getStageOpportunities(stageId).reduce((sum, o) => sum + o.value, 0)

  const totalPipeline = mockOpportunities.reduce((sum, o) => sum + o.value, 0)
  const weightedPipeline = mockOpportunities.reduce((sum, o) => {
    const stage = stages.find((s) => s.id === o.stageId)
    return sum + o.value * ((stage?.probability || 0) / 100)
  }, 0)

  return (
    <div className="space-y-4 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pipeline de Vendas</h1>
          <p className="text-muted-foreground text-sm">
            {mockOpportunities.length} oportunidades · R$ {totalPipeline.toLocaleString("pt-BR")} total · R$ {Math.round(weightedPipeline).toLocaleString("pt-BR")} ponderado
          </p>
        </div>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nova Oportunidade
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const opportunities = getStageOpportunities(stage.id)
          const stageTotal = getStageTotal(stage.id)

          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-[280px] bg-muted/30 rounded-lg"
            >
              {/* Stage Header */}
              <div className="p-3 border-b">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="font-medium text-sm">{stage.name}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {opportunities.length}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  R$ {stageTotal.toLocaleString("pt-BR")} · {stage.probability}%
                </p>
              </div>

              {/* Cards */}
              <div className="p-2 space-y-2 min-h-[200px]">
                {opportunities.map((opp) => (
                  <Card
                    key={opp.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-3 space-y-2">
                      <p className="font-medium text-sm leading-tight">
                        {opp.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {opp.clientName}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs">
                          <DollarSign className="h-3 w-3" />
                          <span className="font-semibold">
                            R$ {opp.value.toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{opp.assignedTo}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{opp.daysInStage}d no estágio</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
