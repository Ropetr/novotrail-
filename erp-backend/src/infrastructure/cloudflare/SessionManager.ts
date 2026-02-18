import { DurableObject } from 'cloudflare:workers';

export interface SessionData {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
  createdAt: number;
  lastAccessedAt: number;
  expiresAt: number;
}

export class SessionManager extends DurableObject {
  async createSession(sessionId: string, data: Omit<SessionData, 'createdAt' | 'lastAccessedAt' | 'expiresAt'>): Promise<SessionData> {
    const now = Date.now();
    const sessionData: SessionData = {
      ...data,
      createdAt: now,
      lastAccessedAt: now,
      expiresAt: now + 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    await this.ctx.storage.put(sessionId, sessionData);

    // Set an alarm to clean up expired session
    await this.ctx.storage.setAlarm(sessionData.expiresAt);

    return sessionData;
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const session = await this.ctx.storage.get<SessionData>(sessionId);

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      await this.ctx.storage.delete(sessionId);
      return null;
    }

    // Update last accessed time
    session.lastAccessedAt = Date.now();
    await this.ctx.storage.put(sessionId, session);

    return session;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.ctx.storage.delete(sessionId);
  }

  async extendSession(sessionId: string, extraTime: number = 7 * 24 * 60 * 60 * 1000): Promise<SessionData | null> {
    const session = await this.ctx.storage.get<SessionData>(sessionId);

    if (!session) {
      return null;
    }

    session.expiresAt = Date.now() + extraTime;
    session.lastAccessedAt = Date.now();

    await this.ctx.storage.put(sessionId, session);
    await this.ctx.storage.setAlarm(session.expiresAt);

    return session;
  }

  async alarm() {
    // Clean up expired sessions
    const sessions = await this.ctx.storage.list<SessionData>();
    const now = Date.now();

    for (const [key, session] of sessions) {
      if (session.expiresAt < now) {
        await this.ctx.storage.delete(key);
      }
    }
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    switch (request.method) {
      case 'POST': {
        const data = await request.json<Omit<SessionData, 'createdAt' | 'lastAccessedAt' | 'expiresAt'>>();
        const session = await this.createSession(sessionId, data);
        return new Response(JSON.stringify(session), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      case 'GET': {
        const session = await this.getSession(sessionId);
        if (!session) {
          return new Response(JSON.stringify({ error: 'Session not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify(session), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      case 'DELETE': {
        await this.deleteSession(sessionId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      case 'PUT': {
        const session = await this.extendSession(sessionId);
        if (!session) {
          return new Response(JSON.stringify({ error: 'Session not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify(session), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response('Method not allowed', { status: 405 });
    }
  }
}
