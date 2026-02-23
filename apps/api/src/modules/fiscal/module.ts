import { Hono } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { createFiscalRoutes } from './presentation/http/routes';

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
