export interface CloudflareBindings {
  HYPERDRIVE: Hyperdrive;
  CACHE: KVNamespace;
  SESSIONS: KVNamespace;
  NUVEM_FISCAL_CACHE: KVNamespace;
  SESSION_MANAGER: DurableObjectNamespace;
  ANALYTICS: AnalyticsEngineDataset;
  STORAGE: R2Bucket;
  CERTIFICATES: R2Bucket;
  IMAGES: R2Bucket;
  TASK_QUEUE: Queue;
}

export interface CloudflareEnv extends CloudflareBindings {
  ENVIRONMENT: string;
  JWT_SECRET: string;
  BASE_DOMAIN?: string;
  NUVEM_FISCAL_CLIENT_ID: string;
  NUVEM_FISCAL_CLIENT_SECRET: string;
  NUVEM_FISCAL_API_URL: string;
  NUVEM_FISCAL_TOKEN_URL: string;
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
