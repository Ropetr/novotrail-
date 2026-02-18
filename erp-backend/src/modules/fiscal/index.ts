import { Hono } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { createFiscalRoutes } from './presentation/routes';

/**
 * Creates and configures the Fiscal bounded context module.
 * Contains all Nuvem Fiscal API integration logic:
 * - CNPJ consultation
 * - Company management (CRUD)
 * - Digital certificate management
 * - Fiscal document configuration (CT-e, NF-e, etc.)
 *
 * All routes require authentication (auth middleware applied externally).
 */
export function createFiscalModule() {
  return createFiscalRoutes();
}

// Re-export types for inter-module communication
export type { NuvemFiscalService } from './infrastructure/nuvem-fiscal/service';
export type {
  OAuth2Config,
  ApiResponse,
  Empresa,
  CertificadoDigital,
  ConsultaCNPJResponse,
} from './infrastructure/nuvem-fiscal/types';
