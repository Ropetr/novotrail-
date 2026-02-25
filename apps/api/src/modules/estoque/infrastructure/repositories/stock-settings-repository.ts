import { eq } from 'drizzle-orm';
import type { IStockSettingsRepository } from '../../domain/repositories';
import type { StockSettings, UpdateStockSettingsDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { stockSettings } from '../schema';

export class StockSettingsRepository implements IStockSettingsRepository {
  constructor(private db: DatabaseConnection) {}

  async get(tenantId: string): Promise<StockSettings> {
    const result = await this.db.select().from(stockSettings)
      .where(eq(stockSettings.tenantId, tenantId))
      .limit(1);

    if (result[0]) return result[0] as unknown as StockSettings;

    // Criar configurações padrão se não existir
    const created = await this.db.insert(stockSettings).values({
      tenantId,
      costMethod: 'average',
      allowNegativeStock: false,
      autoGenerateMovements: true,
      lowStockAlertEnabled: true,
    }).returning();

    return created[0] as unknown as StockSettings;
  }

  async update(tenantId: string, data: UpdateStockSettingsDTO): Promise<StockSettings> {
    // Garantir que existe
    await this.get(tenantId);

    const result = await this.db.update(stockSettings)
      .set(data as any)
      .where(eq(stockSettings.tenantId, tenantId))
      .returning();

    return result[0] as unknown as StockSettings;
  }
}
