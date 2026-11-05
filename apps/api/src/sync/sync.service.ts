import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';
import { SyncBatchDto } from './dto/sync-batch.dto';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private readonly db: DatabaseService) {}

  async processSyncBatch(organizationId: string, userId: string, dto: SyncBatchDto) {
    const applied: string[] = [];
    const conflicts: Array<{ clientOperationId: string; reason: string }> = [];

    for (const op of dto.operations) {
      try {
        // Verificar idempotencia: si clientOperationId ya existe para esta org, omitir inserción duplicada
        const existing = await this.db.query(
          `SELECT id, sync_status FROM sync_operations 
           WHERE organization_id = $1 AND client_operation_id = $2;`,
          [organizationId, op.clientOperationId]
        );

        if (existing.rows.length > 0) {
          // Ya fue procesada previamente: confirmar al cliente sin duplicar
          applied.push(op.clientOperationId);
          continue;
        }

        // Registrar operación en la bitácora de sincronización
        await this.db.queryWithTenant(
          organizationId,
          `INSERT INTO sync_operations (
              organization_id, user_id, client_operation_id, entity_type, 
              operation_type, payload, client_timestamp, sync_status
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'APPLIED');`,
          [
            organizationId,
            userId,
            op.clientOperationId,
            op.entityType,
            op.operationType,
            JSON.stringify(op.payload),
            op.clientTimestamp,
          ]
        );

        applied.push(op.clientOperationId);
      } catch (err: any) {
        this.logger.error(`Error procesando operación ${op.clientOperationId}: ${err.message}`);
        conflicts.push({ clientOperationId: op.clientOperationId, reason: err.message });
      }
    }

    return {
      status: 'ok',
      syncedCount: applied.length,
      applied,
      conflicts,
      serverTime: new Date().toISOString(),
    };
  }

  async getCatalogsForOffline(organizationId: string) {
    // Retorna los catálogos mínimos que la PWA necesita almacenar en IndexedDB
    const depts = await this.db.query(
      `SELECT id, name, code FROM departments WHERE organization_id = $1;`,
      [organizationId]
    );

    return {
      organizationId,
      incidentTypes: ['Bache', 'Fuga de Agua', 'Alumbrado', 'Basura', 'Señalización'],
      priorities: ['Baja', 'Media', 'Alta', 'Crítica'],
      departments: depts.rows,
      cachedAt: new Date().toISOString(),
    };
  }
}
