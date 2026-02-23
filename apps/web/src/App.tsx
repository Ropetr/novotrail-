import { Routes, Route, Navigate } from 'react-router-dom';
import { Providers } from './components/providers';
import { PrivateRoute } from './components/PrivateRoute';
import AppLayout from './pages/(app)/layout';

// Auth Pages (Públicas)
import LoginPage from './pages/login';
import RegisterPage from './pages/register';

// App Pages (Privadas)
import Dashboard from './pages/(app)/dashboard/page';
import ClientesPage from './pages/(app)/cadastros/clientes/page';
import FornecedoresPage from './pages/(app)/cadastros/fornecedores/page';
import ProdutosPage from './pages/(app)/cadastros/produtos/page';
import ParceirosPage from './pages/(app)/cadastros/parceiros/page';
import ColaboradoresPage from './pages/(app)/cadastros/colaboradores/page';
import UsuariosPage from './pages/(app)/cadastros/usuarios/page';
import AtendimentoPage from './pages/(app)/comercial/atendimento/page';
import LeadsPage from './pages/(app)/comercial/leads/page';
import PipelinePage from './pages/(app)/comercial/pipeline/page';
import OrcamentosPage from './pages/(app)/comercial/orcamentos/page';
import VendasPage from './pages/(app)/comercial/vendas/page';
import DevolucoesPage from './pages/(app)/comercial/devolucoes/page';
import EstoqueMovimentacoesPage from './pages/(app)/estoque/movimentacoes/page';
import EstoqueInventarioPage from './pages/(app)/estoque/inventario/page';
import ComprasPedidosPage from './pages/(app)/compras/pedidos/page';
import ComprasCotacoesPage from './pages/(app)/compras/cotacoes/page';
import FiscalNotasPage from './pages/(app)/fiscal/notas/page';
import FiscalImpostosPage from './pages/(app)/fiscal/impostos/page';
import FinanceiroPagarPage from './pages/(app)/financeiro/pagar/page';
import FinanceiroReceberPage from './pages/(app)/financeiro/receber/page';
import FinanceiroFluxoPage from './pages/(app)/financeiro/fluxo/page';
import LogisticaEntregasPage from './pages/(app)/logistica/entregas/page';
import LogisticaRotasPage from './pages/(app)/logistica/rotas/page';
import BiDashboardsPage from './pages/(app)/bi/dashboards/page';
import BiRelatoriosPage from './pages/(app)/bi/relatorios/page';
import SuporteTicketsPage from './pages/(app)/suporte/tickets/page';
import SuporteBasePage from './pages/(app)/suporte/base/page';
import ConfiguracoesPage from './pages/(app)/configuracoes/page';

function App() {
  return (
    <Providers>
      <Routes>
        {/* Rotas Públicas (Autenticação) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rotas Privadas (Protegidas) */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout>
                <Navigate to="/dashboard" replace />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/cadastros/clientes"
          element={
            <PrivateRoute>
              <AppLayout>
                <ClientesPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/cadastros/fornecedores"
          element={
            <PrivateRoute>
              <AppLayout>
                <FornecedoresPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/cadastros/produtos"
          element={
            <PrivateRoute>
              <AppLayout>
                <ProdutosPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/cadastros/parceiros"
          element={
            <PrivateRoute>
              <AppLayout>
                <ParceirosPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/cadastros/colaboradores"
          element={
            <PrivateRoute>
              <AppLayout>
                <ColaboradoresPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/cadastros/usuarios"
          element={
            <PrivateRoute>
              <AppLayout>
                <UsuariosPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/comercial/atendimento"
          element={
            <PrivateRoute>
              <AppLayout>
                <AtendimentoPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/comercial/leads"
          element={
            <PrivateRoute>
              <AppLayout>
                <LeadsPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/comercial/pipeline"
          element={
            <PrivateRoute>
              <AppLayout>
                <PipelinePage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/comercial/orcamentos"
          element={
            <PrivateRoute>
              <AppLayout>
                <OrcamentosPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/comercial/vendas"
          element={
            <PrivateRoute>
              <AppLayout>
                <VendasPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/comercial/devolucoes"
          element={
            <PrivateRoute>
              <AppLayout>
                <DevolucoesPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/estoque/movimentacoes"
          element={
            <PrivateRoute>
              <AppLayout>
                <EstoqueMovimentacoesPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/estoque/inventario"
          element={
            <PrivateRoute>
              <AppLayout>
                <EstoqueInventarioPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/compras/pedidos"
          element={
            <PrivateRoute>
              <AppLayout>
                <ComprasPedidosPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/compras/cotacoes"
          element={
            <PrivateRoute>
              <AppLayout>
                <ComprasCotacoesPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/fiscal/notas"
          element={
            <PrivateRoute>
              <AppLayout>
                <FiscalNotasPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/fiscal/impostos"
          element={
            <PrivateRoute>
              <AppLayout>
                <FiscalImpostosPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/financeiro/pagar"
          element={
            <PrivateRoute>
              <AppLayout>
                <FinanceiroPagarPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/financeiro/receber"
          element={
            <PrivateRoute>
              <AppLayout>
                <FinanceiroReceberPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/financeiro/fluxo"
          element={
            <PrivateRoute>
              <AppLayout>
                <FinanceiroFluxoPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/logistica/entregas"
          element={
            <PrivateRoute>
              <AppLayout>
                <LogisticaEntregasPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/logistica/rotas"
          element={
            <PrivateRoute>
              <AppLayout>
                <LogisticaRotasPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/bi/dashboards"
          element={
            <PrivateRoute>
              <AppLayout>
                <BiDashboardsPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/bi/relatorios"
          element={
            <PrivateRoute>
              <AppLayout>
                <BiRelatoriosPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/suporte/tickets"
          element={
            <PrivateRoute>
              <AppLayout>
                <SuporteTicketsPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/suporte/base"
          element={
            <PrivateRoute>
              <AppLayout>
                <SuporteBasePage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/configuracoes"
          element={
            <PrivateRoute>
              <AppLayout>
                <ConfiguracoesPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Providers>
  );
}

export default App;


