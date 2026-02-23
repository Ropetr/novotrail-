"use client"
import { useState } from "react"
import { Search, BookOpen, FileText, ChevronRight, Star, Eye, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Article { id: string; title: string; excerpt: string; category: string; views: number; helpful: number; updatedAt: string }
interface Category { name: string; icon: string; count: number; color: string }

const categories: Category[] = [
  { name: "Primeiros Passos", icon: "🚀", count: 8, color: "bg-blue-50 border-blue-200" },
  { name: "Cadastros", icon: "👥", count: 12, color: "bg-green-50 border-green-200" },
  { name: "Comercial & Vendas", icon: "🛒", count: 15, color: "bg-amber-50 border-amber-200" },
  { name: "Financeiro", icon: "💰", count: 10, color: "bg-purple-50 border-purple-200" },
  { name: "Estoque & Logística", icon: "📦", count: 9, color: "bg-orange-50 border-orange-200" },
  { name: "Fiscal & NF-e", icon: "📄", count: 7, color: "bg-red-50 border-red-200" },
]

const popularArticles: Article[] = [
  { id: "1", title: "Como cadastrar um novo cliente PJ", excerpt: "Passo a passo para cadastrar pessoa jurídica, incluindo consulta automática de CNPJ...", category: "Cadastros", views: 342, helpful: 28, updatedAt: "2026-02-20" },
  { id: "2", title: "Gerando um orçamento e convertendo em venda", excerpt: "Aprenda a criar orçamentos, adicionar itens com desconto e converter em venda...", category: "Comercial & Vendas", views: 289, helpful: 35, updatedAt: "2026-02-18" },
  { id: "3", title: "Emitindo NF-e pelo sistema", excerpt: "Como emitir nota fiscal eletrônica integrada com a Nuvem Fiscal...", category: "Fiscal & NF-e", views: 256, helpful: 22, updatedAt: "2026-02-19" },
  { id: "4", title: "Configurando contas a pagar e receber", excerpt: "Configure suas contas financeiras, categorias e formas de pagamento...", category: "Financeiro", views: 198, helpful: 18, updatedAt: "2026-02-15" },
  { id: "5", title: "Fazendo a entrada de mercadoria no estoque", excerpt: "Registre entradas de mercadoria vinculadas a notas fiscais de compra...", category: "Estoque & Logística", views: 175, helpful: 15, updatedAt: "2026-02-17" },
  { id: "6", title: "Primeiro acesso e configuração inicial", excerpt: "Guia completo para configurar sua empresa, usuários e permissões...", category: "Primeiros Passos", views: 412, helpful: 45, updatedAt: "2026-02-22" },
]

export function KnowledgeBase() {
  const [search, setSearch] = useState("")
  const filtered = search ? popularArticles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase())) : popularArticles

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-lg font-semibold text-foreground">Base de Conhecimento</h1></div>

      <Card><CardContent className="p-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar artigos, tutoriais, dúvidas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10" /></div>
      </CardContent></Card>

      {!search && (
        <div className="grid grid-cols-3 gap-3">
          {categories.map(cat => (
            <Card key={cat.name} className={cn("cursor-pointer hover:border-primary/50 transition-colors border", cat.color)}>
              <CardContent className="p-3 flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <div className="flex-1"><p className="text-sm font-medium text-foreground">{cat.name}</p><p className="text-xs text-muted-foreground">{cat.count} artigos</p></div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card><CardHeader className="border-b border-border/60 py-3 px-4"><CardTitle className="text-base">{search ? "Resultados" : "Artigos Populares"}</CardTitle></CardHeader>
        <CardContent className="p-0"><div className="divide-y divide-border">
          {filtered.map(article => (
            <div key={article.id} className="px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary shrink-0" /><h3 className="text-sm font-medium text-foreground">{article.title}</h3></div>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">{article.excerpt}</p>
                  <div className="flex items-center gap-3 mt-2 ml-6">
                    <Badge variant="outline" className="text-xs">{article.category}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Eye className="h-3 w-3" />{article.views}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Star className="h-3 w-3" />{article.helpful} útil</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{new Date(article.updatedAt + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div></CardContent>
      </Card>
    </div>
  )
}
