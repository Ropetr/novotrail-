"use client"

import React, { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { TabsBar } from "@/components/dashboard/tabs-bar"
import { useTabs } from "@/contexts/tabs-context"

// Importações dos componentes de página
import Dashboard from "./dashboard/page"
import ClientesPage from "./cadastros/clientes/page"
import FornecedoresPage from "./cadastros/fornecedores/page"
import ProdutosPage from "./cadastros/produtos/page"
import ParceirosPage from "./cadastros/parceiros/page"
import ColaboradoresPage from "./cadastros/colaboradores/page"
import UsuariosPage from "./cadastros/usuarios/page"
import AtendimentoPage from "./comercial/atendimento/page"
import OrcamentosPage from "./comercial/orcamentos/page"
import VendasPage from "./comercial/vendas/page"
import DevolucoesPage from "./comercial/devolucoes/page"

// Mapeamento de rotas para informações da aba
const routeInfo: Record<string, { title: string; allowDuplicates?: boolean }> = {
  "/dashboard": { title: "Dashboard", allowDuplicates: false },
  "/cadastros/clientes": { title: "Clientes", allowDuplicates: true },
  "/cadastros/fornecedores": { title: "Fornecedores", allowDuplicates: true },
  "/cadastros/produtos": { title: "Produtos", allowDuplicates: true },
  "/cadastros/parceiros": { title: "Parceiros", allowDuplicates: true },
  "/cadastros/colaboradores": { title: "Colaboradores", allowDuplicates: true },
  "/cadastros/usuarios": { title: "Usuários", allowDuplicates: true },
  "/comercial/atendimento": { title: "Atendimento", allowDuplicates: false },
  "/comercial/orcamentos": { title: "Orçamentos", allowDuplicates: true },
  "/comercial/vendas": { title: "Vendas", allowDuplicates: true },
  "/comercial/devolucoes": { title: "Devoluções", allowDuplicates: true },
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { tabs, activeTabId, addTab, getTabByHref } = useTabs()
  const location = useLocation()
  const hasInitializedRef = useRef(false)

  // Cria aba automaticamente quando URL é acessada diretamente (ex: nova janela)
  useEffect(() => {
    // Só executa uma vez na montagem inicial
    if (hasInitializedRef.current) return
    hasInitializedRef.current = true

    const currentPath = location.pathname
    const info = routeInfo[currentPath]

    // Se a rota existe e não tem aba correspondente, cria uma
    if (info && tabs.length === 1 && tabs[0].href === "/dashboard") {
      console.log('[AppLayout] URL acessada diretamente, criando aba:', currentPath)

      const pathParts = currentPath.split("/")
      const type = pathParts[pathParts.length - 1]

      addTab({
        title: info.title,
        href: currentPath,
        closable: currentPath !== "/dashboard",
        allowDuplicates: info.allowDuplicates,
        type: info.allowDuplicates ? type : undefined,
      })
    }
  }, [])

  // Mapeamento de rotas para componentes
  const routeComponents: Record<string, React.ComponentType> = {
    "/dashboard": Dashboard,
    "/cadastros/clientes": ClientesPage,
    "/cadastros/fornecedores": FornecedoresPage,
    "/cadastros/produtos": ProdutosPage,
    "/cadastros/parceiros": ParceirosPage,
    "/cadastros/colaboradores": ColaboradoresPage,
    "/cadastros/usuarios": UsuariosPage,
    "/comercial/atendimento": AtendimentoPage,
    "/comercial/orcamentos": OrcamentosPage,
    "/comercial/vendas": VendasPage,
    "/comercial/devolucoes": DevolucoesPage,
  }

  const activeTab = tabs.find((tab) => tab.id === activeTabId)
  const isFullHeightPage = activeTab?.href === "/comercial/atendimento"

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="ml-[200px]">
        <TabsBar />
        <div className={isFullHeightPage ? "" : "p-6"}>
          {/* Renderiza todas as abas, mas só mostra a ativa */}
          {tabs.map((tab) => {
            const Component = routeComponents[tab.href]
            if (!Component) return null

            return (
              <div
                key={tab.id}
                style={{
                  display: tab.id === activeTabId ? "block" : "none",
                }}
              >
                <Component />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
