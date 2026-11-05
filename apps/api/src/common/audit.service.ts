import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from './database.service';

export interface AuditLogEntry {
  organizationId: string;
  userId?: string;
  action: string;
  entityName: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly db: DatabaseService) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO audit_logs (
            organization_id, user_id, action, entity_name, entity_id,
            old_values, new_values, ip_address, user_agent, created_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW());`,
        [
          entry.organizationId,
          entry.userId || null,
          entry.action,
          entry.entityName,
          entry.entityId,
          entry.oldValues ? JSON.stringify(entry.oldValues) : null,
          entry.newValues ? JSON.stringify(entry.newValues) : null,
          entry.ipAddress || '127.0.0.1',
          entry.userAgent || 'TERRANOVA Core Client',
        ]
      );
      this.logger.log(`[AUDIT] ${entry.action} en ${entry.entityName} (${entry.entityId}) por usuario ${entry.userId || 'ANON'}`);
    } catch (err: any) {
      this.logger.error(`Fallo al registrar log de auditoría: ${err.message}`);
    }
  }

  async getRecentLogs(organizationId: string, limit = 50) {
    const res = await this.db.query(
      `SELECT 
          a.id, a.action, a.entity_name, a.entity_id, a.old_values, 
          a.new_values, a.ip_address, a.created_at,
          u.email AS user_email, u.first_name || ' ' || u.last_name AS user_name
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.organization_id = $1
       ORDER BY a.created_at DESC
       LIMIT $2;`,
      [organizationId, limit]
    );
    return res.rows;
  }
}
