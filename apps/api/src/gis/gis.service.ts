import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';

@Injectable()
export class GisService {
  constructor(private readonly db: DatabaseService) {}

  async calculateDistance(lng1: number, lat1: number, lng2: number, lat2: number) {
    // Cálculo proyectado oficial en ITRF2008 / Mexico (EPSG:6362)
    const res = await this.db.query(
      `SELECT ST_Distance(
          ST_Transform(ST_SetSRID(ST_MakePoint($1, $2), 4326), 6362),
          ST_Transform(ST_SetSRID(ST_MakePoint($3, $4), 4326), 6362)
       ) AS distance_meters;`,
      [lng1, lat1, lng2, lat2]
    );

    const meters = parseFloat(res.rows[0]?.distance_meters || '0');
    return {
      distanceMeters: Number(meters.toFixed(2)),
      distanceKm: Number((meters / 1000).toFixed(3)),
      crs: 'EPSG:6362 (ITRF2008 / Cónica Conforme de Lambert)',
    };
  }

  async getLayers(organizationId: string) {
    const res = await this.db.queryWithTenant(
      organizationId,
      `SELECT id, name, category, layer_type, style_definition, is_public, z_index 
       FROM map_layers WHERE organization_id = $1 ORDER BY z_index ASC;`,
      [organizationId]
    );
    return res.rows;
  }
}
