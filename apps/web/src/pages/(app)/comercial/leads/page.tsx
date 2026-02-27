"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  useOpportunities,
  usePipelineStages,
  useSeedPipelineStages,
} from "@/hooks/use-crm"
import type { PipelineStage, Opportunity } from "@/services/crm"

const sourceLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  website: "Website",
  indicacao: "Indicação",
  telefone: "Telefone",
  feira: "Feira",
  outro: "Outro",
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  open: { label: "Aberto", variant: "default" },
  won: { label: "Ganho", variant: "outline" },
  lost: { label: "Perdido", variant: "destructive" },
}

export default function LeadsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  const { data: stagesData, isLoading: stagesLoading } = usePipelineStages()
  const seedStages = useSeedPipelineStages()

  const { data: oppsData, isLoading: oppsLoading, error: oppsError, refetch } = useOpportunities({
    page: 1,
    limit: 50,
    search: search || undefined,
    status: statusFilter || undefined,
  })

  const stages = stagesData?.data || []
  const opportunities = oppsData?.data || []
  const hasStages = stages.length > 0

  const totalValue = opportunities.reduce((sum, o) => sum + Number(o.estimatedValue || 0), 0)

  // Se não há estágios, precisa fazer seed primeiro
  if (!stagesLoading && !hasStages) {
    return (
      <div className="space-y-4 p-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Leads & Oportunidades</h1>
            <p className="text-muted-foreground text-sm">Configure o pipeline para começar</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <p className="font-medium">Pipeline ainda não configurado</p>
              <p className="text-sm text-muted-foreground">
                É necessário criar os estágios do pipeline (Prospecção, Contato, Proposta, etc.) antes de criar oportunidades.
              </p>
            </div>
            <Button
              onClick={() => seedStages.mutate()}
              disabled={seedStages.isPending}
            >
              {seedStages.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Criar Pipeline Padrão (7 Estágios)
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isLoading = stagesLoading || oppsLoading
  const stageMap = new Map((stages as PipelineStage[]).map((s) => [s.id, s]))

  return (
    <div className="space-y-4 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads & Oportunidades</h1>
          <p className="text-muted-foreground text-sm">
            {isLoading ? "Carregando..." : (
              `${opportunities.length} oportunidades · R$ ${totalValue.toLocaleString("pt-BR")} em pipeline`
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Nova Oportunidade
          </Button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar oportunidades..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border rounded-md px-3 text-sm bg-background"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="open">Abertos</option>
          <option value="won">Ganhos</option>
          <option value="lost">Perdidos</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Carregando oportunidades...</span>
        </div>
      )}

      {/* Error */}
      {oppsError && (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive">Erro ao carregar oportunidades</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !oppsError && opportunities.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <UserPlus className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="font-medium">Nenhuma oportunidade encontrada</p>
            <p className="text-sm text-muted-foreground">
              {search ? "Tente ajustar sua busca." : "Crie sua primeira oportunidade para começar a usar o CRM."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Leads List */}
      {!isLoading && (
        <div className="space-y-2">
          {(opportunities as Opportunity[]).map((opp) => {
            const stage = stageMap.get(opp.stageId)
            const daysOpen = Math.floor(
              (Date.now() - new Date(opp.createdAt).getTime()) / (1000 * 60 * 60 * 24)
            )

            return (
              <Card key={opp.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{opp.title}</span>
                        <Badge variant={statusConfig[opp.status]?.variant || "default"}>
                          {statusConfig[opp.status]?.label || opp.status}
                        </Badge>
                        {stage && (
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: stage.color,
                              color: stage.color,
                            }}
                          >
                            {stage.name} ({stage.probability}%)
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {opp.clientName || "Cliente não vinculado"}
                      </p>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        {opp.contactName && <span>{opp.contactName}</span>}
                        {opp.contactEmail && <span>{opp.contactEmail}</span>}
                        {opp.contactPhone && <span>{opp.contactPhone}</span>}
                        {opp.source && <span>Via {sourceLabels[opp.source] || opp.source}</span>}
                        <span>{daysOpen}d aberto</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        R$ {Number(opp.estimatedValue || 0).toLocaleString("pt-BR")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {opp.sellerName || "Sem vendedor"}
                      </p>
                      {opp.expectedCloseDate && (
                        <p className="text-xs text-muted-foreground">
                          Prev: {new Date(opp.expectedCloseDate).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
