"use client"

import { User, ShoppingCart, FileText, Calendar, MessageSquare, Plus, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export interface ClientInfo {
  id: string
  name: string
  company?: string
  email?: string
  phone?: string
  totalPurchases: number
  lastPurchaseDate?: string
  totalTickets: number
}

export interface Activity {
  id: string
  type: "note" | "status-change" | "purchase" | "ticket"
  title: string
  description: string
  timestamp: string
  author?: string
}

interface InfoPanelProps {
  clientInfo: ClientInfo | null
  activities: Activity[]
  onCreateQuote: () => void
  onCreateSale: () => void
  onScheduleFollowup: () => void
  onAddNote: () => void
}

const activityIcons = {
  note: MessageSquare,
  "status-change": Calendar,
  purchase: ShoppingCart,
  ticket: FileText,
}

const activityColors = {
  note: "text-blue-500",
  "status-change": "text-yellow-500",
  purchase: "text-green-500",
  ticket: "text-purple-500",
}

export function InfoPanel({
  clientInfo,
  activities,
  onCreateQuote,
  onCreateSale,
  onScheduleFollowup,
  onAddNote,
}: InfoPanelProps) {
  if (!clientInfo) {
    return (
      <div className="h-full border-l border-border bg-muted/10 p-6">
        <div className="text-center text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Selecione uma conversa para ver informações</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full border-l border-border bg-background overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Card do Cliente */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Informações do Cliente</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {clientInfo.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{clientInfo.name}</h3>
                {clientInfo.company && (
                  <p className="text-xs text-muted-foreground truncate">{clientInfo.company}</p>
                )}
              </div>
            </div>

            <Separator />

            {clientInfo.email && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm">{clientInfo.email}</p>
              </div>
            )}

            {clientInfo.phone && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Telefone</p>
                <p className="text-sm">{clientInfo.phone}</p>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Compras</p>
                <p className="text-lg font-semibold">{clientInfo.totalPurchases}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tickets</p>
                <p className="text-lg font-semibold">{clientInfo.totalTickets}</p>
              </div>
            </div>

            {clientInfo.lastPurchaseDate && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Última compra</p>
                <p className="text-sm">{clientInfo.lastPurchaseDate}</p>
              </div>
            )}

            <Button variant="outline" size="sm" className="w-full mt-2">
              <User className="h-3.5 w-3.5 mr-2" />
              Ver perfil completo
            </Button>
          </CardContent>
        </Card>

        {/* Card de Ações Rápidas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={onCreateQuote}
            >
              <FileText className="h-3.5 w-3.5 mr-2" />
              Criar orçamento
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={onCreateSale}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-2" />
              Gerar venda
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={onScheduleFollowup}
            >
              <Calendar className="h-3.5 w-3.5 mr-2" />
              Agendar follow-up
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={onAddNote}
            >
              <Plus className="h-3.5 w-3.5 mr-2" />
              Adicionar nota
            </Button>
          </CardContent>
        </Card>

        {/* Card de Histórico/Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Histórico de Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Nenhuma atividade registrada
              </p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => {
                  const Icon = activityIcons[activity.type]
                  return (
                    <div key={activity.id} className="relative">
                      {index < activities.length - 1 && (
                        <div className="absolute left-3 top-7 h-full w-px bg-border" />
                      )}

                      <div className="flex gap-3">
                        <div className={cn(
                          "flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-muted",
                          activityColors[activity.type]
                        )}>
                          <Icon className="h-3 w-3" />
                        </div>

                        <div className="flex-1 pb-4">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-xs font-medium">{activity.title}</h4>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {activity.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                          {activity.author && (
                            <p className="text-xs text-muted-foreground mt-1">
                              por {activity.author}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



