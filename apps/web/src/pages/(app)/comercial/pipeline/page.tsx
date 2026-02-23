"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, DollarSign, User, Calendar, Loader2, AlertCircle, Trophy, XCircle } from "lucide-react"
import {
  useOpportunities,
  usePipelineStages,
  usePipelineSummary,
  useSeedPipelineStages,
  useMoveOpportunityStage,
} from "@/hooks/use-crm"

export default function PipelinePage() {
  const { data: stagesData, isLoading: stagesLoading } = usePipelineStages()
  const { data: oppsData, isLoading: oppsLoading } = useOpportunities({ page: 1, limit: 200 })
  const { data: summaryData } = usePipelineSummary()
  const seedStages = useSeedPipelineStages()
  const moveStage = useMoveOpportunityStage()

  const stages = stagesData?.data || []
  const opportunities = oppsData?.data || []
  const summary = summaryData?.data

  // Filtra estágios ativos (sem Ganho/Perdido no kanban principal)
  const activeStages = useMemo(
    () => stages.filter((s: any) => !s.isWon && !s.isLost).sort((a: any, b: any) => a.order - b.order),
    [stages]
  )
  const wonStage = stages.find((s: any) => s.isWon) as any
  const lostStage = stages.find((s: any) => s.isLost) as any

  // Agrupa oportunidades por estágio
  const oppsByStage = useMemo(() => {
    const map = new Map<string, any[]>()
    for (const opp of opportunities) {
      const list = map.get(opp.stageId) || []
      list.push(opp)
      map.set(opp.stageId, list)
    }
    return map
  }, [opportunities])

  const isLoading = stagesLoading || oppsLoading

  // Se não há estágios
  if (!stagesLoading && stages.length === 0) {
    return (
      <div className="space-y-4 p-1">
        <h1 className="text-2xl font-bold tracking-tight">Pipeline de Vendas</h1>
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="font-medium">Pipeline ainda não configurado</p>
            <Button
              onClick={() => seedStages.mutate()}
              disabled={seedStages.isPending}
            >
              {seedStages.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Pipeline Padrão
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleDragStart = (e: React.DragEvent, oppId: string) => {
    e.dataTransfer.setData("opportunityId", oppId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add("bg-accent/50")
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-accent/50")
  }

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    e.currentTarget.classList.remove("bg-accent/50")
    const oppId = e.dataTransfer.getData("opportunityId")
    if (oppId) {
      moveStage.mutate({ id: oppId, stageId })
    }
  }

  return (
    <div className="space-y-4 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pipeline de Vendas</h1>
          <p className="text-muted-foreground text-sm">
            {isLoading ? "Carregando..." : summary ? (
              `${summary.totalOpportunities} oportunidades · R$ ${summary.totalValue.toLocaleString("pt-BR")} total · R$ ${Math.round(summary.weightedValue).toLocaleString("pt-BR")} ponderado`
            ) : (
              `${opportunities.length} oportunidades`
            )}
          </p>
        </div>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nova Oportunidade
        </Button>
      </div>

      {/* Won/Lost summary */}
      {summary && (summary.wonCount > 0 || summary.lostCount > 0) && (
        <div className="flex gap-3">
          {summary.wonCount > 0 && (
            <div className="flex items-center gap-2 text-sm px-3 py-1.5 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-lg">
              <Trophy className="h-4 w-4" />
              <span>{summary.wonCount} ganhas · R$ {summary.wonValue.toLocaleString("pt-BR")}</span>
            </div>
          )}
          {summary.lostCount > 0 && (
            <div className="flex items-center gap-2 text-sm px-3 py-1.5 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-lg">
              <XCircle className="h-4 w-4" />
              <span>{summary.lostCount} perdidas · R$ {summary.lostValue.toLocaleString("pt-BR")}</span>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Carregando pipeline...</span>
        </div>
      )}

      {/* Kanban Board */}
      {!isLoading && (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {activeStages.map((stage: any) => {
            const stageOpps = oppsByStage.get(stage.id) || []
            const stageTotal = stageOpps.reduce((sum: number, o: any) => sum + Number(o.estimatedValue || 0), 0)

            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-[280px] bg-muted/30 rounded-lg transition-colors"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
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
                      {stageOpps.length}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    R$ {stageTotal.toLocaleString("pt-BR")} · {stage.probability}%
                  </p>
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2 min-h-[200px]">
                  {stageOpps.map((opp: any) => {
                    const daysInStage = Math.max(1, Math.floor(
                      (Date.now() - new Date(opp.updatedAt || opp.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                    ))
                    const isStale = daysInStage >= 7 // RN-03: follow-up alert

                    return (
                      <Card
                        key={opp.id}
                        className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                        draggable
                        onDragStart={(e) => handleDragStart(e, opp.id)}
                      >
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <p className="font-medium text-sm leading-tight">
                              {opp.title}
                            </p>
                            {isStale && (
                              <Badge variant="destructive" className="text-[10px] px-1 py-0 ml-1 flex-shrink-0">
                                Atenção
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {opp.clientName || "Sem cliente"}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs">
                              <DollarSign className="h-3 w-3" />
                              <span className="font-semibold">
                                R$ {Number(opp.estimatedValue || 0).toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>{opp.sellerName || "—"}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{daysInStage}d no estágio</span>
                            {opp.source && (
                              <span className="ml-auto text-[10px] opacity-70">via {opp.source}</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Won column (collapsed) */}
          {wonStage && (oppsByStage.get(wonStage.id) || []).length > 0 && (
            <div className="flex-shrink-0 w-[200px] bg-green-50 dark:bg-green-950/30 rounded-lg">
              <div className="p-3 border-b border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <Trophy className="h-3 w-3 text-green-600" />
                  <span className="font-medium text-sm text-green-700 dark:text-green-300">Ganhas</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {(oppsByStage.get(wonStage.id) || []).length}
                  </Badge>
                </div>
              </div>
              <div className="p-2 space-y-1">
                {(oppsByStage.get(wonStage.id) || []).map((opp: any) => (
                  <div key={opp.id} className="text-xs p-2 bg-green-100 dark:bg-green-900/40 rounded">
                    <p className="font-medium">{opp.title}</p>
                    <p className="text-green-700 dark:text-green-300">
                      R$ {Number(opp.estimatedValue || 0).toLocaleString("pt-BR")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lost column (collapsed) */}
          {lostStage && (oppsByStage.get(lostStage.id) || []).length > 0 && (
            <div className="flex-shrink-0 w-[200px] bg-red-50 dark:bg-red-950/30 rounded-lg">
              <div className="p-3 border-b border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <XCircle className="h-3 w-3 text-red-600" />
                  <span className="font-medium text-sm text-red-700 dark:text-red-300">Perdidas</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {(oppsByStage.get(lostStage.id) || []).length}
                  </Badge>
                </div>
              </div>
              <div className="p-2 space-y-1">
                {(oppsByStage.get(lostStage.id) || []).map((opp: any) => (
                  <div key={opp.id} className="text-xs p-2 bg-red-100 dark:bg-red-900/40 rounded">
                    <p className="font-medium">{opp.title}</p>
                    <p className="text-red-700 dark:text-red-300">
                      R$ {Number(opp.estimatedValue || 0).toLocaleString("pt-BR")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
