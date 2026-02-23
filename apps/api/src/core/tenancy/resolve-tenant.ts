import type { Context, Next } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { createDatabaseConnection } from '../../shared/database/connection';
import { TenantRepository } from '../../modules/tenant/infrastructure/tenant-repository';

function getHostname(c: Context<HonoContext>): string | null {
  const hostHeader = c.req.header('host');
  if (hostHeader) {
    return hostHeader.split(':')[0].toLowerCase();
  }

  try {
    return new URL(c.req.url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function extractSubdomain(hostname: string, baseDomain?: string): string | null {
  if (!hostname.includes('.')) {
    return null;
  }

  if (baseDomain) {
    if (!hostname.endsWith(baseDomain)) {
      return null;
    }

    const withoutBase = hostname.slice(0, -(baseDomain.length + 1));
    if (!withoutBase) {
      return null;
    }

    return withoutBase.split('.')[0] || null;
  }

  return hostname.split('.')[0] || null;
}

export async function resolveTenant(c: Context<HonoContext>, next: Next) {
  const db = createDatabaseConnection(c.env.DB);
  const tenantRepository = new TenantRepository(db);

  const hostname = getHostname(c);
  const baseDomain = c.env.BASE_DOMAIN?.toLowerCase();
  const isDev = c.env.ENVIRONMENT === 'development';

  if (!hostname) {
    return c.json({ success: false, error: 'Unable to resolve host' }, 400);
  }

  const devTenantId = isDev ? c.req.header('x-tenant-id') : null;
  if (devTenantId) {
    const tenant = await tenantRepository.findById(devTenantId);
    if (!tenant) {
      return c.json({ success: false, error: 'Tenant not found' }, 404);
    }

    c.set('tenantId', tenant.id);
    c.set('tenant', tenant);
    return next();
  }

  const subdomain = extractSubdomain(hostname, baseDomain);
  if (!subdomain) {
    return c.json({ success: false, error: 'Tenant subdomain is required' }, 400);
  }

  const tenant = await tenantRepository.findBySubdomain(subdomain);
  if (!tenant) {
    return c.json({ success: false, error: 'Tenant not found' }, 404);
  }

  c.set('tenantId', tenant.id);
  c.set('tenant', tenant);
  return next();
}
