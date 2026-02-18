export const ENTITY_STATUS = {
  ACTIVE: 'active' as const,
  INACTIVE: 'inactive' as const,
  BLOCKED: 'blocked' as const,
};

export const TENANT_STATUS = {
  ACTIVE: 'active' as const,
  SUSPENDED: 'suspended' as const,
  CANCELLED: 'cancelled' as const,
};

export const USER_ROLES = {
  ADMIN: 'admin' as const,
  MANAGER: 'manager' as const,
  USER: 'user' as const,
};

export const QUOTE_STATUS = {
  DRAFT: 'draft' as const,
  SENT: 'sent' as const,
  APPROVED: 'approved' as const,
  REJECTED: 'rejected' as const,
  EXPIRED: 'expired' as const,
};

export const SALE_STATUS = {
  PENDING: 'pending' as const,
  CONFIRMED: 'confirmed' as const,
  INVOICED: 'invoiced' as const,
  CANCELLED: 'cancelled' as const,
};

export const RETURN_STATUS = {
  PENDING: 'pending' as const,
  APPROVED: 'approved' as const,
  REJECTED: 'rejected' as const,
  COMPLETED: 'completed' as const,
};

export const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  blocked: 'Bloqueado',
  suspended: 'Suspenso',
  cancelled: 'Cancelado',
  draft: 'Rascunho',
  sent: 'Enviado',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  expired: 'Expirado',
  pending: 'Pendente',
  confirmed: 'Confirmado',
  invoiced: 'Faturado',
  completed: 'Concluído',
};
