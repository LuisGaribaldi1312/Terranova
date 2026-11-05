import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentStatusDto } from './dto/update-status.dto';

export interface IncidentFilterParams {
  status?: string;
  priority?: string;
  incidentType?: string;
  search?: string;
}

@Injectable()
export class IncidentsService {
  constructor(private readonly db: DatabaseService) {}

  private getSlaHours(priority: string): number {
    switch (priority) {
      case 'Crítica':
      case 'CRITICAL':
        return 4;
      case 'Alta':
      case 'HIGH':
        return 24;
      case 'Media':
      case 'MEDIUM':
        return 72;
      case 'Baja':
      case 'LOW':
      default:
        return 120;
    }
  }

  async findAll(organizationId: string, filters: IncidentFilterParams = {}) {
    let query = `
      SELECT 
        i.id, i.folio, i.title, i.incident_type, i.priority, i.status,
        i.description, i.address_reference, i.street, i.neighborhood,
        i.citizen_name, i.citizen_phone, i.source_channel,
        i.assigned_crew, i.sla_hours, i.sla_deadline,
        (CASE WHEN i.status NOT IN ('RESOLVED', 'CLOSED') AND i.sla_deadline < NOW() THEN TRUE ELSE FALSE END) AS is_sla_breached,
        ST_X(i.geom) AS longitude,
        ST_Y(i.geom) AS latitude,
        i.evidence_photos, i.resolution_photos, i.resolution_notes,
        i.resolved_at, i.created_at
      FROM incidents i
      WHERE i.organization_id = $1
    `;
    const params: any[] = [organizationId];

    if (filters.status) {
      params.push(filters.status);
      query += ` AND i.status = $${params.length}`;
    }

    if (filters.priority) {
      params.push(filters.priority);
      query += ` AND i.priority = $${params.length}`;
    }

    if (filters.incidentType) {
      params.push(filters.incidentType);
      query += ` AND i.incident_type = $${params.length}`;
    }

    if (filters.search) {
      params.push(`%${filters.search}%`);
      query += ` AND (i.folio ILIKE $${params.length} OR i.title ILIKE $${params.length} OR i.street ILIKE $${params.length} OR i.neighborhood ILIKE $${params.length})`;
    }

    query += ` ORDER BY i.created_at DESC;`;

    const res = await this.db.queryWithTenant(organizationId, query, params);
    return res.rows;
  }

  async findOne(organizationId: string, id: string) {
    const incRes = await this.db.queryWithTenant(
      organizationId,
      `SELECT 
          i.id, i.folio, i.title, i.incident_type, i.priority, i.status,
          i.description, i.address_reference, i.street, i.neighborhood,
          i.citizen_name, i.citizen_phone, i.source_channel,
          i.assigned_crew, i.sla_hours, i.sla_deadline,
          (CASE WHEN i.status NOT IN ('RESOLVED', 'CLOSED') AND i.sla_deadline < NOW() THEN TRUE ELSE FALSE END) AS is_sla_breached,
          ST_X(i.geom) AS longitude,
          ST_Y(i.geom) AS latitude,
          i.evidence_photos, i.resolution_photos, i.resolution_notes,
          i.resolved_at, i.created_at
       FROM incidents i
       WHERE i.id = $1 AND i.organization_id = $2;`,
      [id, organizationId]
    );

    if (!incRes.rows[0]) {
      throw new NotFoundException(`Incidencia ${id} no encontrada`);
    }

    // Historial de cambios de estado y comentarios
    const historyRes = await this.db.query(
      `SELECT 
          id, previous_status, new_status, comment, created_at
       FROM incident_updates
       WHERE incident_id = $1
       ORDER BY created_at ASC;`,
      [id]
    );

    return {
      ...incRes.rows[0],
      history: historyRes.rows,
    };
  }

