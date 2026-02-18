"use client"

import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from "react"

// Helper condicional para logs em desenvolvimento - Issue #2: Remover console.logs de produção
const isDev = process.env.NODE_ENV === 'development'
const log = (...args: any[]) => isDev && console.log(...args)

export interface Tab {
  id: string
  title: string
  href: string
  icon?: React.ElementType
  hasChanges?: boolean
  closable?: boolean
  type?: string // Tipo da entidade: "cliente", "fornecedor", "produto", etc
  entityId?: string | number // ID da entidade específica
  allowDuplicates?: boolean // Permite múltiplas abas da mesma rota
  instanceNumber?: number // Número da instância para título (ex: "Clientes #2")
}

interface TabsContextType {
  tabs: Tab[]
  activeTabId: string | null
  addTab: (tab: Omit<Tab, "id">) => string
  removeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  updateTab: (tabId: string, updates: Partial<Tab>) => void
  getTabByHref: (href: string) => Tab | undefined
  reorderTabs: (activeId: string, overId: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

export function TabsProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "dashboard",
      title: "Dashboard",
      href: "/dashboard",
      closable: false,
    },
  ])
  const [activeTabId, setActiveTabId] = useState<string | null>("dashboard")

  // Issue #1: Melhorar geração de IDs únicos - Adicionar contador incremental
  const tabCounterRef = useRef(0)

  // Usar ref para ter sempre o valor atual das tabs sem causar re-renders
  const tabsRef = useRef(tabs)
  tabsRef.current = tabs

  log("[v0] TabsProvider render - tabs:", tabs.map(t => t.title), "activeTabId:", activeTabId)

  const addTab = useCallback((tab: Omit<Tab, "id">) => {
    const currentTabs = tabsRef.current
    log("[v0] addTab called - title:", tab.title, "href:", tab.href, "type:", tab.type, "entityId:", tab.entityId, "allowDuplicates:", tab.allowDuplicates, "currentTabs:", currentTabs.map(t => t.title))

    // Se allowDuplicates for true, sempre cria nova aba
    if (tab.allowDuplicates) {
      // Conta quantas abas do mesmo href já existem para gerar o número da instância
      const sameRouteTabs = currentTabs.filter((t) => t.href === tab.href)
      const instanceNumber = sameRouteTabs.length > 0 ? sameRouteTabs.length + 1 : 1

      // Issue #1: Gera ID único usando contador incremental + timestamp
      const newId = `${tab.type || 'tab'}-${++tabCounterRef.current}-${Date.now()}`

      // Ajusta o título com número da instância se não for a primeira
      const displayTitle = instanceNumber > 1 ? `${tab.title} #${instanceNumber}` : tab.title

      const newTab: Tab = {
        ...tab,
        id: newId,
        title: displayTitle,
        instanceNumber,
        closable: tab.closable !== false,
      }

      log("[v0] addTab - creating duplicate tab:", newTab.id, newTab.title)

      setTabs((prev) => {
        // Limita a 10 abas
        if (prev.length >= 10) {
          const tabToRemove = prev.find((t) => t.closable !== false)
          if (tabToRemove) {
            prev = prev.filter((t) => t.id !== tabToRemove.id)
          }
        }
        const newTabs = [...prev, newTab]
        log("[v0] setTabs - new tabs array:", newTabs.map(t => t.title))
        return newTabs
      })
      setActiveTabId(newId)
      return newId
    }

    // Lógica original para abas sem allowDuplicates
    let newId: string
    if (tab.type && tab.entityId !== undefined) {
      newId = `${tab.type}-${tab.entityId}`

      // Verifica se já existe uma aba com o mesmo type+entityId
      const existingTab = currentTabs.find((t) => t.id === newId)
      if (existingTab) {
        log("[v0] addTab - tab already exists (by type+entityId), activating:", existingTab.id)
        setActiveTabId(existingTab.id)
        return existingTab.id
      }
    } else {
      // Para abas sem type/entityId (como Dashboard), verifica por href
      const existingTab = currentTabs.find((t) => t.href === tab.href && !t.type)
      if (existingTab) {
        log("[v0] addTab - tab already exists (by href), activating:", existingTab.id)
        setActiveTabId(existingTab.id)
        return existingTab.id
      }
      // Issue #1: Adicionar contador também para tabs sem type
      newId = `tab-${++tabCounterRef.current}-${Date.now()}`
    }

    const newTab: Tab = {
      ...tab,
      id: newId,
      closable: tab.closable !== false,
    }
    log("[v0] addTab - creating new tab:", newTab.id, newTab.title)

    setTabs((prev) => {
      // Limita a 10 abas
      if (prev.length >= 10) {
        const tabToRemove = prev.find((t) => t.closable !== false)
        if (tabToRemove) {
          prev = prev.filter((t) => t.id !== tabToRemove.id)
        }
      }
      const newTabs = [...prev, newTab]
      log("[v0] setTabs - new tabs array:", newTabs.map(t => t.title))
      return newTabs
    })
    setActiveTabId(newId)
    return newId
  }, [])

  const removeTab = useCallback((tabId: string) => {
    setTabs((prev) => {
      const tabIndex = prev.findIndex((t) => t.id === tabId)
      const tab = prev[tabIndex]
      
      if (!tab || tab.closable === false) return prev
      
      const newTabs = prev.filter((t) => t.id !== tabId)
      
      // Se a aba removida era a ativa, ativa a anterior ou próxima
      setActiveTabId((currentActiveId) => {
        if (currentActiveId === tabId) {
          const newActiveIndex = Math.max(0, tabIndex - 1)
          return newTabs[newActiveIndex]?.id || null
        }
        return currentActiveId
      })
      
      return newTabs
    })
  }, [])

  const setActiveTab = useCallback((tabId: string) => {
    setActiveTabId(tabId)
  }, [])

  const updateTab = useCallback((tabId: string, updates: Partial<Tab>) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === tabId ? { ...tab, ...updates } : tab))
    )
  }, [])

  const getTabByHref = useCallback((href: string) => {
    return tabsRef.current.find((t) => t.href === href)
  }, [])

  const reorderTabs = useCallback((activeId: string, overId: string) => {
    setTabs((prev) => {
      const oldIndex = prev.findIndex((tab) => tab.id === activeId)
      const newIndex = prev.findIndex((tab) => tab.id === overId)

      if (oldIndex === -1 || newIndex === -1) return prev

      const newTabs = [...prev]
      const [movedTab] = newTabs.splice(oldIndex, 1)
      newTabs.splice(newIndex, 0, movedTab)

      return newTabs
    })
  }, [])

  // Issue #3: Adicionar memoização para evitar re-renders desnecessários
  const value = useMemo(
    () => ({
      tabs,
      activeTabId,
      addTab,
      removeTab,
      setActiveTab,
      updateTab,
      getTabByHref,
      reorderTabs,
    }),
    [tabs, activeTabId, addTab, removeTab, setActiveTab, updateTab, getTabByHref, reorderTabs]
  )

  return (
    <TabsContext.Provider value={value}>
      {children}
    </TabsContext.Provider>
  )
}

export function useTabs() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error("useTabs must be used within a TabsProvider")
  }
  return context
}
