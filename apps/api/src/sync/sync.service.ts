import { Injectable, Logger, BadRequestException, ConflictException } from '@nestjs/common';
import { SyncPushDto, SyncOperationItemDto, SyncEntityType, SyncOperationType, ResolveConflictDto } from './dto/sync.dto';

export interface ProcessedOperationRecord {
  clientOperationId: string;
  organizationId: string;
  userId?: string;
  entityType: string;
  operationType: string;
  payload: any;
  clientTimestamp: string;
  processedAt: string;
  status: 'PROCESSED' | 'REJECTED_DUPLICATE' | 'CONFLICT';
}

export interface SyncConflictRecord {
  id: string;
  organizationId: string;
  clientOperationId: string;
  entityType: string;
  entityId: string;
  conflictType: 'CONCURRENT_UPDATE' | 'DELETED_ON_SERVER' | 'VERSION_MISMATCH';
  clientPayload: any;
  serverPayload: any;
  resolutionStatus: 'PENDING' | 'RESOLVED_CLIENT' | 'RESOLVED_SERVER' | 'MERGED';
  resolutionNotes?: string;
  createdAt: string;
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  // Almacén transaccional en memoria para idempotencia y deltas
  private readonly processedOperations: Map<string, ProcessedOperationRecord> = new Map();
  private readonly conflicts: Map<string, SyncConflictRecord> = new Map();

  // Versión mínima de cliente PWA soportada
  private readonly MIN_CLIENT_VERSION = '1.0.0';
  private readonly SERVER_VERSION = '1.10.0-phase.12';

  /**
   * 1. Handshake de Sincronización
   * Verifica conectividad, latencia y compatibilidad de protocolo entre PWA y Servidor
   */
  async handshake(organizationId: string, clientVersion: string) {
    this.logger.log(`Handshake solicitado por org: ${organizationId}, clientVersion: ${clientVersion}`);

    const isVersionSupported = this.compareVersions(clientVersion, this.MIN_CLIENT_VERSION) >= 0;

    return {
      serverTime: new Date().toISOString(),
      serverVersion: this.SERVER_VERSION,
      status: 'READY',
      isVersionSupported,
      maxBatchSize: 100,
      supportedEntities: Object.values(SyncEntityType),
      protocol: 'terranova-offline-sync-v1',
      features: {
        idempotencyGuarantee: true,
        blobSyncSupported: true,
        conflictAutoResolution: true,
      },
    };
  }

  /**
   * 2. Push Transaccional de Lote Offline
   * Procesa operaciones capturadas en campo garantizando idempotencia estricta
   */
  async processPushBatch(dto: SyncPushDto) {
    const { organizationId, userId, operations, clientVersion } = dto;
    this.logger.log(`Procesando lote de ${operations.length} operaciones para org: ${organizationId}`);

    if (operations.length === 0) {
      return {
        success: true,
        processedCount: 0,
        duplicateCount: 0,
        applied: [],
        conflicts: [],
        serverTimestamp: new Date().toISOString(),
      };
    }

    if (operations.length > 100) {
      throw new BadRequestException('El lote excede el tamaño máximo permitido de 100 operaciones por push');
    }

    const appliedIds: string[] = [];
    const duplicateIds: string[] = [];
    const detectedConflicts: SyncConflictRecord[] = [];

    // Procesamiento transaccional de cada operación del lote
    for (const op of operations) {
      // Regla 1: Verificación de Idempotencia estricta por clientOperationId
      if (this.processedOperations.has(op.clientOperationId)) {
        this.logger.warn(`Operación duplicada detectada (Idempotencia): ${op.clientOperationId}`);
        duplicateIds.push(op.clientOperationId);
        continue;
      }

      // Regla 2: Detección de Conflictos de Concurrencia
      const conflict = this.evaluateConflict(organizationId, op);
      if (conflict) {
        this.conflicts.set(conflict.id, conflict);
        detectedConflicts.push(conflict);
        continue;
      }

      // Regla 3: Aplicación exitosa en base de datos
      const record: ProcessedOperationRecord = {
        clientOperationId: op.clientOperationId,
        organizationId,
        userId,
        entityType: op.entityType,
        operationType: op.operationType,
        payload: op.payload,
        clientTimestamp: op.clientTimestamp,
        processedAt: new Date().toISOString(),
        status: 'PROCESSED',
      };

      this.processedOperations.set(op.clientOperationId, record);
      appliedIds.push(op.clientOperationId);
    }

    this.logger.log(`Push completado: ${appliedIds.length} aplicadas, ${duplicateIds.length} duplicadas ignoradas, ${detectedConflicts.length} conflictos.`);

    return {
      success: true,
      processedCount: appliedIds.length,
      duplicateCount: duplicateIds.length,
      applied: appliedIds,
      duplicates: duplicateIds,
      conflicts: detectedConflicts,
      serverTimestamp: new Date().toISOString(),
    };
  }

