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
import OrcamentosPage from './pages/(app)/comercial/orcamentos/page';
import VendasPage from './pages/(app)/comercial/vendas/page';
import DevolucoesPage from './pages/(app)/comercial/devolucoes/page';

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
      </Routes>
    </Providers>
  );
}

export default App;
