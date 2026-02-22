"use client"

import { useState } from "react"
import { Send, Paperclip, Smile, MoreVertical, User, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback} from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface Message {
  id: string
  sender: "client" | "agent"
  senderName: string
  content: string
  timestamp: string
  attachments?: { name: string; url: string }[]
}

export interface ChatData {
  conversationId: string
  clientName: string
  clientCompany?: string
  clientPhone?: string
  clientEmail?: string
  status: "novo" | "em-atendimento" | "aguardando" | "resolvido" | "fechado"
  priority: "alta" | "media" | "baixa"
  assignedTo?: string
  messages: Message[]
}

interface ChatAreaProps {
  chatData: ChatData | null
  onStatusChange: (status: string) => void
  onAssignChange: (assignee: string) => void
  onPriorityChange: (priority: string) => void
  onSendMessage: (message: string) => void
}

const statusConfig = {
  novo: { label: "Novo", color: "bg-blue-500" },
  "em-atendimento": { label: "Em Atendimento", color: "bg-yellow-500" },
  aguardando: { label: "Aguardando Cliente", color: "bg-orange-500" },
  resolvido: { label: "Resolvido", color: "bg-green-500" },
  fechado: { label: "Fechado", color: "bg-gray-500" },
}

const priorityConfig = {
  alta: { label: "Alta", color: "text-primary" },
  media: { label: "Média", color: "text-yellow-500" },
  baixa: { label: "Baixa", color: "text-green-500" },
}

export function ChatArea({
  chatData,
  onStatusChange,
  onAssignChange,
  onPriorityChange,
  onSendMessage,
}: ChatAreaProps) {
  const [messageText, setMessageText] = useState("")

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText)
      setMessageText("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!chatData) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/10">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">Selecione uma conversa</h3>
          <p className="text-sm text-muted-foreground">
            Escolha uma conversa da lista para começar o atendimento
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {chatData.clientName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-base">{chatData.clientName}</h2>
              {chatData.clientCompany && (
                <p className="text-sm text-muted-foreground">{chatData.clientCompany}</p>
              )}
              <div className="flex items-center gap-3 mt-1">
                {chatData.clientPhone && (
                  <span className="text-xs text-muted-foreground">{chatData.clientPhone}</span>
                )}
                {chatData.clientEmail && (
                  <span className="text-xs text-muted-foreground">{chatData.clientEmail}</span>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Ver perfil do cliente</DropdownMenuItem>
              <DropdownMenuItem>Criar orçamento</DropdownMenuItem>
              <DropdownMenuItem>Agendar follow-up</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Fechar atendimento</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Controls */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Select value={chatData.status} onValueChange={onStatusChange}>
            <SelectTrigger className="h-8 w-[180px] text-xs">
              <div className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", statusConfig[chatData.status].color)} />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="novo">Novo</SelectItem>
              <SelectItem value="em-atendimento">Em Atendimento</SelectItem>
              <SelectItem value="aguardando">Aguardando Cliente</SelectItem>
              <SelectItem value="resolvido">Resolvido</SelectItem>
              <SelectItem value="fechado">Fechado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={chatData.assignedTo || "nao-atribuido"} onValueChange={onAssignChange}>
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue placeholder="Atribuir a..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nao-atribuido">Não atribuído</SelectItem>
              <SelectItem value="rodrigo">Rodrigo</SelectItem>
              <SelectItem value="maria">Maria Silva</SelectItem>
              <SelectItem value="joao">João Santos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={chatData.priority} onValueChange={onPriorityChange}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alta">
                <span className={priorityConfig.alta.color}>● Alta</span>
              </SelectItem>
              <SelectItem value="media">
                <span className={priorityConfig.media.color}>● Média</span>
              </SelectItem>
              <SelectItem value="baixa">
                <span className={priorityConfig.baixa.color}>● Baixa</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatData.messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.sender === "agent" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className={cn(
                message.sender === "agent"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}>
                {message.senderName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className={cn(
              "flex flex-col gap-1 max-w-[70%]",
              message.sender === "agent" ? "items-end" : "items-start"
            )}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{message.senderName}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {message.timestamp}
                </span>
              </div>

              <div className={cn(
                "rounded-lg px-4 py-2 text-sm",
                message.sender === "agent"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}>
                {message.content}
              </div>

              {message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {message.attachments.map((attachment, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      <Paperclip className="h-3 w-3 mr-1" />
                      {attachment.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Textarea
              placeholder="Digite sua mensagem..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[60px] max-h-[120px] resize-none"
            />
          </div>

          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Smile className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="h-8 w-8"
              onClick={handleSend}
              disabled={!messageText.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Pressione Enter para enviar, Shift + Enter para nova linha
        </p>
      </div>
    </div>
  )
}




