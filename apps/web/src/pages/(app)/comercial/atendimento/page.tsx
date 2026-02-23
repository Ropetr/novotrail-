"use client"

import { useState } from "react"
import { ConversationList, Conversation } from "@/components/comercial/atendimento/conversation-list"
import { ChatArea, ChatData, Message } from "@/components/comercial/atendimento/chat-area"
import { InfoPanel, ClientInfo, Activity } from "@/components/comercial/atendimento/info-panel"

// Mock Data
const mockConversations: Conversation[] = [
  {
    id: "1",
    clientName: "Maria Silva",
    channel: "whatsapp",
    lastMessage: "Gostaria de saber mais sobre o produto X",
    timestamp: "10:30",
    unreadCount: 3,
    status: "novo",
    priority: "alta",
  },
  {
    id: "2",
    clientName: "João Santos",
    channel: "instagram",
    lastMessage: "Obrigado pelo atendimento!",
    timestamp: "09:15",
    unreadCount: 0,
    status: "resolvido",
    priority: "baixa",
    assignedTo: "rodrigo",
  },
  {
    id: "3",
    clientName: "Ana Costa",
    channel: "email",
    lastMessage: "Quando posso retirar o pedido?",
    timestamp: "Ontem",
    unreadCount: 1,
    status: "em-atendimento",
    priority: "media",
    assignedTo: "maria",
  },
  {
    id: "4",
    clientName: "Pedro Oliveira",
    channel: "facebook",
    lastMessage: "Preciso de uma cotação urgente",
    timestamp: "Ontem",
    unreadCount: 2,
    status: "aguardando",
    priority: "alta",
    assignedTo: "joao",
  },
  {
    id: "5",
    clientName: "Carla Mendes",
    channel: "web",
    lastMessage: "Qual o prazo de entrega?",
    timestamp: "2 dias",
    unreadCount: 0,
    status: "em-atendimento",
    priority: "media",
  },
  {
    id: "6",
    clientName: "Ricardo Lima",
    channel: "whatsapp",
    lastMessage: "Perfeito, vou aguardar",
    timestamp: "3 dias",
    unreadCount: 0,
    status: "fechado",
    priority: "baixa",
  },
]

const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "m1",
      sender: "client",
      senderName: "Maria Silva",
      content: "Olá, boa tarde!",
      timestamp: "10:25",
    },
    {
      id: "m2",
      sender: "client",
      senderName: "Maria Silva",
      content: "Gostaria de saber mais sobre o produto X",
      timestamp: "10:26",
    },
    {
      id: "m3",
      sender: "client",
      senderName: "Maria Silva",
      content: "Vocês têm em estoque?",
      timestamp: "10:30",
    },
  ],
  "2": [
    {
      id: "m1",
      sender: "client",
      senderName: "João Santos",
      content: "Olá, vi o produto no Instagram e queria mais informações",
      timestamp: "09:00",
    },
    {
      id: "m2",
      sender: "agent",
      senderName: "Rodrigo",
      content: "Olá João! Claro, o produto está disponível nas cores azul, vermelho e preto. O valor é R$ 299,90 com frete grátis.",
      timestamp: "09:05",
    },
    {
      id: "m3",
      sender: "client",
      senderName: "João Santos",
      content: "Perfeito! Vou querer o azul.",
      timestamp: "09:10",
    },
    {
      id: "m4",
      sender: "agent",
      senderName: "Rodrigo",
      content: "Ótimo! Vou preparar o pedido. Pode me passar seu endereço de entrega?",
      timestamp: "09:12",
    },
    {
      id: "m5",
      sender: "client",
      senderName: "João Santos",
      content: "Obrigado pelo atendimento!",
      timestamp: "09:15",
    },
  ],
  "3": [
    {
      id: "m1",
      sender: "client",
      senderName: "Ana Costa",
      content: "Olá, fiz um pedido ontem. Quando posso retirar?",
      timestamp: "Ontem 14:30",
    },
    {
      id: "m2",
      sender: "agent",
      senderName: "Maria Silva",
      content: "Olá Ana! Vou verificar o status do seu pedido. Qual é o número?",
      timestamp: "Ontem 14:35",
    },
  ],
}

