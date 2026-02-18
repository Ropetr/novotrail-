"use client"

import React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Truck,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  ChevronDown,
  HelpCircle,
  Store,
  UserCog,
  Building2,
  Briefcase,
  HeadphonesIcon,
  Sun,
  Moon,
  Bell,
  LogOut,
} from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTabs } from "@/contexts/tabs-context"

interface MenuItem {
  icon: React.ElementType
  label: string
  href?: string
  submenu?: { label: string; href: string }[]
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  {
    icon: Users,
    label: "Cadastros",
    submenu: [
      { label: "Clientes", href: "/cadastros/clientes" },
      { label: "Fornecedores", href: "/cadastros/fornecedores" },
      { label: "Produtos", href: "/cadastros/produtos" },
    ],
  },
  {
    icon: ShoppingCart,
    label: "Comercial",
    submenu: [
      { label: "Pedidos", href: "/comercial/pedidos" },
      { label: "Orçamentos", href: "/comercial/orcamentos" },
      { label: "Vendas", href: "/comercial/vendas" },
    ],
  },
  {
    icon: Package,
    label: "Estoque",
    submenu: [
      { label: "Movimentações", href: "/estoque/movimentacoes" },
      { label: "Inventário", href: "/estoque/inventario" },
    ],
  },
  {
    icon: Truck,
    label: "Compras",
    submenu: [
      { label: "Pedidos de Compra", href: "/compras/pedidos" },
      { label: "Cotações", href: "/compras/cotacoes" },
    ],
  },
  {
    icon: FileText,
    label: "Fiscal",
    submenu: [
      { label: "Notas Fiscais", href: "/fiscal/notas" },
      { label: "Impostos", href: "/fiscal/impostos" },
    ],
  },
  {
    icon: DollarSign,
    label: "Financeiro",
    submenu: [
      { label: "Contas a Pagar", href: "/financeiro/pagar" },
      { label: "Contas a Receber", href: "/financeiro/receber" },
      { label: "Fluxo de Caixa", href: "/financeiro/fluxo" },
    ],
  },
  {
    icon: BarChart3,
    label: "Contábil",
    submenu: [
      { label: "Lançamentos", href: "/contabil/lancamentos" },
      { label: "Relatórios", href: "/contabil/relatorios" },
    ],
  },
  {
    icon: Truck,
    label: "Logística",
    submenu: [
      { label: "Entregas", href: "/logistica/entregas" },
      { label: "Rotas", href: "/logistica/rotas" },
    ],
  },
  {
    icon: Briefcase,
    label: "CRM",
    submenu: [
      { label: "Leads", href: "/crm/leads" },
      { label: "Oportunidades", href: "/crm/oportunidades" },
    ],
  },
  {
    icon: Store,
    label: "E-commerce",
    submenu: [
      { label: "Pedidos Online", href: "/ecommerce/pedidos" },
      { label: "Integrações", href: "/ecommerce/integracoes" },
    ],
  },
  {
    icon: UserCog,
    label: "Gestão de Pessoas",
    submenu: [
      { label: "Funcionários", href: "/rh/funcionarios" },
      { label: "Folha de Pagamento", href: "/rh/folha" },
    ],
  },
  {
    icon: Building2,
    label: "Patrimônio",
    submenu: [
      { label: "Ativos", href: "/patrimonio/ativos" },
      { label: "Depreciação", href: "/patrimonio/depreciacao" },
    ],
  },
  {
    icon: BarChart3,
    label: "BI & Relatórios",
    submenu: [
      { label: "Dashboards", href: "/bi/dashboards" },
      { label: "Relatórios", href: "/bi/relatorios" },
    ],
  },
  {
    icon: HeadphonesIcon,
    label: "Suporte",
    submenu: [
      { label: "Tickets", href: "/suporte/tickets" },
      { label: "Base de Conhecimento", href: "/suporte/base" },
    ],
  },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
]

export function AppSidebar() {
  const [openMenus, setOpenMenus] = useState<string[]>(["Cadastros"])
  const [isDark, setIsDark] = useState<boolean | null>(null)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { addTab } = useTabs()

  useEffect(() => {
    setMounted(true)
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDark
    setIsDark(newDarkMode)
    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    )
  }

  const handleNavigation = (href: string, title: string) => {
    console.log("[v0] handleNavigation called - href:", href, "title:", title)
    const tabId = addTab({ title, href, closable: href !== "/dashboard" })
    console.log("[v0] handleNavigation - tabId returned:", tabId)
    router.push(href)
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[200px] bg-sidebar text-sidebar-foreground overflow-y-auto border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-lg font-bold text-primary-foreground">T</span>
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">TrailSystem</span>
      </div>

      {/* Navigation */}
      <nav className="p-2">
        {menuItems.map((item) => (
          <div key={item.label} className="group">
            {item.href && !item.submenu ? (
              <button
                onClick={() => handleNavigation(item.href!, item.label)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname === item.href 
                    ? "text-primary font-medium" 
                    : "text-sidebar-foreground/80 hover:text-primary"
                )}
              >
                <item.icon className="h-4 w-4 text-primary" />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (item.submenu) {
                    toggleMenu(item.label)
                  }
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-sidebar-foreground/80 hover:text-primary"
              >
                <item.icon className="h-4 w-4 text-primary" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.submenu && (
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      openMenus.includes(item.label) && "rotate-180"
                    )}
                  />
                )}
              </button>
            )}

            {item.submenu && openMenus.includes(item.label) && (
              <div className="ml-7 mt-1 space-y-1">
                {item.submenu.map((subItem) => (
                  <button
                    key={subItem.label}
                    onClick={() => handleNavigation(subItem.href, subItem.label)}
                    className={cn(
                      "block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
                      pathname === subItem.href 
                        ? "text-primary font-medium" 
                        : "text-sidebar-foreground/60 hover:text-primary"
                    )}
                  >
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer com controles do usuário */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border bg-sidebar">
        {/* Controles: Tema e Notificações */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-sidebar-border">
          {mounted ? (
            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center h-8 w-8 rounded-md text-sidebar-foreground/60 hover:text-primary hover:bg-sidebar-accent transition-colors"
              title={isDark ? "Modo Claro" : "Modo Escuro"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          ) : (
            <div className="h-8 w-8" />
          )}
          
          <button
            className="relative flex items-center justify-center h-8 w-8 rounded-md text-sidebar-foreground/60 hover:text-primary hover:bg-sidebar-accent transition-colors"
            title="Notificações"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              3
            </span>
          </button>
        </div>
        
        {/* Perfil do usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-sidebar-accent transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" alt="Rodrigo" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">R</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-medium text-sidebar-foreground truncate">Rodrigo</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">rodrigo@trailsystem.com.br</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-48">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              Ajuda
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Versão */}
        <div className="px-3 py-2 border-t border-sidebar-border">
          <span className="text-xs text-sidebar-foreground/40">TrailSystem ERP v3.0</span>
        </div>
      </div>
    </aside>
  )
}
