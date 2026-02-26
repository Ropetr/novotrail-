import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IFinancialTitleRepository, IFinancialLogRepository } from '../../../domain/repositories';
import { ok, fail } from '../../../../../shared/http/response';

export class AttachmentController {
  constructor(
    private titleRepo: IFinancialTitleRepository,
    private logRepo: IFinancialLogRepository,
  ) {}

  async upload(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');

      const title = await this.titleRepo.getById(id, user.tenantId);
      if (!title) return fail(c, 'Title not found', 404);

      const formData = await c.req.formData();
      const file = formData.get('file') as File | null;
      if (!file) return fail(c, 'File is required', 400);

      // Validate file type and size
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        return fail(c, 'Invalid file type. Allowed: pdf, jpg, png', 400);
      }
      if (file.size > 5 * 1024 * 1024) {
        return fail(c, 'File too large. Max 5MB', 400);
      }

      // Upload to R2
      const storage = c.env.STORAGE;
      const key = `financeiro/anexos/${user.tenantId}/${id}/${file.name}`;
      const arrayBuffer = await file.arrayBuffer();
      await storage.put(key, arrayBuffer, {
        httpMetadata: { contentType: file.type },
        customMetadata: { tenantId: user.tenantId, titleId: id, originalName: file.name },
      });

      // Update title with attachment URL
      await this.titleRepo.update(id, user.tenantId, { attachmentUrl: key } as any);
      await this.logRepo.create(user.tenantId, user.id, 'financial_title', id, 'update', `Attachment uploaded: ${file.name}`);

      return ok(c, {
        message: 'Attachment uploaded',
        fileName: file.name,
        size: file.size,
        key,
      }, 201);
    } catch (error: any) {
      return fail(c, error.message, 500);
    }
  }

  async download(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');

      const title = await this.titleRepo.getById(id, user.tenantId);
      if (!title) return fail(c, 'Title not found', 404);
      if (!title.attachmentUrl) return fail(c, 'No attachment found', 404);

      const storage = c.env.STORAGE;
      const object = await storage.get(title.attachmentUrl);
      if (!object) return fail(c, 'Attachment file not found in storage', 404);

      const headers = new Headers();
      headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
      headers.set('Content-Disposition', `attachment; filename="${title.attachmentUrl.split('/').pop()}"`);

      return new Response(object.body as any, { headers });
    } catch (error: any) {
      return fail(c, error.message, 500);
    }
  }
}
