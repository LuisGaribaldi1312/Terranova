import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { RecordMaintenanceDto } from './dto/record-maintenance.dto';

export interface InfrastructureFilterParams {
  networkType?: string;
  status?: string;
  condition?: string;
  search?: string;
}

@Injectable()
export class InfrastructureService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(organizationId: string, filters: InfrastructureFilterParams = {}) {
    let query = `
      SELECT 
        a.id, a.asset_code, a.network_type, a.asset_type, a.status, a.asset_condition,
        a.model_or_brand, a.installation_date, a.cost_installation,
        a.accumulated_maintenance_cost, a.expected_lifespan_years,
        a.last_inspection_at, a.next_maintenance_due,
        a.street, a.neighborhood,
        ST_AsGeoJSON(a.geom) AS geojson,
        ST_Y(ST_Centroid(a.geom)) AS lat,
        ST_X(ST_Centroid(a.geom)) AS lng,
        a.attributes,
        a.created_at
      FROM infrastructure_assets a
      WHERE a.organization_id = $1
    `;
    const params: any[] = [organizationId];

    if (filters.networkType) {
      params.push(filters.networkType);
      query += ` AND a.network_type = $${params.length}`;
    }

    if (filters.status) {
      params.push(filters.status);
      query += ` AND a.status = $${params.length}`;
    }

    if (filters.condition) {
      params.push(filters.condition);
      query += ` AND a.asset_condition = $${params.length}`;
    }

    if (filters.search) {
      params.push(`%${filters.search}%`);
      query += ` AND (a.asset_code ILIKE $${params.length} OR a.asset_type ILIKE $${params.length} OR a.street ILIKE $${params.length} OR a.neighborhood ILIKE $${params.length})`;
    }

    query += ` ORDER BY a.created_at DESC;`;

