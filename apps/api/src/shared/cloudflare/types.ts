export interface CloudflareBindings {
  DB: D1Database;
  CACHE: KVNamespace;
  SESSION_MANAGER: DurableObjectNamespace;
  ANALYTICS: AnalyticsEngineDataset;
  FILES: R2Bucket;
  TASK_QUEUE: Queue;
}

export interface CloudflareEnv extends CloudflareBindings {
  ENVIRONMENT: string;
  JWT_SECRET: string;
  BASE_DOMAIN?: string;
}

export interface HonoContext {
  Bindings: CloudflareEnv;
  Variables: {
    user?: {
      id: string;
      tenantId: string;
      email: string;
      role: string;
    };
    tenantId?: string;
    tenant?: {
      id: string;
      name: string;
      subdomain: string;
      status: string;
      plan: string;
    };
  };
}
