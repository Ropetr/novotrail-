"use client"

import { useState } from "react"
import { Building2, CreditCard, FileText, Users, Bell, Shield, Palette, Globe, Mail, Warehouse, Truck, BarChart3, Zap, Database, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const tabs = [
  { id: "empresa", label: "Empresa", icon: Building2 },
  { id: "fiscal", label: "Fiscal", icon: FileText },
  { id: "financeiro", label: "Financeiro", icon: CreditCard },
  { id: "estoque", label: "Estoque", icon: Warehouse },
  { id: "comercial", label: "Comercial", icon: BarChart3 },
  { id: "logistica", label: "Logística", icon: Truck },
  { id: "usuarios", label: "Usuários", icon: Users },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "seguranca", label: "Segurança", icon: Shield },
  { id: "aparencia", label: "Aparência", icon: Palette },
  { id: "integracoes", label: "Integrações", icon: Zap },
  { id: "email", label: "E-mail", icon: Mail },
  { id: "backup", label: "Backup", icon: Database },
  { id: "geral", label: "Geral", icon: Settings },
]

export function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState("empresa")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.success("Configurações salvas com sucesso!")
    setIsSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Configurações</h1>
        <Button size="sm" onClick={handleSave} disabled={isSaving}>{isSaving ? "Salvando..." : "Salvar Alterações"}</Button>
      </div>

      <div className="flex gap-4">
        {/* Sidebar Navigation */}
        <Card className="w-56 shrink-0">
          <CardContent className="p-2">
            <nav className="space-y-0.5">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors", activeTab === tab.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>
                  <tab.icon className="h-4 w-4" />{tab.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Content Area */}
        <div className="flex-1 space-y-4">
          {activeTab === "empresa" && (
            <Card><CardHeader className="border-b border-border/60 py-3 px-4"><CardTitle className="text-base">Dados da Empresa</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-4 [&_input]:h-8 [&_button[role='combobox']]:h-8">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Razão Social</Label><Input defaultValue="Planac Acabamentos LTDA" /></div>
                  <div className="space-y-2"><Label>Nome Fantasia</Label><Input defaultValue="Planac Acabamentos" /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2"><Label>CNPJ</Label><Input defaultValue="12.345.678/0001-90" /></div>
                  <div className="space-y-2"><Label>Inscrição Estadual</Label><Input defaultValue="123.456.789" /></div>
                  <div className="space-y-2"><Label>Inscrição Municipal</Label><Input defaultValue="987654" /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2"><Label>Telefone</Label><Input defaultValue="(41) 3333-4444" /></div>
                  <div className="space-y-2"><Label>E-mail</Label><Input defaultValue="contato@planacacabamentos.com.br" /></div>
                  <div className="space-y-2"><Label>Site</Label><Input defaultValue="www.planacacabamentos.com.br" /></div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-2"><Label>CEP</Label><Input defaultValue="80000-000" /></div>
                  <div className="col-span-2 space-y-2"><Label>Endereço</Label><Input defaultValue="Rua das Indústrias, 500" /></div>
                  <div className="space-y-2"><Label>Cidade/UF</Label><Input defaultValue="Curitiba/PR" /></div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "fiscal" && (
            <Card><CardHeader className="border-b border-border/60 py-3 px-4"><CardTitle className="text-base">Configurações Fiscais</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-4 [&_input]:h-8 [&_button[role='combobox']]:h-8">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Regime Tributário</Label><Select defaultValue="3"><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">Simples Nacional</SelectItem><SelectItem value="2">Simples Nacional - Excesso</SelectItem><SelectItem value="3">Regime Normal (Lucro Presumido/Real)</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Ambiente NF-e</Label><Select defaultValue="2"><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">Produção</SelectItem><SelectItem value="2">Homologação</SelectItem></SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Série NF-e</Label><Input defaultValue="1" /></div>
                  <div className="space-y-2"><Label>Próximo Número NF-e</Label><Input defaultValue="1001" /></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Emitir NF-e automaticamente ao finalizar venda</Label></div>
                  <div className="flex items-center gap-3"><Switch /><Label>Enviar NF-e por e-mail ao cliente</Label></div>
                  <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Calcular ICMS-ST automaticamente</Label></div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "financeiro" && (
            <Card><CardHeader className="border-b border-border/60 py-3 px-4"><CardTitle className="text-base">Configurações Financeiras</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-4 [&_input]:h-8 [&_button[role='combobox']]:h-8">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Moeda Padrão</Label><Select defaultValue="BRL"><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="BRL">Real (R$)</SelectItem><SelectItem value="USD">Dólar (US$)</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Limite Crédito Padrão</Label><Input defaultValue="10000" /></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Bloquear vendas para clientes inadimplentes</Label></div>
                  <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Gerar boleto automaticamente ao faturar</Label></div>
                  <div className="flex items-center gap-3"><Switch /><Label>Cobrar juros automáticos em atraso</Label></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2"><Label>Juros ao Mês (%)</Label><Input defaultValue="2.00" /></div>
                  <div className="space-y-2"><Label>Multa Atraso (%)</Label><Input defaultValue="2.00" /></div>
                  <div className="space-y-2"><Label>Dias Tolerância</Label><Input defaultValue="3" /></div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "estoque" && (
            <Card><CardHeader className="border-b border-border/60 py-3 px-4"><CardTitle className="text-base">Configurações de Estoque</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-4 [&_input]:h-8 [&_button[role='combobox']]:h-8">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Método de Custeio</Label><Select defaultValue="avg"><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="avg">Custo Médio Ponderado</SelectItem><SelectItem value="fifo">PEPS (FIFO)</SelectItem><SelectItem value="fefo">FEFO (Validade)</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Depósito Padrão</Label><Select defaultValue="main"><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="main">Galpão Principal</SelectItem><SelectItem value="secondary">Galpão Secundário</SelectItem><SelectItem value="store">Loja</SelectItem></SelectContent></Select></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Permitir estoque negativo</Label></div>
                  <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Alertar estoque mínimo</Label></div>
                  <div className="flex items-center gap-3"><Switch /><Label>Conferência dupla obrigatória na entrada</Label></div>
                  <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Reservar estoque ao criar orçamento</Label></div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "comercial" && (
            <Card><CardHeader className="border-b border-border/60 py-3 px-4"><CardTitle className="text-base">Configurações Comerciais</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-4 [&_input]:h-8 [&_button[role='combobox']]:h-8">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Desconto Máximo (%)</Label><Input defaultValue="15" /></div>
                  <div className="space-y-2"><Label>Validade Padrão Orçamento (dias)</Label><Input defaultValue="7" /></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Exigir aprovação para descontos acima do limite</Label></div>
                  <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Calcular comissão automaticamente</Label></div>
                  <div className="flex items-center gap-3"><Switch /><Label>Permitir venda sem estoque</Label></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Comissão Padrão (%)</Label><Input defaultValue="5.00" /></div>
                  <div className="space-y-2"><Label>Meta Mensal Padrão (R$)</Label><Input defaultValue="50000" /></div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "logistica" && (
            <Card><CardHeader className="border-b border-border/60 py-3 px-4"><CardTitle className="text-base">Configurações de Logística</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-4 [&_input]:h-8 [&_button[role='combobox']]:h-8">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Frete Mínimo (R$)</Label><Input defaultValue="50.00" /></div>
                  <div className="space-y-2"><Label>Raio Entrega Gratuita (km)</Label><Input defaultValue="30" /></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Calcular frete automaticamente por distância</Label></div>
                  <div className="flex items-center gap-3"><Switch /><Label>Permitir agendamento de entrega pelo cliente</Label></div>
                  <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Enviar SMS/WhatsApp de rastreio ao cliente</Label></div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notificacoes" && (
            <Card><CardHeader className="border-b border-border/60 py-3 px-4"><CardTitle className="text-base">Preferências de Notificação</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between"><div><Label>Nova venda realizada</Label><p className="text-xs text-muted-foreground">Notificação quando uma venda é concluída</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between"><div><Label>Conta vencendo</Label><p className="text-xs text-muted-foreground">Alerta 3 dias antes do vencimento</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between"><div><Label>Estoque mínimo atingido</Label><p className="text-xs text-muted-foreground">Quando produto atinge nível crítico</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between"><div><Label>Novo ticket de suporte</Label><p className="text-xs text-muted-foreground">Quando um ticket é criado ou atualizado</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between"><div><Label>Pedido de compra recebido</Label><p className="text-xs text-muted-foreground">Quando mercadoria chega ao depósito</p></div><Switch /></div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "seguranca" && (
            <Card><CardHeader className="border-b border-border/60 py-3 px-4"><CardTitle className="text-base">Segurança</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-4 [&_input]:h-8 [&_button[role='combobox']]:h-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-3"><Switch /><Label>Exigir autenticação de dois fatores (2FA)</Label></div>
                  <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Bloquear conta após 5 tentativas falhas</Label></div>
                  <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Forçar troca de senha a cada 90 dias</Label></div>
                  <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Registrar log de auditoria</Label></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Tempo de Sessão (minutos)</Label><Input defaultValue="480" /></div>
                  <div className="space-y-2"><Label>Tamanho Mínimo Senha</Label><Input defaultValue="8" /></div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "aparencia" && (
            <Card><CardHeader className="border-b border-border/60 py-3 px-4"><CardTitle className="text-base">Aparência</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-4 [&_input]:h-8 [&_button[role='combobox']]:h-8">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Tema</Label><Select defaultValue="system"><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="light">Claro</SelectItem><SelectItem value="dark">Escuro</SelectItem><SelectItem value="system">Sistema</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Cor Primária</Label><Input defaultValue="#DC3545" type="color" className="h-8 w-full" /></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Exibir logo na sidebar</Label></div>
                  <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Sidebar compacta</Label></div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "integracoes" && (
            <Card><CardHeader className="border-b border-border/60 py-3 px-4"><CardTitle className="text-base">Integrações</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-4">
                {[
                  { name: "Nuvem Fiscal", desc: "NF-e, NFS-e, CNPJ", connected: true },
                  { name: "WhatsApp Business", desc: "Atendimento e notificações", connected: false },
                  { name: "Gateway de Pagamento", desc: "Boletos, PIX, cartões", connected: false },
                  { name: "Transportadora", desc: "Rastreio de entregas", connected: false },
                  { name: "Contabilidade", desc: "Exportação contábil", connected: false },
                ].map(int => (
                  <div key={int.name} className="flex items-center justify-between p-3 rounded-lg border">
                    <div><p className="text-sm font-medium text-foreground">{int.name}</p><p className="text-xs text-muted-foreground">{int.desc}</p></div>
                    <Button variant={int.connected ? "outline" : "default"} size="sm">{int.connected ? "Configurar" : "Conectar"}</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === "email" && (
            <Card><CardHeader className="border-b border-border/60 py-3 px-4"><CardTitle className="text-base">Configurações de E-mail</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-4 [&_input]:h-8 [&_button[role='combobox']]:h-8">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Servidor SMTP</Label><Input defaultValue="smtp.gmail.com" /></div>
                  <div className="space-y-2"><Label>Porta</Label><Input defaultValue="587" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Usuário</Label><Input defaultValue="noreply@planacacabamentos.com.br" /></div>
                  <div className="space-y-2"><Label>Senha</Label><Input type="password" defaultValue="••••••••" /></div>
                </div>
                <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Usar TLS/SSL</Label></div>
              </CardContent>
            </Card>
          )}

          {activeTab === "backup" && (
            <Card><CardHeader className="border-b border-border/60 py-3 px-4"><CardTitle className="text-base">Backup e Dados</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Backup automático diário</Label></div>
                  <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Retenção de 30 dias</Label></div>
                </div>
                <div className="flex gap-2"><Button variant="outline" size="sm">Fazer Backup Agora</Button><Button variant="outline" size="sm">Restaurar Backup</Button><Button variant="outline" size="sm">Exportar Dados (LGPD)</Button></div>
                <div className="rounded-lg border p-3 bg-muted/30"><p className="text-xs text-muted-foreground">Último backup: 23/02/2026 às 03:00 — Tamanho: 42 MB</p></div>
              </CardContent>
            </Card>
          )}

          {activeTab === "geral" && (
            <Card><CardHeader className="border-b border-border/60 py-3 px-4"><CardTitle className="text-base">Configurações Gerais</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-4 [&_input]:h-8 [&_button[role='combobox']]:h-8">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Idioma</Label><Select defaultValue="pt-BR"><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pt-BR">Português (Brasil)</SelectItem><SelectItem value="en">English</SelectItem><SelectItem value="es">Español</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Fuso Horário</Label><Select defaultValue="America/Sao_Paulo"><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem><SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem></SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Formato de Data</Label><Select defaultValue="dd/mm/yyyy"><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dd/mm/yyyy">DD/MM/AAAA</SelectItem><SelectItem value="mm/dd/yyyy">MM/DD/AAAA</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Itens por Página</Label><Select defaultValue="20"><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="20">20</SelectItem><SelectItem value="50">50</SelectItem><SelectItem value="100">100</SelectItem></SelectContent></Select></div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "usuarios" && (
            <Card><CardHeader className="border-b border-border/60 py-3 px-4"><CardTitle className="text-base">Gerenciamento de Usuários</CardTitle></CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-3">Gerencie os usuários e permissões do sistema.</p>
                <Button variant="outline" size="sm" onClick={() => window.location.href = "/cadastros/usuarios"}>Ir para Cadastro de Usuários</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
