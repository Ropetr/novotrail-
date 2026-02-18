"use client"

import React from "react"

import { X, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTabs } from "@/contexts/tabs-context"
import { cn } from "@/lib/utils"

export function TabsBar() {
  const { tabs, activeTabId, setActiveTab, removeTab, addTab } = useTabs()
  const router = useRouter()
  
  console.log("[v0] TabsBar render - tabs:", tabs.map(t => t.title), "activeTabId:", activeTabId)

  const handleTabClick = (tabId: string, href: string) => {
    setActiveTab(tabId)
    router.push(href)
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
          router.push(newActiveTab.href)
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
    router.push("/dashboard")
  }

  return (
    <header className="sticky top-0 z-30 flex h-10 items-center border-b border-border bg-card">
      <div className="flex items-center flex-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id, tab.href)}
            className={cn(
              "group relative flex items-center gap-2 px-4 h-10 text-sm border-r border-border transition-colors min-w-[120px] max-w-[200px]",
              activeTabId === tab.id
                ? "bg-background text-foreground"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            {/* Indicador de aba ativa */}
            {activeTabId === tab.id && (
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
                onClick={(e) => handleCloseTab(e, tab.id)}
                className="opacity-0 group-hover:opacity-100 hover:bg-muted rounded p-0.5 transition-opacity flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </button>
        ))}
      </div>
      
      {/* Botão Nova Aba */}
      <button
        onClick={handleNewTab}
        className="flex items-center justify-center h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border-l border-border"
        title="Nova Aba (Ctrl+T)"
      >
        <Plus className="h-4 w-4" />
      </button>
    </header>
  )
}
