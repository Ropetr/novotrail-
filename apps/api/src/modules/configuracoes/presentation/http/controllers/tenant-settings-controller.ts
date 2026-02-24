import type { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { ITenantSettingsRepository } from '../../../domain/repositories';
import { ok, fail } from '../../../../../shared/http/response';

export class TenantSettingsController {
  constructor(private settingsRepo: ITenantSettingsRepository) {}

  /**
   * GET /configuracoes/empresa
   * Busca os dados da empresa do tenant logado
   */
  async get(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const settings = await this.settingsRepo.getByTenantId(user.tenantId);

      // Se não existir, retorna objeto vazio (empresa ainda não configurou)
      return ok(c, settings || { tenantId: user.tenantId });
    } catch (error: any) {
      return fail(c, error.message || 'Erro ao buscar configurações', 500);
    }
  }

  /**
   * PUT /configuracoes/empresa
   * Salva/atualiza os dados da empresa
   */
  async update(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();

      // Remover campos que não devem ser atualizados pelo usuário
      delete body.id;
      delete body.tenantId;
      delete body.createdAt;
      delete body.updatedAt;
      // Logo é atualizada via endpoint separado (upload)
      delete body.logoUrl;
      delete body.logoFiscalUrl;

      const settings = await this.settingsRepo.upsert(user.tenantId, body);

      return ok(c, settings);
    } catch (error: any) {
      return fail(c, error.message || 'Erro ao salvar configurações', 400);
    }
  }

  /**
   * POST /configuracoes/empresa/logo
   * Upload de logo (recebe multipart/form-data)
   * Campo: "logo" ou "logoFiscal"
   */
  async uploadLogo(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const formData = await c.req.formData();

      const logoFile = formData.get('logo') as File | null;
      const logoFiscalFile = formData.get('logoFiscal') as File | null;

      const file = logoFile || logoFiscalFile;
      if (!file) {
        return fail(c, 'Nenhum arquivo enviado. Use campo "logo" ou "logoFiscal"', 400);
      }

      // Validar tipo
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        return fail(c, 'Tipo de arquivo não permitido. Use PNG, JPG, WebP ou SVG.', 400);
      }

      // Validar tamanho (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        return fail(c, 'Arquivo muito grande. Máximo 2MB.', 400);
      }

      // Nome do arquivo no R2
      const field = logoFile ? 'logoUrl' : 'logoFiscalUrl';
      const ext = file.name.split('.').pop() || 'png';
      const r2Key = `tenants/${user.tenantId}/logos/${field === 'logoUrl' ? 'logo' : 'logo-fiscal'}.${ext}`;

      // Upload para R2
      const bucket = c.env.STORAGE;
      if (!bucket) {
        return fail(c, 'Storage R2 não configurado', 500);
      }

      const arrayBuffer = await file.arrayBuffer();
      await bucket.put(r2Key, arrayBuffer, {
        httpMetadata: { contentType: file.type },
      });

      // Construir URL pública (depende da config do R2)
      const logoUrl = r2Key; // Será resolvido quando servir

      // Salvar URL no banco
      await this.settingsRepo.updateLogoUrl(user.tenantId, field, logoUrl);

      return ok(c, {
        field,
        key: r2Key,
        size: file.size,
        type: file.type,
        message: 'Logo enviada com sucesso',
      }, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Erro ao enviar logo', 500);
    }
  }

  /**
   * DELETE /configuracoes/empresa/logo
   * Remove a logo
   * Query param: ?type=logo ou ?type=logoFiscal
   */
  async deleteLogo(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const type = c.req.query('type') || 'logo';

      const field = type === 'logoFiscal' ? 'logoFiscalUrl' : 'logoUrl';

      // Buscar URL atual para apagar do R2
      const settings = await this.settingsRepo.getByTenantId(user.tenantId);
      const currentUrl = settings?.[field];

      if (currentUrl) {
        const bucket = c.env.STORAGE;
        if (bucket) {
          await bucket.delete(currentUrl);
        }
      }

      // Limpar no banco
      await this.settingsRepo.updateLogoUrl(user.tenantId, field, null);

      return ok(c, { message: 'Logo removida com sucesso' });
    } catch (error: any) {
      return fail(c, error.message || 'Erro ao remover logo', 500);
    }
  }

  /**
   * GET /configuracoes/empresa/logo
   * Servir a logo do R2
   * Query param: ?type=logo ou ?type=logoFiscal
   */
  async serveLogo(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const type = c.req.query('type') || 'logo';

      const field = type === 'logoFiscal' ? 'logoFiscalUrl' : 'logoUrl';
      const settings = await this.settingsRepo.getByTenantId(user.tenantId);
      const r2Key = settings?.[field];

      if (!r2Key) {
        return fail(c, 'Logo não encontrada', 404);
      }

      const bucket = c.env.STORAGE;
      if (!bucket) {
        return fail(c, 'Storage R2 não configurado', 500);
      }

      const object = await bucket.get(r2Key);
      if (!object) {
        return fail(c, 'Arquivo não encontrado no storage', 404);
      }

      const headers = new Headers();
      headers.set('Content-Type', object.httpMetadata?.contentType || 'image/png');
      headers.set('Cache-Control', 'public, max-age=86400'); // Cache 24h

      return new Response(object.body, { headers });
    } catch (error: any) {
      return fail(c, error.message || 'Erro ao buscar logo', 500);
    }
  }
}