  async create(organizationId: string, dto: CreateIncidentDto) {
    const year = new Date().getFullYear();
    const countRes = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM incidents WHERE organization_id = $1;`,
      [organizationId]
    );
    const nextSeq = (countRes.rows[0]?.total || 0) + 1;
    const folio = `INC-${year}-${String(nextSeq).padStart(6, '0')}`;

    const slaHours = this.getSlaHours(dto.priority);
    const deadline = new Date(Date.now() + slaHours * 3600 * 1000);

    const res = await this.db.queryWithTenant(
      organizationId,
      `INSERT INTO incidents (
          organization_id, folio, title, incident_type, priority, 
          status, description, address_reference, street, neighborhood,
          citizen_name, citizen_phone, source_channel,
          sla_hours, sla_deadline, geom
       ) VALUES (
          $1, $2, $3, $4, $5, 
          'RECEIVED', $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, ST_SetSRID(ST_MakePoint($15, $16), 4326)
       ) RETURNING id, folio, title, status, priority, sla_hours, sla_deadline, created_at;`,
      [
        organizationId,
        folio,
        dto.title,
        dto.incidentType,
        dto.priority,
        dto.description,
        dto.addressReference || '',
        dto.street || 'Vía Pública',
        dto.neighborhood || 'Centro',
        dto.citizenName || 'Ciudadano Anónimo',
        dto.citizenPhone || '',
        dto.sourceChannel || 'PORTAL',
        slaHours,
        deadline.toISOString(),
        dto.longitude,
        dto.latitude,
      ]
    );

    // Registro inicial en historial
    await this.db.query(
      `INSERT INTO incident_updates (
          incident_id, previous_status, new_status, comment
       ) VALUES ($1, NULL, 'RECEIVED', 'Reporte recibido y registrado en mesa de control');`,
      [res.rows[0].id]
    );

    return res.rows[0];
  }

  async updateStatus(organizationId: string, id: string, dto: UpdateIncidentStatusDto) {
    const current = await this.findOne(organizationId, id);

    let query = `
      UPDATE incidents
      SET status = $1,
          updated_at = NOW()
    `;
    const params: any[] = [dto.status, id, organizationId];

    if (dto.assignedCrew) {
      params.push(dto.assignedCrew);
      query += `, assigned_crew = $${params.length}`;
    }

    if (dto.resolutionNotes) {
      params.push(dto.resolutionNotes);
      query += `, resolution_notes = $${params.length}`;
    }

    if (dto.status === 'RESOLVED') {
      query += `, resolved_at = NOW()`;
    }

    query += ` WHERE id = $2 AND organization_id = $3 RETURNING id, folio, status, updated_at;`;

    const res = await this.db.queryWithTenant(organizationId, query, params);

    // Registrar en bitácora de actualizaciones
    await this.db.query(
      `INSERT INTO incident_updates (
          incident_id, previous_status, new_status, comment
       ) VALUES ($1, $2, $3, $4);`,
      [
        id,
        current.status,
        dto.status,
        dto.comment || `Transición de estado a ${dto.status}`,
      ]
    );

    return res.rows[0];
  }

  async getStats(organizationId: string) {
    const res = await this.db.queryWithTenant(
      organizationId,
      `SELECT 
          COUNT(*)::int AS total_incidents,
          COUNT(CASE WHEN status = 'RECEIVED' THEN 1 END)::int AS received_count,
          COUNT(CASE WHEN status IN ('VALIDATED', 'ASSIGNED', 'IN_PROGRESS') THEN 1 END)::int AS in_progress_count,
          COUNT(CASE WHEN status IN ('RESOLVED', 'CLOSED') THEN 1 END)::int AS resolved_count,
          COUNT(CASE WHEN status NOT IN ('RESOLVED', 'CLOSED') AND sla_deadline < NOW() THEN 1 END)::int AS sla_breached_count,
          COUNT(CASE WHEN priority = 'Crítica' OR priority = 'CRITICAL' THEN 1 END)::int AS critical_count,
          COUNT(CASE WHEN priority = 'Alta' OR priority = 'HIGH' THEN 1 END)::int AS high_count,
          COUNT(CASE WHEN priority = 'Media' OR priority = 'MEDIUM' THEN 1 END)::int AS medium_count,
          COUNT(CASE WHEN priority = 'Baja' OR priority = 'LOW' THEN 1 END)::int AS low_count,
          COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) FILTER (WHERE resolved_at IS NOT NULL), 18.5)::numeric AS avg_resolution_hours
       FROM incidents
       WHERE organization_id = $1;`,
      [organizationId]
    );

    const row = res.rows[0] || {};
    const total = Number(row.total_incidents || 0);
    const breached = Number(row.sla_breached_count || 0);
    const slaCompliancePct = total > 0 ? Number((((total - breached) / total) * 100).toFixed(1)) : 100;

    return {
      totalIncidents: total,
      receivedCount: Number(row.received_count || 0),
      inProgressCount: Number(row.in_progress_count || 0),
      resolvedCount: Number(row.resolved_count || 0),
      slaBreachedCount: breached,
      slaCompliancePct,
      criticalCount: Number(row.critical_count || 0),
      avgResolutionHours: Number(Number(row.avg_resolution_hours || 18.5).toFixed(1)),
      byPriority: {
        critical: Number(row.critical_count || 0),
        high: Number(row.high_count || 0),
        medium: Number(row.medium_count || 0),
        low: Number(row.low_count || 0),
      },
    };
  }
}
