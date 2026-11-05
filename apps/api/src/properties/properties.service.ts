import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';
import { CreatePropertyDto } from './dto/create-property.dto';

@Injectable()
export class PropertiesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(organizationId: string) {
    const res = await this.db.queryWithTenant(
      organizationId,
      `SELECT 
          p.id, p.cadastral_key, p.property_type, p.land_use, p.status, 
          p.land_area_sqm, p.built_area_sqm, p.cadastral_value, 
          p.address_street, p.address_neighborhood,
          ST_AsGeoJSON(p.geom) AS geojson,
          ST_Area(ST_Transform(p.geom, 32614)) AS metric_calculated_area_sqm,
          p.created_at
       FROM properties p
       WHERE p.organization_id = $1 AND p.deleted_at IS NULL
       ORDER BY p.created_at DESC;`,
      [organizationId]
    );
    return res.rows;
  }

  async findOne(organizationId: string, id: string) {
    const res = await this.db.queryWithTenant(
      organizationId,
      `SELECT 
          p.id, p.cadastral_key, p.property_type, p.land_use, p.status, 
          p.land_area_sqm, p.built_area_sqm, p.cadastral_value, 
          p.address_street, p.address_neighborhood, p.levels_count,
          ST_AsGeoJSON(p.geom) AS geojson,
          ST_IsValid(p.geom) AS is_valid_polygon,
          ST_Area(ST_Transform(p.geom, 32614)) AS metric_area_sqm
       FROM properties p
       WHERE p.id = $1 AND p.organization_id = $2 AND p.deleted_at IS NULL;`,
      [id, organizationId]
    );
    if (!res.rows[0]) {
      throw new NotFoundException(`Predio ${id} no encontrado en la organización`);
    }
    return res.rows[0];
  }

  async create(organizationId: string, dto: CreatePropertyDto) {
    // Validar topología espacial de la geometría antes de persistir
    const validityCheck = await this.db.query(
      `SELECT ST_IsValid(ST_SetSRID(ST_GeomFromText($1), 4326)) AS is_valid;`,
      [dto.wktPolygon]
    );

    if (!validityCheck.rows[0]?.is_valid) {
      throw new BadRequestException('El polígono provisto no es topológicamente válido según PostGIS.');
    }

    const res = await this.db.queryWithTenant(
      organizationId,
      `INSERT INTO properties (
          organization_id, cadastral_key, property_type, land_use, 
          land_area_sqm, built_area_sqm, cadastral_value, address_street, geom
       ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, 
          ST_SetSRID(ST_GeomFromText($9), 4326)
       ) RETURNING id, cadastral_key, land_use, land_area_sqm, cadastral_value;`,
      [
        organizationId,
        dto.cadastralKey,
        dto.propertyType,
        dto.landUse,
        dto.landAreaSqm,
        dto.builtAreaSqm || 0,
        dto.cadastralValue || 0,
        dto.addressStreet || '',
        dto.wktPolygon,
      ]
    );

    return res.rows[0];
  }
}
