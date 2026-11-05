/**
 * TERRANOVA — Base de Datos Local IndexedDB con Dexie.js (Fase 12: Offline-First)
 * Almacena operaciones de cuadrilla en campo, incidencias locales, evidencias fotográficas
 * y colas de sincronización transaccional con garantía de idempotencia.
 */

import Dexie, { Table } from 'dexie';

export interface LocalSyncOperation {
  id?: number;
  clientOperationId: string; // UUID v4 único generado en dispositivo
  organizationId: string;
  userId?: string;
  entityType: 'incidents' | 'inspections' | 'properties' | 'assets';
  operationType: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: any;
  clientTimestamp: string;   // ISO UTC de captura en campo
  status: 'PENDING' | 'UPLOADING' | 'CONFIRMED' | 'CONFLICT' | 'FAILED';
  retryCount: number;
  lastError?: string;
}

export interface LocalIncident {
  id: string; // UUID local o folio asignado
  folio?: string;
  title: string;
  description: string;
  incidentType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  coordinates: [number, number]; // [lng, lat] WGS84
  neighborhood: string;
  address: string;
  photoUrl?: string;
  photoBlob?: string; // Data URL Base64 o Blob local
  clientOperationId: string;
  isSynced: boolean;
  createdAt: string;
}

export interface LocalInspection {
  id: string;
  permitId?: string;
  cadastralKey?: string;
  inspectorName: string;
  notes: string;
  result: 'APPROVED' | 'OBSERVED' | 'REJECTED';
  coordinates: [number, number];
  photos: string[];
  clientOperationId: string;
  isSynced: boolean;
  createdAt: string;
}

export interface CachedCatalog {
  key: string;
  data: any;
  updatedAt: string;
}

export class TerranovaOfflineDB extends Dexie {
  syncQueue!: Table<LocalSyncOperation, number>;
  localIncidents!: Table<LocalIncident, string>;
  localInspections!: Table<LocalInspection, string>;
  cachedCatalogs!: Table<CachedCatalog, string>;

  constructor() {
    super('TerranovaOfflineDB');
    this.version(1).stores({
      syncQueue: '++id, clientOperationId, entityType, status, clientTimestamp',
      localIncidents: 'id, folio, status, isSynced, createdAt',
      localInspections: 'id, permitId, status, isSynced',
      cachedCatalogs: 'key, updatedAt',
    });
  }

  /**
   * Encola una operación en la cola transaccional
   */
  async enqueueOperation(op: Omit<LocalSyncOperation, 'id' | 'status' | 'retryCount'>): Promise<number> {
    return await this.syncQueue.add({
      ...op,
      status: 'PENDING',
      retryCount: 0,
    });
  }

  /**
   * Obtiene todas las operaciones pendientes de sincronización
   */
  async getPendingOperations(): Promise<LocalSyncOperation[]> {
    return await this.syncQueue
      .where('status')
      .equals('PENDING')
      .sortBy('clientTimestamp');
  }

  /**
   * Actualiza el estado de operaciones en la cola
   */
  async updateOperationStatus(
    clientOperationIds: string[],
    status: LocalSyncOperation['status'],
    lastError?: string
  ): Promise<void> {
    const ops = await this.syncQueue
      .where('clientOperationId')
      .anyOf(clientOperationIds)
      .toArray();

    for (const op of ops) {
      if (op.id) {
        await this.syncQueue.update(op.id, {
          status,
          retryCount: status === 'FAILED' ? op.retryCount + 1 : op.retryCount,
          lastError,
        });
      }
    }
  }

  /**
   * Marca incidencias locales como sincronizadas una vez que el servidor las confirma
   */
  async markIncidentsAsSynced(clientOperationIds: string[]): Promise<void> {
    const incidents = await this.localIncidents
      .where('clientOperationId')
      .anyOf(clientOperationIds)
      .toArray();

    for (const inc of incidents) {
      await this.localIncidents.update(inc.id, { isSynced: true });
    }
  }

  /**
   * Purga operaciones confirmadas para optimizar el almacenamiento local
   */
  async purgeConfirmedOperations(): Promise<number> {
    const confirmed = await this.syncQueue
      .where('status')
      .equals('CONFIRMED')
      .toArray();

    const ids = confirmed.map((c) => c.id!).filter(Boolean);
    await this.syncQueue.bulkDelete(ids);
    return ids.length;
  }
}

// Instancia única (Singleton) para toda la aplicación PWA
export const offlineDB = new TerranovaOfflineDB();
