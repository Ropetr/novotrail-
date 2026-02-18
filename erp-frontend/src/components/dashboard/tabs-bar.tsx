"use client"

import React from "react"

import { X, Plus, ExternalLink } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTabs } from "@/contexts/tabs-context"
import { cn } from "@/lib/utils"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// Issue #2: Helper condicional para logs em desenvolvimento
const isDev = process.env.NODE_ENV === 'development'
const log = (...args: any[]) => isDev && console.log(...args)

// Zona de detecção para abrir em nova janela (pixels acima da barra de abas)
const DROP_ZONE_HEIGHT = 80

// Zona de detecção para reintegrar aba (pixels abaixo da barra de abas em janela destacada)
const REINTEGRATE_ZONE_HEIGHT = 100

// Verifica se está em uma janela destacada
const isDetachedWindow = () => {
  return window.opener && window.opener !== window
}

// Componente de Tab individual com sortable
function SortableTab({
  tab,
  isActive,
  onTabClick,
  onCloseTab
}: {
  tab: any
  isActive: boolean
  onTabClick: (tabId: string, href: string) => void
  onCloseTab: (e: React.MouseEvent, tabId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onTabClick(tab.id, tab.href)}
      className={cn(
        "group relative flex items-center gap-2 px-4 h-10 text-sm border-r border-border transition-colors min-w-[120px] max-w-[200px] cursor-grab active:cursor-grabbing",
        isActive
          ? "bg-background text-foreground"
          : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        isDragging && "z-50"
      )}
    >
      {/* Indicador de aba ativa */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
      )}

      {/* Indicador de alterações não salvas */}
      {tab.hasChanges && (
        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
      )}

      <span className="truncate flex-1 text-left">{tab.title}</span>

      {/* Botão de fechar */}
      {tab.closable !== false && (
        <button
          onClick={(e) => onCloseTab(e, tab.id)}
          className="opacity-0 group-hover:opacity-100 hover:bg-muted rounded p-0.5 transition-opacity flex-shrink-0"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </button>
  )
}

export function TabsBar() {
  const { tabs, activeTabId, setActiveTab, removeTab, addTab, reorderTabs } = useTabs()
  const navigate = useNavigate()
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [isOverDropZone, setIsOverDropZone] = React.useState(false)
  const [isOverReintegrateZone, setIsOverReintegrateZone] = React.useState(false)
  const tabsBarRef = React.useRef<HTMLElement>(null)
  const [mouseY, setMouseY] = React.useState(0)
  const [isDetached] = React.useState(isDetachedWindow())

  // Listener global para capturar posição do mouse durante drag
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY)
    }

    if (activeId) {
      window.addEventListener('mousemove', handleMouseMove)
      return () => window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [activeId])

  // Verifica se está sobre a drop zone (normal) ou reintegrate zone (destacada)
  React.useEffect(() => {
    if (!activeId || !tabsBarRef.current) {
      setIsOverDropZone(false)
      setIsOverReintegrateZone(false)
      return
    }

    const rect = tabsBarRef.current.getBoundingClientRect()

    if (isDetached) {
      // Em janela destacada: verifica se está ABAIXO da barra (para reintegrar)
      const isBelowReintegrateZone = mouseY > rect.bottom && mouseY < (rect.bottom + REINTEGRATE_ZONE_HEIGHT)
      console.log('[ReintegrateZone] mouseY:', mouseY, 'rect.bottom:', rect.bottom, 'isBelowZone:', isBelowReintegrateZone)
      setIsOverReintegrateZone(isBelowReintegrateZone)
    } else {
      // Em janela normal: verifica se está ACIMA da barra (para destacar)
      const isAboveDropZone = mouseY < rect.top
      console.log('[DropZone] mouseY:', mouseY, 'rect.top:', rect.top, 'isAboveDropZone:', isAboveDropZone)
      setIsOverDropZone(isAboveDropZone)
    }
  }, [activeId, mouseY, isDetached])

  // Listener para receber mensagem de reintegração de janelas destacadas
  React.useEffect(() => {
    if (isDetached) return // Não escuta em janelas destacadas

    const handleMessage = (event: MessageEvent) => {
      // Verifica origem por segurança
      if (event.origin !== window.location.origin) return

      if (event.data.type === 'REINTEGRATE_TAB') {
        console.log('[PostMessage] Recebendo aba para reintegrar:', event.data.tab)

        // Adiciona a aba de volta à janela principal
        addTab(event.data.tab)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [isDetached, addTab])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  log("[v0] TabsBar render - tabs:", tabs.map(t => t.title), "activeTabId:", activeTabId)

  const handleTabClick = (tabId: string, href: string) => {
    setActiveTab(tabId)
    navigate(href)
  }

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation()
    const tab = tabs.find((t) => t.id === tabId)
    if (tab) {
      const tabIndex = tabs.findIndex((t) => t.id === tabId)
      removeTab(tabId)

      // Navega para a aba anterior ou próxima
      const remainingTabs = tabs.filter((t) => t.id !== tabId)
      if (remainingTabs.length > 0) {
        const newActiveIndex = Math.min(tabIndex, remainingTabs.length - 1)
        const newActiveTab = remainingTabs[newActiveIndex]
        if (newActiveTab) {
          setActiveTab(newActiveTab.id)
          navigate(newActiveTab.href)
        }
      }
    }
  }

  const handleNewTab = () => {
    addTab({
      title: "Dashboard",
      href: "/dashboard",
      closable: true,
    })
    navigate("/dashboard")
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    // Se está em janela destacada e sobre a reintegrate zone
    if (isDetached && isOverReintegrateZone && activeId) {
      const tabToReintegrate = tabs.find((tab) => tab.id === activeId)
      if (tabToReintegrate && window.opener) {
        console.log('[DragEnd] Reintegrando aba para janela principal')
        console.log('[DragEnd] Tab:', tabToReintegrate.title)

        // Envia mensagem para janela principal para reintegrar a aba
        window.opener.postMessage(
          {
            type: 'REINTEGRATE_TAB',
            tab: {
              title: tabToReintegrate.title,
              href: tabToReintegrate.href,
              closable: tabToReintegrate.closable,
              allowDuplicates: tabToReintegrate.allowDuplicates,
              type: tabToReintegrate.type,
            },
          },
          window.location.origin
        )

        // Fecha a janela destacada após pequeno delay
        setTimeout(() => {
          window.close()
        }, 100)
      }
    }
    // Se estava sobre a drop zone, abre em nova janela (apenas em janela normal)
    else if (!isDetached && isOverDropZone && activeId) {
      const tabToDetach = tabs.find((tab) => tab.id === activeId)
      if (tabToDetach) {
        const targetUrl = `${window.location.origin}${tabToDetach.href}`

        console.log('[DragEnd] Abrindo aba em nova janela')
        console.log('[DragEnd] Tab:', tabToDetach.title)
        console.log('[DragEnd] Target URL:', targetUrl)
        console.log('[DragEnd] Token no localStorage:', !!localStorage.getItem('erp_auth_token'))

        // Abre nova janela com a rota da aba
        const newWindow = window.open(
          targetUrl,
          '_blank',
          'width=1200,height=800'
        )

        // Remove a aba da janela atual após pequeno delay
        if (newWindow) {
          setTimeout(() => {
            removeTab(activeId)
          }, 100)
        }
      }
    } else if (over && active.id !== over.id) {
      // Reordena as abas normalmente
      reorderTabs(active.id as string, over.id as string)
    }

    setActiveId(null)
    setIsOverDropZone(false)
    setIsOverReintegrateZone(false)
  }

  const activeTab = tabs.find((tab) => tab.id === activeId)

  return (
    <>
      {/* Zona de Drop para nova janela - Indicador visual (apenas em janela normal) */}
      {!isDetached && isOverDropZone && (
        <div className="fixed inset-x-0 top-0 h-20 bg-primary/10 border-2 border-dashed border-primary z-40 flex items-center justify-center">
          <div className="flex items-center gap-2 text-primary font-medium">
            <ExternalLink className="h-5 w-5" />
            <span>Soltar para abrir em nova janela</span>
          </div>
        </div>
      )}

      {/* Zona de Reintegração - Indicador visual (apenas em janela destacada) */}
      {isDetached && isOverReintegrateZone && (
        <div className="fixed inset-x-0 top-10 h-24 bg-green-500/10 border-2 border-dashed border-green-500 z-40 flex items-center justify-center">
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <ExternalLink className="h-5 w-5 rotate-180" />
            <span>Soltar para reintegrar à janela principal</span>
          </div>
        </div>
      )}

      <header ref={tabsBarRef} className="sticky top-0 z-30 flex h-10 items-center border-b border-border bg-card">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
        <div className="flex items-center flex-1 overflow-x-auto scrollbar-hide">
          <SortableContext
            items={tabs.map((tab) => tab.id)}
            strategy={horizontalListSortingStrategy}
          >
            {tabs.map((tab) => (
              <SortableTab
                key={tab.id}
                tab={tab}
                isActive={activeTabId === tab.id}
                onTabClick={handleTabClick}
                onCloseTab={handleCloseTab}
              />
            ))}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeTab ? (
            <div
              className={cn(
                "flex items-center gap-2 px-4 h-10 text-sm border-r border-border min-w-[120px] max-w-[200px] bg-background text-foreground shadow-lg rounded-sm"
              )}
            >
              {activeTab.hasChanges && (
                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              )}
              <span className="truncate flex-1 text-left">{activeTab.title}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Botão Nova Aba */}
      <button
        onClick={handleNewTab}
        className="flex items-center justify-center h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border-l border-border"
        title="Nova Aba (Ctrl+T)"
      >
        <Plus className="h-4 w-4" />
      </button>
    </header>
    </>
  )
}
