import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';

@Injectable()
export class InfrastructureService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(organizationId: string) {
    const res = await this.db.queryWithTenant(
      organizationId,
      `SELECT 
          id, asset_code, asset_type, status, model_or_brand,
          installation_date, ST_AsGeoJSON(geom) AS geojson, attributes
       FROM infrastructure_assets
       WHERE organization_id = $1
       ORDER BY created_at DESC;`,
      [organizationId]
    );
    return res.rows;
  }
}
