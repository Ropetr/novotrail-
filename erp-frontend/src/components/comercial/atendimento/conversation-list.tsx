"use client"

import { useState } from "react"
import { Search, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Ícones dos canais
import { MessageCircle, Instagram, Facebook, Mail, Globe } from "lucide-react"

export interface Conversation {
  id: string
  clientName: string
  clientAvatar?: string
  channel: "whatsapp" | "instagram" | "facebook" | "email" | "web"
  lastMessage: string
  timestamp: string
  unreadCount: number
  status: "novo" | "em-atendimento" | "aguardando" | "resolvido" | "fechado"
  priority: "alta" | "media" | "baixa"
  assignedTo?: string
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
}

const channelConfig = {
  whatsapp: { icon: MessageCircle, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950" },
  instagram: { icon: Instagram, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950" },
  facebook: { icon: Facebook, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
  email: { icon: Mail, color: "text-muted-foreground", bg: "bg-muted/10 dark:bg-muted/10" },
  web: { icon: Globe, color: "text-primary", bg: "bg-primary/10" },
}

const statusConfig = {
  novo: { label: "Novo", color: "bg-blue-500" },
  "em-atendimento": { label: "Em Atendimento", color: "bg-yellow-500" },
  aguardando: { label: "Aguardando", color: "bg-orange-500" },
  resolvido: { label: "Resolvido", color: "bg-green-500" },
  fechado: { label: "Fechado", color: "bg-gray-500" },
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterChannel, setFilterChannel] = useState<string>("todos")
  const [filterStatus, setFilterStatus] = useState<string>("todos")

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesChannel = filterChannel === "todos" || conv.channel === filterChannel
    const matchesStatus = filterStatus === "todos" || conv.status === filterStatus
    return matchesSearch && matchesChannel && matchesStatus
  })

  return (
    <div className="flex h-full flex-col border-r border-border bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold mb-3">Conversas</h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2">
          <Select value={filterChannel} onValueChange={setFilterChannel}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos canais</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="web">Chat Web</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos status</SelectItem>
              <SelectItem value="novo">Novo</SelectItem>
              <SelectItem value="em-atendimento">Em Atendimento</SelectItem>
              <SelectItem value="aguardando">Aguardando</SelectItem>
              <SelectItem value="resolvido">Resolvido</SelectItem>
              <SelectItem value="fechado">Fechado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
            <MessageSquare className="h-12 w-12 mb-3 opacity-20" />
            <p className="text-sm">Nenhuma conversa encontrada</p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const ChannelIcon = channelConfig[conv.channel].icon
            const isSelected = conv.id === selectedId

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  "w-full p-4 border-b border-border text-left transition-colors hover:bg-accent/50",
                  isSelected && "bg-accent"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Channel Icon */}
                  <div className={cn("flex-shrink-0 rounded-full p-2", channelConfig[conv.channel].bg)}>
                    <ChannelIcon className={cn("h-4 w-4", channelConfig[conv.channel].color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm truncate">{conv.clientName}</h3>
                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                        {conv.timestamp}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {conv.lastMessage}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Status Badge */}
                      <div className="flex items-center gap-1.5">
                        <div className={cn("h-2 w-2 rounded-full", statusConfig[conv.status].color)} />
                        <span className="text-xs text-muted-foreground">
                          {statusConfig[conv.status].label}
                        </span>
                      </div>

                      {/* Unread Count */}
                      {conv.unreadCount > 0 && (
                        <Badge variant="default" className="h-5 px-1.5 text-xs">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}




