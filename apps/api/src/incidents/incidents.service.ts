import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Injectable()
export class IncidentsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(organizationId: string) {
    const res = await this.db.queryWithTenant(
      organizationId,
      `SELECT 
          i.id, i.folio, i.title, i.incident_type, i.priority, i.status,
          i.description, i.address_reference,
          ST_X(i.geom) AS longitude,
          ST_Y(i.geom) AS latitude,
          i.evidence_photos, i.created_at
       FROM incidents i
       WHERE i.organization_id = $1
       ORDER BY i.created_at DESC;`,
      [organizationId]
    );
    return res.rows;
  }

  async findOne(organizationId: string, id: string) {
    const res = await this.db.queryWithTenant(
      organizationId,
      `SELECT 
          i.id, i.folio, i.title, i.incident_type, i.priority, i.status,
          i.description, i.address_reference,
          ST_X(i.geom) AS longitude,
          ST_Y(i.geom) AS latitude,
          i.evidence_photos, i.resolution_photos, i.resolved_at, i.created_at
       FROM incidents i
       WHERE i.id = $1 AND i.organization_id = $2;`,
      [id, organizationId]
    );
    if (!res.rows[0]) {
      throw new NotFoundException(`Incidencia ${id} no encontrada`);
    }
    return res.rows[0];
  }

  async create(organizationId: string, dto: CreateIncidentDto) {
    // Generación de Folio Consecutivo Territorial (Ej: INC-2026-000413)
    const year = new Date().getFullYear();
    const countRes = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM incidents WHERE organization_id = $1;`,
      [organizationId]
    );
    const nextSeq = (countRes.rows[0]?.total || 0) + 1;
    const folio = `INC-${year}-${String(nextSeq).padStart(6, '0')}`;

    const res = await this.db.queryWithTenant(
      organizationId,
      `INSERT INTO incidents (
          organization_id, folio, title, incident_type, priority, 
          status, description, address_reference, geom
       ) VALUES (
          $1, $2, $3, $4, $5, 
          'RECEIVED', $6, $7, 
          ST_SetSRID(ST_MakePoint($8, $9), 4326)
       ) RETURNING id, folio, title, status, priority, created_at;`,
      [
        organizationId,
        folio,
        dto.title,
        dto.incidentType,
        dto.priority,
        dto.description,
        dto.addressReference || '',
        dto.longitude,
        dto.latitude,
      ]
    );

    return res.rows[0];
  }
}
