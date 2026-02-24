import { Hono } from 'hono';
import type { HonoContext } from '../../../../shared/cloudflare/types';
import type { TenantSettingsController } from './controllers/tenant-settings-controller';

export function createConfiguracoesRoutes() {
  const router = new Hono<HonoContext>();
  const getCtrl = (c: any) => c.get('settingsController') as TenantSettingsController;

  // Dados da Empresa
  router.get('/empresa', (c) => getCtrl(c).get(c));
  router.put('/empresa', (c) => getCtrl(c).update(c));

  // Logo
  router.get('/empresa/logo', (c) => getCtrl(c).serveLogo(c));
  router.post('/empresa/logo', (c) => getCtrl(c).uploadLogo(c));
  router.delete('/empresa/logo', (c) => getCtrl(c).deleteLogo(c));

  return router;
}
