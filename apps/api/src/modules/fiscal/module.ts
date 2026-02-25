import { Hono } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { createFiscalRoutes } from './presentation/http/routes';
import { createDFeInboxRoutes } from './presentation/http/dfe-inbox-routes';
import { createEmissaoRoutes } from './presentation/http/emissao-routes';
import { createGnreRoutes } from './presentation/http/gnre-routes';
import { createAdrcstRoutes } from './presentation/http/adrcst-routes';

// Controllers
import { DFeInboxController } from './presentation/http/dfe-inbox-controller';
import { EmissaoController } from './presentation/http/emissao-controller';
import { GnreController } from './presentation/http/gnre-controller';
import { AdrcstController } from './presentation/http/adrcst-controller';

// Services
import { FiscalAuditService } from './application/services/fiscal-audit';
import { FiscalValidator } from './application/services/fiscal-validator';
import { FiscalConfigService } from './application/services/fiscal-config-service';
import { ProductMatchingService } from './application/services/product-matching';
import { RetryService } from './application/services/retry-service';

// Application
import { NFeCollector } from './application/collectors/nfe-collector';
import { PipelineProcessor } from './application/pipeline/pipeline-processor';
import { EmissaoService } from './application/emissao/emissao-service';
import { GnreService } from './application/gnre/gnre-service';
import { AdrcstService } from './application/adrcst/adrcst-service';

// Infrastructure
import { NuvemFiscalService } from './infrastructure/nuvem-fiscal/service';

/**
 * Creates and configures the Fiscal bounded context module.
 *
 * Submódulos:
 * - /fiscal/nuvem-fiscal  → API Nuvem Fiscal (CNPJ, empresas, certificados, configurações)
 * - /fiscal/inbox         → DF-e Inbox (captura, manifestação, matching, lançamento)
 * - /fiscal/emissao       → Emissão de NF-e, NFS-e, CT-e via Nuvem Fiscal
 * - /fiscal/gnre          → Geração de guias GNRE (ICMS-ST, DIFAL, FECP)
 * - /fiscal/adrcst        → Gerador de ADRC-ST conforme Manual v1.6 SEFAZ-PR
 *
 * All routes require authentication (auth middleware applied externally).
 */
export function createFiscalModule() {
  const app = new Hono();

  // ============================================
  // Rotas originais da Nuvem Fiscal (CNPJ, empresas, certificados)
  // ============================================
  app.route('/nuvem-fiscal', createFiscalRoutes());

  // ============================================
  // Os submódulos abaixo requerem injeção de dependências
  // que são resolvidas no middleware de contexto.
  // Usamos um middleware que inicializa os serviços por request.
  // ============================================
  app.use('/*', async (c, next) => {
    const db = c.get('db');
    if (!db) {
      return c.json({ error: 'Database connection not available' }, 500);
    }

    // Inicializar serviços
    const auditService = new FiscalAuditService(db);
    const validator = new FiscalValidator();
    const configService = new FiscalConfigService(db);
    const matchingService = new ProductMatchingService(db);

    // Inicializar Nuvem Fiscal Service
    const nuvemFiscalConfig = {
      client_id: c.env?.NUVEM_FISCAL_CLIENT_ID || '',
      client_secret: c.env?.NUVEM_FISCAL_CLIENT_SECRET || '',
      token_url: 'https://auth.nuvemfiscal.com.br/oauth/token',
      api_url: 'https://api.nuvemfiscal.com.br',
    };
    const nuvemFiscalService = new NuvemFiscalService(nuvemFiscalConfig);

    // Inicializar application services
    const nfeCollector = new NFeCollector(db, nuvemFiscalService, auditService, matchingService);
    const pipelineProcessor = new PipelineProcessor(db, matchingService, auditService);
    const emissaoService = new EmissaoService(db, nuvemFiscalService, auditService, validator);
    const gnreService = new GnreService(db, auditService);
    const adrcstService = new AdrcstService(db, auditService);

    // Injetar no contexto
    c.set('fiscalServices', {
      auditService,
      validator,
      configService,
      matchingService,
      nfeCollector,
      pipelineProcessor,
      emissaoService,
      gnreService,
      adrcstService,
    });

    await next();
  });

  // DF-e Inbox
  app.route('/inbox', new Hono().all('/*', async (c) => {
    const services = c.get('fiscalServices') as any;
    const controller = new DFeInboxController(
      c.get('db'),
      services.nfeCollector,
      services.pipelineProcessor,
      services.matchingService,
      services.auditService,
      services.configService
    );
    const routes = createDFeInboxRoutes(controller);
    return routes.fetch(c.req.raw, c.env);
  }));

  // Emissão
  app.route('/emissao', new Hono().all('/*', async (c) => {
    const services = c.get('fiscalServices') as any;
    const controller = new EmissaoController(services.emissaoService, services.configService);
    const routes = createEmissaoRoutes(controller);
    return routes.fetch(c.req.raw, c.env);
  }));

  // GNRE
  app.route('/gnre', new Hono().all('/*', async (c) => {
    const services = c.get('fiscalServices') as any;
    const controller = new GnreController(services.gnreService);
    const routes = createGnreRoutes(controller);
    return routes.fetch(c.req.raw, c.env);
  }));

  // ADRC-ST
  app.route('/adrcst', new Hono().all('/*', async (c) => {
    const services = c.get('fiscalServices') as any;
    const controller = new AdrcstController(c.get('db'), services.adrcstService);
    const routes = createAdrcstRoutes(controller);
    return routes.fetch(c.req.raw, c.env);
  }));

  return app;
}

// Re-export types for inter-module communication
export type { NFeCollector } from './application/collectors/nfe-collector';
export type { EmissaoService } from './application/emissao/emissao-service';
export type { GnreService } from './application/gnre/gnre-service';
export type { AdrcstService } from './application/adrcst/adrcst-service';