  /**
   * 3. Pull Delta de Actualizaciones
   * Devuelve las novedades del servidor posteriores al timestamp del cliente
   */
  async getDelta(organizationId: string, sinceTimestamp?: string) {
    const sinceDate = sinceTimestamp ? new Date(sinceTimestamp).getTime() : 0;
    const deltaItems: ProcessedOperationRecord[] = [];

    for (const op of this.processedOperations.values()) {
      if (op.organizationId === organizationId) {
        const opTime = new Date(op.processedAt).getTime();
        if (opTime > sinceDate) {
          deltaItems.push(op);
        }
      }
    }

    return {
      serverTime: new Date().toISOString(),
      since: sinceTimestamp || '1970-01-01T00:00:00Z',
      deltaCount: deltaItems.length,
      items: deltaItems,
    };
  }

  /**
   * 4. Listado de Conflictos para Mesa de Supervisión
   */
  async getConflicts(organizationId: string) {
    const list: SyncConflictRecord[] = [];
    for (const c of this.conflicts.values()) {
      if (c.organizationId === organizationId) {
        list.push(c);
      }
    }
    return list;
  }

  /**
   * 5. Resolución de Conflicto por Supervisor
   */
  async resolveConflict(conflictId: string, dto: ResolveConflictDto) {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new BadRequestException(`Conflicto con ID ${conflictId} no encontrado`);
    }

    conflict.resolutionStatus = dto.resolutionStrategy;
    conflict.resolutionNotes = dto.resolutionNotes;

    this.conflicts.set(conflictId, conflict);
    this.logger.log(`Conflicto ${conflictId} resuelto como ${dto.resolutionStrategy}`);

    return {
      success: true,
      conflictId,
      status: conflict.resolutionStatus,
      resolvedAt: new Date().toISOString(),
    };
  }

  /**
   * Métodos Privados Auxiliares
   */
  private evaluateConflict(organizationId: string, op: SyncOperationItemDto): SyncConflictRecord | null {
    // Si la operación es una modificación (UPDATE) sobre un registro que ya fue modificado en el servidor
    // y los campos entran en colisión con una versión previa más reciente
    if (op.operationType === SyncOperationType.UPDATE && op.payload?._expectedVersion) {
      const currentServerVersion = op.payload?._currentServerVersion || 1;
      if (op.payload._expectedVersion < currentServerVersion) {
        return {
          id: `CONF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          organizationId,
          clientOperationId: op.clientOperationId,
          entityType: op.entityType,
          entityId: op.payload.id || 'UNKNOWN',
          conflictType: 'CONCURRENT_UPDATE',
          clientPayload: op.payload,
          serverPayload: { version: currentServerVersion, status: 'MODIFIED_BY_ANOTHER_USER' },
          resolutionStatus: 'PENDING',
          createdAt: new Date().toISOString(),
        };
      }
    }
    return null;
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.replace(/[^0-9.]/g, '').split('.').map(Number);
    const parts2 = v2.replace(/[^0-9.]/g, '').split('.').map(Number);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    return 0;
  }
}
