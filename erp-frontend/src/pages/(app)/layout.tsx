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
import EstoqueMovimentacoesPage from "./estoque/movimentacoes/page"
import EstoqueInventarioPage from "./estoque/inventario/page"
import ComprasPedidosPage from "./compras/pedidos/page"
import ComprasCotacoesPage from "./compras/cotacoes/page"
import FiscalNotasPage from "./fiscal/notas/page"
import FiscalImpostosPage from "./fiscal/impostos/page"
import FinanceiroPagarPage from "./financeiro/pagar/page"
import FinanceiroReceberPage from "./financeiro/receber/page"
import FinanceiroFluxoPage from "./financeiro/fluxo/page"
import LogisticaEntregasPage from "./logistica/entregas/page"
import LogisticaRotasPage from "./logistica/rotas/page"
import BiDashboardsPage from "./bi/dashboards/page"
import BiRelatoriosPage from "./bi/relatorios/page"
import SuporteTicketsPage from "./suporte/tickets/page"
import SuporteBasePage from "./suporte/base/page"
import ConfiguracoesPage from "./configuracoes/page"

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
  "/estoque/movimentacoes": { title: "Movimentacoes", allowDuplicates: true },
  "/estoque/inventario": { title: "Inventario", allowDuplicates: true },
  "/compras/pedidos": { title: "Pedidos de Compra", allowDuplicates: true },
  "/compras/cotacoes": { title: "Cotacoes", allowDuplicates: true },
  "/fiscal/notas": { title: "Notas Fiscais", allowDuplicates: true },
  "/fiscal/impostos": { title: "Impostos", allowDuplicates: true },
  "/financeiro/pagar": { title: "Contas a Pagar", allowDuplicates: true },
  "/financeiro/receber": { title: "Contas a Receber", allowDuplicates: true },
  "/financeiro/fluxo": { title: "Fluxo de Caixa", allowDuplicates: true },
  "/logistica/entregas": { title: "Entregas", allowDuplicates: true },
  "/logistica/rotas": { title: "Rotas", allowDuplicates: true },
  "/bi/dashboards": { title: "BI - Dashboards", allowDuplicates: true },
  "/bi/relatorios": { title: "BI - Relatorios", allowDuplicates: true },
  "/suporte/tickets": { title: "Suporte - Tickets", allowDuplicates: true },
  "/suporte/base": { title: "Base de Conhecimento", allowDuplicates: true },
  "/configuracoes": { title: "Configuracoes", allowDuplicates: false },
}

export default function AppLayout({
  children: _children,
}: {
  children: React.ReactNode
}) {
  const { tabs, activeTabId, addTab } = useTabs()
  const location = useLocation()
  const hasInitializedRef = useRef(false)

  // Cria aba automaticamente quando URL é acessada diretamente (ex: F5, nova janela, link direto)
  useEffect(() => {
    // Só executa uma vez na montagem inicial
    if (hasInitializedRef.current) return
    hasInitializedRef.current = true

    const currentPath = location.pathname
    const info = routeInfo[currentPath]

    if (!info) return

    // Verifica se já existe uma aba para esta rota
    const existingTab = tabs.find((t) => t.href === currentPath)
    if (existingTab) return

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
    "/estoque/movimentacoes": EstoqueMovimentacoesPage,
    "/estoque/inventario": EstoqueInventarioPage,
    "/compras/pedidos": ComprasPedidosPage,
    "/compras/cotacoes": ComprasCotacoesPage,
    "/fiscal/notas": FiscalNotasPage,
    "/fiscal/impostos": FiscalImpostosPage,
    "/financeiro/pagar": FinanceiroPagarPage,
    "/financeiro/receber": FinanceiroReceberPage,
    "/financeiro/fluxo": FinanceiroFluxoPage,
    "/logistica/entregas": LogisticaEntregasPage,
    "/logistica/rotas": LogisticaRotasPage,
    "/bi/dashboards": BiDashboardsPage,
    "/bi/relatorios": BiRelatoriosPage,
    "/suporte/tickets": SuporteTicketsPage,
    "/suporte/base": SuporteBasePage,
    "/configuracoes": ConfiguracoesPage,
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




