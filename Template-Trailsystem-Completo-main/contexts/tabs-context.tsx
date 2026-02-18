"use client"

import React, { createContext, useContext, useState, useCallback, useRef } from "react"

export interface Tab {
  id: string
  title: string
  href: string
  icon?: React.ElementType
  hasChanges?: boolean
  closable?: boolean
}

interface TabsContextType {
  tabs: Tab[]
  activeTabId: string | null
  addTab: (tab: Omit<Tab, "id">) => string
  removeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  updateTab: (tabId: string, updates: Partial<Tab>) => void
  getTabByHref: (href: string) => Tab | undefined
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
  
  // Usar ref para ter sempre o valor atual das tabs sem causar re-renders
  const tabsRef = useRef(tabs)
  tabsRef.current = tabs

  console.log("[v0] TabsProvider render - tabs:", tabs.map(t => t.title), "activeTabId:", activeTabId)

  const addTab = useCallback((tab: Omit<Tab, "id">) => {
    const currentTabs = tabsRef.current
    console.log("[v0] addTab called - title:", tab.title, "href:", tab.href, "currentTabs:", currentTabs.map(t => t.title))
    
    // Verifica se já existe uma aba com o mesmo href
    const existingTab = currentTabs.find((t) => t.href === tab.href)
    if (existingTab) {
      console.log("[v0] addTab - tab already exists, activating:", existingTab.id)
      setActiveTabId(existingTab.id)
      return existingTab.id
    }

    const newId = `tab-${Date.now()}`
    const newTab: Tab = {
      ...tab,
      id: newId,
      closable: tab.closable !== false,
    }
    console.log("[v0] addTab - creating new tab:", newTab.id, newTab.title)

    setTabs((prev) => {
      // Limita a 10 abas
      if (prev.length >= 10) {
        const tabToRemove = prev.find((t) => t.closable !== false)
        if (tabToRemove) {
          prev = prev.filter((t) => t.id !== tabToRemove.id)
        }
      }
      const newTabs = [...prev, newTab]
      console.log("[v0] setTabs - new tabs array:", newTabs.map(t => t.title))
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

  return (
    <TabsContext.Provider
      value={{
        tabs,
        activeTabId,
        addTab,
        removeTab,
        setActiveTab,
        updateTab,
        getTabByHref,
      }}
    >
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