const mockClientInfo: Record<string, ClientInfo> = {
  "1": {
    id: "1",
    name: "Maria Silva",
    company: "Silva & Cia",
    email: "maria.silva@email.com",
    phone: "(11) 98765-4321",
    totalPurchases: 5,
    lastPurchaseDate: "15/01/2025",
    totalTickets: 12,
  },
  "2": {
    id: "2",
    name: "João Santos",
    email: "joao.santos@email.com",
    phone: "(11) 91234-5678",
    totalPurchases: 2,
    lastPurchaseDate: "10/02/2025",
    totalTickets: 3,
  },
  "3": {
    id: "3",
    name: "Ana Costa",
    company: "Costa Comércio",
    email: "ana@costacomercio.com",
    phone: "(11) 99876-5432",
    totalPurchases: 15,
    lastPurchaseDate: "12/02/2025",
    totalTickets: 8,
  },
}

const mockActivities: Record<string, Activity[]> = {
  "1": [
    {
      id: "a1",
      type: "note",
      title: "Primeira interação",
      description: "Cliente demonstrou interesse no produto X",
      timestamp: "10:30",
      author: "Sistema",
    },
  ],
  "2": [
    {
      id: "a1",
      type: "purchase",
      title: "Compra realizada",
      description: "Pedido #12345 - Produto Azul",
      timestamp: "09:15",
      author: "Rodrigo",
    },
    {
      id: "a2",
      type: "status-change",
      title: "Status alterado",
      description: "Mudou de 'Em Atendimento' para 'Resolvido'",
      timestamp: "09:16",
      author: "Rodrigo",
    },
    {
      id: "a3",
      type: "note",
      title: "Nota interna",
      description: "Cliente muito satisfeito com o atendimento",
      timestamp: "09:20",
      author: "Rodrigo",
    },
  ],
  "3": [
    {
      id: "a1",
      type: "purchase",
      title: "Compra realizada",
      description: "Pedido #12340 aguardando retirada",
      timestamp: "Ontem 10:00",
      author: "Sistema",
    },
    {
      id: "a2",
      type: "ticket",
      title: "Ticket aberto",
      description: "Solicitação de informação sobre retirada",
      timestamp: "Ontem 14:30",
      author: "Ana Costa",
    },
  ],
}

export default function AtendimentoPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations)

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId)

  const chatData: ChatData | null = selectedConversation
    ? {
        conversationId: selectedConversation.id,
        clientName: selectedConversation.clientName,
        clientCompany: mockClientInfo[selectedConversation.id]?.company,
        clientPhone: mockClientInfo[selectedConversation.id]?.phone,
        clientEmail: mockClientInfo[selectedConversation.id]?.email,
        status: selectedConversation.status,
        priority: selectedConversation.priority,
        assignedTo: selectedConversation.assignedTo,
        messages: mockMessages[selectedConversation.id] || [],
      }
    : null

  const handleStatusChange = (status: string) => {
    if (!selectedConversationId) return
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversationId
          ? { ...conv, status: status as Conversation["status"] }
          : conv
      )
    )
  }

  const handleAssignChange = (assignee: string) => {
    if (!selectedConversationId) return
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversationId
          ? { ...conv, assignedTo: assignee === "nao-atribuido" ? undefined : assignee }
          : conv
      )
    )
  }

  const handlePriorityChange = (priority: string) => {
    if (!selectedConversationId) return
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversationId
          ? { ...conv, priority: priority as Conversation["priority"] }
          : conv
      )
    )
  }

  const handleSendMessage = (message: string) => {
    console.log("Sending message:", message)
    // Aqui você implementaria a lógica de envio real
    // Por enquanto, só logamos
  }

  return (
    <div className="h-[calc(100vh-3.5rem-48px)] flex">
      {/* Sidebar de Conversas - 320px */}
      <div className="w-[320px] flex-shrink-0">
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
        />
      </div>

      {/* Área de Chat - Expandível */}
      <div className="flex-1 min-w-0">
        <ChatArea
          chatData={chatData}
          onStatusChange={handleStatusChange}
          onAssignChange={handleAssignChange}
          onPriorityChange={handlePriorityChange}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Painel de Informações - 360px */}
      <div className="w-[360px] flex-shrink-0">
        <InfoPanel
          clientInfo={selectedConversationId ? mockClientInfo[selectedConversationId] : null}
          activities={selectedConversationId ? mockActivities[selectedConversationId] || [] : []}
          onCreateQuote={() => console.log("Criar orçamento")}
          onCreateSale={() => console.log("Criar venda")}
          onScheduleFollowup={() => console.log("Agendar follow-up")}
          onAddNote={() => console.log("Adicionar nota")}
        />
      </div>
    </div>
  )
}


