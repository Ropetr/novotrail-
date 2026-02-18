import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { TabsProvider, useTabs } from "./tabs-context"
import React from "react"

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TabsProvider>{children}</TabsProvider>
)

describe("TabsContext - Multiple Tabs Feature", () => {
  it("should create single tab when allowDuplicates is false", () => {
    const { result } = renderHook(() => useTabs(), { wrapper })

    act(() => {
      result.current.addTab({
        title: "Clientes",
        href: "/cadastros/clientes",
        closable: true,
        allowDuplicates: false,
      })
    })

    expect(result.current.tabs).toHaveLength(2) // Dashboard + Clientes

    // Tentar adicionar novamente
    act(() => {
      result.current.addTab({
        title: "Clientes",
        href: "/cadastros/clientes",
        closable: true,
        allowDuplicates: false,
      })
    })

    expect(result.current.tabs).toHaveLength(2) // Não deve criar nova aba
  })

  it("should create multiple tabs when allowDuplicates is true", () => {
    const { result } = renderHook(() => useTabs(), { wrapper })

    // Primeira aba
    act(() => {
      result.current.addTab({
        title: "Clientes",
        href: "/cadastros/clientes",
        closable: true,
        allowDuplicates: true,
        type: "clientes",
      })
    })

    expect(result.current.tabs).toHaveLength(2) // Dashboard + Clientes
    expect(result.current.tabs[1].title).toBe("Clientes")

    // Segunda aba
    act(() => {
      result.current.addTab({
        title: "Clientes",
        href: "/cadastros/clientes",
        closable: true,
        allowDuplicates: true,
        type: "clientes",
      })
    })

    expect(result.current.tabs).toHaveLength(3) // Dashboard + Clientes + Clientes #2
    expect(result.current.tabs[2].title).toBe("Clientes #2")
    expect(result.current.tabs[2].instanceNumber).toBe(2)

    // Terceira aba
    act(() => {
      result.current.addTab({
        title: "Clientes",
        href: "/cadastros/clientes",
        closable: true,
        allowDuplicates: true,
        type: "clientes",
      })
    })

    expect(result.current.tabs).toHaveLength(4) // Dashboard + Clientes + Clientes #2 + Clientes #3
    expect(result.current.tabs[3].title).toBe("Clientes #3")
    expect(result.current.tabs[3].instanceNumber).toBe(3)
  })

  it("should generate unique IDs for duplicate tabs", async () => {
    const { result } = renderHook(() => useTabs(), { wrapper })

    let firstTabId: string
    let secondTabId: string

    act(() => {
      firstTabId = result.current.addTab({
        title: "Clientes",
        href: "/cadastros/clientes",
        closable: true,
        allowDuplicates: true,
        type: "clientes",
      })
    })

    // Pequeno delay para garantir timestamp diferente
    await new Promise(resolve => setTimeout(resolve, 2))

    act(() => {
      secondTabId = result.current.addTab({
        title: "Clientes",
        href: "/cadastros/clientes",
        closable: true,
        allowDuplicates: true,
        type: "clientes",
      })
    })

    expect(firstTabId).not.toBe(secondTabId)
    expect(result.current.tabs[1].id).toBe(firstTabId)
    expect(result.current.tabs[2].id).toBe(secondTabId)
  })

  it("should respect 10 tabs limit", () => {
    const { result } = renderHook(() => useTabs(), { wrapper })

    // Adiciona 10 abas (Dashboard + 9 novas)
    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.addTab({
          title: `Aba ${i + 1}`,
          href: `/route-${i + 1}`,
          closable: true,
          allowDuplicates: true,
          type: `route-${i + 1}`,
        })
      })
    }

    expect(result.current.tabs).toHaveLength(10)

    // Tenta adicionar a 11ª aba
    act(() => {
      result.current.addTab({
        title: "Aba 11",
        href: "/route-11",
        closable: true,
        allowDuplicates: true,
        type: "route-11",
      })
    })

    // Deve manter 10 abas (remove a primeira closable e adiciona a nova)
    expect(result.current.tabs).toHaveLength(10)
    expect(result.current.tabs.some((t) => t.title === "Aba 11")).toBe(true)
  })

  it("should activate newly created tab", () => {
    const { result } = renderHook(() => useTabs(), { wrapper })

    let newTabId: string

    act(() => {
      newTabId = result.current.addTab({
        title: "Clientes",
        href: "/cadastros/clientes",
        closable: true,
        allowDuplicates: true,
        type: "clientes",
      })
    })

    expect(result.current.activeTabId).toBe(newTabId)
  })

  it("should maintain backward compatibility with existing tabs", () => {
    const { result } = renderHook(() => useTabs(), { wrapper })

    // Adiciona aba sem allowDuplicates (comportamento antigo)
    act(() => {
      result.current.addTab({
        title: "Dashboard Personalizado",
        href: "/custom-dashboard",
        closable: true,
      })
    })

    expect(result.current.tabs).toHaveLength(2)

    // Tentar adicionar novamente
    act(() => {
      result.current.addTab({
        title: "Dashboard Personalizado",
        href: "/custom-dashboard",
        closable: true,
      })
    })

    // Não deve criar nova aba (comportamento antigo mantido)
    expect(result.current.tabs).toHaveLength(2)
  })

  it("should handle mixed duplicate and non-duplicate tabs", () => {
    const { result } = renderHook(() => useTabs(), { wrapper })

    // Aba sem duplicatas
    act(() => {
      result.current.addTab({
        title: "Configurações",
        href: "/configuracoes",
        closable: true,
        allowDuplicates: false,
      })
    })

    expect(result.current.tabs).toHaveLength(2)

    // Aba com duplicatas
    act(() => {
      result.current.addTab({
        title: "Clientes",
        href: "/cadastros/clientes",
        closable: true,
        allowDuplicates: true,
        type: "clientes",
      })
    })

    expect(result.current.tabs).toHaveLength(3)

    // Segunda aba de clientes
    act(() => {
      result.current.addTab({
        title: "Clientes",
        href: "/cadastros/clientes",
        closable: true,
        allowDuplicates: true,
        type: "clientes",
      })
    })

    expect(result.current.tabs).toHaveLength(4)
    expect(result.current.tabs[3].title).toBe("Clientes #2")

    // Tentar adicionar configurações novamente (não deve duplicar)
    act(() => {
      result.current.addTab({
        title: "Configurações",
        href: "/configuracoes",
        closable: true,
        allowDuplicates: false,
      })
    })

    expect(result.current.tabs).toHaveLength(4) // Não aumenta
  })
})