    const res = await this.db.queryWithTenant(organizationId, query, params);
    return res.rows;
  }

  async findOne(organizationId: string, id: string) {
    const assetRes = await this.db.queryWithTenant(
      organizationId,
      `SELECT 
          a.id, a.asset_code, a.network_type, a.asset_type, a.status, a.asset_condition,
          a.model_or_brand, a.installation_date, a.cost_installation,
          a.accumulated_maintenance_cost, a.expected_lifespan_years,
          a.last_inspection_at, a.next_maintenance_due,
          a.street, a.neighborhood,
          ST_AsGeoJSON(a.geom) AS geojson,
          ST_Y(ST_Centroid(a.geom)) AS lat,
          ST_X(ST_Centroid(a.geom)) AS lng,
          a.attributes,
          a.created_at
       FROM infrastructure_assets a
       WHERE a.id = $1 AND a.organization_id = $2;`,
      [id, organizationId]
    );

    if (!assetRes.rows[0]) {
      throw new NotFoundException(`Activo de infraestructura ${id} no encontrado`);
    }

    // Consulta de bitácora histórica de mantenimiento
    const logsRes = await this.db.queryWithTenant(
      organizationId,
      `SELECT 
          id, work_order_folio, maintenance_type, cost, performed_at, performed_by, notes, status
       FROM asset_maintenance_logs
       WHERE asset_id = $1 AND organization_id = $2
       ORDER BY performed_at DESC;`,
      [id, organizationId]
    );

    const asset = assetRes.rows[0];
    
    // Cálculo de ciclo de vida remanente
    const installDate = asset.installation_date ? new Date(asset.installation_date) : new Date(asset.created_at);
    const ageYears = (new Date().getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const remainingYears = Math.max(0, (asset.expected_lifespan_years || 15) - ageYears);
    const depreciationPct = Math.min(100, (ageYears / (asset.expected_lifespan_years || 15)) * 100);

    return {
      ...asset,
      lifecycle: {
        ageYears: Number(ageYears.toFixed(1)),
        remainingYears: Number(remainingYears.toFixed(1)),
        depreciationPct: Number(depreciationPct.toFixed(1)),
      },
      maintenanceLogs: logsRes.rows,
    };
  }

  async create(organizationId: string, dto: CreateAssetDto) {
    // Validar geometría con PostGIS
    const validityCheck = await this.db.query(
      `SELECT ST_IsValid(ST_SetSRID(ST_GeomFromText($1), 4326)) AS is_valid;`,
      [dto.wktGeometry]
    );

    if (!validityCheck.rows[0]?.is_valid) {
      throw new BadRequestException('La geometría provista no es válida según PostGIS.');
    }

    const nextDueDate = new Date();
    nextDueDate.setMonth(nextDueDate.getMonth() + 6); // Próximo mantenimiento en 6 meses

    const res = await this.db.queryWithTenant(
      organizationId,
      `INSERT INTO infrastructure_assets (
          organization_id, asset_code, network_type, asset_type, status, asset_condition,
          model_or_brand, installation_date, cost_installation, accumulated_maintenance_cost,
          expected_lifespan_years, last_inspection_at, next_maintenance_due,
          street, neighborhood, geom, attributes
       ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, 0.00,
          $10, NOW(), $11,
          $12, $13, ST_SetSRID(ST_GeomFromText($14), 4326), $15
       ) RETURNING id, asset_code, network_type, asset_type, status, asset_condition;`,
      [
        organizationId,
        dto.assetCode,
        dto.networkType,
        dto.assetType,
        dto.status || 'OPERATIONAL',
        dto.assetCondition || 'GOOD',
        dto.modelOrBrand || 'Estándar Municipal',
        dto.installationDate || new Date().toISOString().split('T')[0],
        dto.costInstallation || 0.00,
        dto.expectedLifespanYears || 15,
        nextDueDate.toISOString().split('T')[0],
        dto.street || 'Vía Pública',
        dto.neighborhood || 'Sector Urbano Central',
        dto.wktGeometry,
        JSON.stringify(dto.technicalSpecs || {}),
      ]
    );

    return res.rows[0];
  }

  async recordMaintenance(organizationId: string, assetId: string, dto: RecordMaintenanceDto) {
    // Verificar existencia del activo
    await this.findOne(organizationId, assetId);

    // 1. Insertar orden en bitácora
    const logRes = await this.db.queryWithTenant(
      organizationId,
      `INSERT INTO asset_maintenance_logs (
          organization_id, asset_id, work_order_folio, maintenance_type, cost, performed_by, notes
       ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
       ) RETURNING id, work_order_folio, cost, performed_at;`,
      [
        organizationId,
        assetId,
        dto.workOrderFolio,
        dto.maintenanceType,
        dto.cost,
        dto.performedBy,
        dto.notes,
      ]
    );

    // 2. Actualizar acumulado y estatus del activo
    let updateQuery = `
      UPDATE infrastructure_assets
      SET accumulated_maintenance_cost = accumulated_maintenance_cost + $1,
          last_inspection_at = NOW(),
          status = 'OPERATIONAL'
    `;
    const params: any[] = [dto.cost, assetId, organizationId];

    if (dto.newCondition) {
      params.push(dto.newCondition);
      updateQuery += `, asset_condition = $${params.length}`;
    }

    updateQuery += ` WHERE id = $2 AND organization_id = $3;`;

    await this.db.queryWithTenant(organizationId, updateQuery, params);

    return logRes.rows[0];
  }

  async getStats(organizationId: string) {
    const res = await this.db.queryWithTenant(
      organizationId,
      `SELECT 
          COUNT(*)::int AS total_assets,
          COUNT(CASE WHEN status = 'OPERATIONAL' THEN 1 END)::int AS operational_count,
          COUNT(CASE WHEN status = 'MAINTENANCE' THEN 1 END)::int AS maintenance_count,
          COUNT(CASE WHEN status = 'DAMAGED' OR asset_condition = 'CRITICAL' THEN 1 END)::int AS critical_count,
          COALESCE(SUM(cost_installation), 0)::numeric AS total_capital_value,
          COALESCE(SUM(accumulated_maintenance_cost), 0)::numeric AS total_maintenance_spent,
          COUNT(CASE WHEN network_type = 'AGUA_POTABLE' THEN 1 END)::int AS count_water,
          COUNT(CASE WHEN network_type = 'DRENAJE' THEN 1 END)::int AS count_drainage,
          COUNT(CASE WHEN network_type = 'ALUMBRADO' THEN 1 END)::int AS count_lighting,
          COUNT(CASE WHEN network_type = 'VIALIDAD' THEN 1 END)::int AS count_traffic
       FROM infrastructure_assets
       WHERE organization_id = $1;`,
      [organizationId]
    );

    const row = res.rows[0] || {};
    const total = Number(row.total_assets || 0);
    const operational = Number(row.operational_count || 0);

    return {
      totalAssets: total,
      operationalCount: operational,
      maintenanceCount: Number(row.maintenance_count || 0),
      criticalCount: Number(row.critical_count || 0),
      operationalRatePct: total > 0 ? Number(((operational / total) * 100).toFixed(1)) : 100,
      totalCapitalValue: Number(row.total_capital_value || 0),
      totalMaintenanceSpent: Number(row.total_maintenance_spent || 0),
      byNetwork: {
        water: Number(row.count_water || 0),
        drainage: Number(row.count_drainage || 0),
        lighting: Number(row.count_lighting || 0),
        traffic: Number(row.count_traffic || 0),
      },
    };
  }
}
