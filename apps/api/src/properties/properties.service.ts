import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import * as crypto from 'crypto';

export interface PropertyFilterParams {
  search?: string;
  landUse?: string;
  taxStatus?: string;
  propertyRegime?: string;
}

@Injectable()
export class PropertiesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(organizationId: string, filters: PropertyFilterParams = {}) {
    let query = `
      SELECT 
        p.id, p.cadastral_key, p.property_type, p.land_use, p.status, 
        p.property_regime, p.tax_status,
        p.land_area_sqm, p.built_area_sqm, p.levels_count,
        p.land_value_unit_sqm, p.construction_value_unit_sqm,
        p.land_cadastral_value, p.construction_cadastral_value, p.cadastral_value,
        p.annual_property_tax, p.tax_debt_amount,
        p.address_street, p.address_neighborhood, p.address_postal_code,
        p.boundary_north, p.boundary_south, p.boundary_east, p.boundary_west,
        p.cadastral_certificate_folio, p.digital_stamp,
        p.owner_info,
        ST_AsGeoJSON(p.geom) AS geojson,
        ST_Y(ST_Centroid(p.geom)) AS centroid_lat,
        ST_X(ST_Centroid(p.geom)) AS centroid_lng,
        ST_Area(ST_Transform(p.geom, 32614)) AS metric_calculated_area_sqm,
        p.created_at
      FROM properties p
      WHERE p.organization_id = $1 AND p.deleted_at IS NULL
    `;
    const params: any[] = [organizationId];

    if (filters.landUse) {
      params.push(filters.landUse);
      query += ` AND p.land_use = $${params.length}`;
    }

    if (filters.taxStatus) {
      params.push(filters.taxStatus);
      query += ` AND p.tax_status = $${params.length}`;
    }

    if (filters.propertyRegime) {
      params.push(filters.propertyRegime);
      query += ` AND p.property_regime = $${params.length}`;
    }

    if (filters.search) {
      params.push(`%${filters.search}%`);
      query += ` AND (p.cadastral_key ILIKE $${params.length} OR p.address_street ILIKE $${params.length} OR p.address_neighborhood ILIKE $${params.length})`;
    }

    query += ` ORDER BY p.created_at DESC;`;

    const res = await this.db.queryWithTenant(organizationId, query, params);
    return res.rows;
  }

  async findOne(organizationId: string, id: string) {
    const res = await this.db.queryWithTenant(
      organizationId,
      `SELECT 
          p.id, p.cadastral_key, p.property_type, p.land_use, p.status, 
          p.property_regime, p.tax_status,
          p.land_area_sqm, p.built_area_sqm, p.levels_count,
          p.land_value_unit_sqm, p.construction_value_unit_sqm,
          p.land_cadastral_value, p.construction_cadastral_value, p.cadastral_value,
          p.annual_property_tax, p.tax_debt_amount,
          p.address_street, p.address_neighborhood, p.address_postal_code,
          p.boundary_north, p.boundary_south, p.boundary_east, p.boundary_west,
          p.cadastral_certificate_folio, p.cadastral_certificate_issued_at, p.digital_stamp,
          p.owner_info,
          ST_AsGeoJSON(p.geom) AS geojson,
          ST_IsValid(p.geom) AS is_valid_polygon,
          ST_Area(ST_Transform(p.geom, 32614)) AS metric_area_sqm,
          ST_Perimeter(ST_Transform(p.geom, 32614)) AS metric_perimeter_m,
          ST_Y(ST_Centroid(p.geom)) AS centroid_lat,
          ST_X(ST_Centroid(p.geom)) AS centroid_lng
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
    // 1. Validar topología espacial de la geometría antes de persistir
    const validityCheck = await this.db.query(
      `SELECT ST_IsValid(ST_SetSRID(ST_GeomFromText($1), 4326)) AS is_valid;`,
      [dto.wktPolygon]
    );

    if (!validityCheck.rows[0]?.is_valid) {
      throw new BadRequestException('El polígono provisto no es topológicamente válido según PostGIS.');
    }

    // 2. Cálculos de avalúo catastral oficial
    const landValueUnit = dto.landValueUnitSqm || 3000.00;
    const constValueUnit = dto.constructionValueUnitSqm || 5500.00;
    const landVal = dto.landAreaSqm * landValueUnit;
    const constVal = (dto.builtAreaSqm || 0) * constValueUnit;
    const totalVal = landVal + constVal;

    // Impuesto predial anual estimado (alícuota del 0.35% municipal estándar)
    const annualTax = dto.annualPropertyTax || Number((totalVal * 0.0035).toFixed(2));

    // 3. Generación de Cédula y Sello Digital Criptográfico
    const folioRandom = Math.floor(100000 + Math.random() * 900000);
    const folio = `CED-${new Date().getFullYear()}-${folioRandom}`;
    
    const hashPayload = `${organizationId}|${dto.cadastralKey}|${dto.landAreaSqm}|${totalVal}|${new Date().toISOString()}`;
    const digitalStamp = crypto.createHash('sha256').update(hashPayload).digest('hex');

    const ownerInfo = {
      name: dto.ownerName || 'Propietario Registrado',
      rfc: dto.ownerRfc || 'GEN010101000',
      regime: dto.propertyRegime || 'PRIVADA',
      registeredAt: new Date().toISOString(),
    };

    const res = await this.db.queryWithTenant(
      organizationId,
      `INSERT INTO properties (
          organization_id, cadastral_key, property_type, land_use, property_regime,
          land_area_sqm, built_area_sqm, levels_count,
          land_value_unit_sqm, construction_value_unit_sqm,
          land_cadastral_value, construction_cadastral_value, cadastral_value,
          tax_status, annual_property_tax, tax_debt_amount,
          address_street, address_neighborhood, address_postal_code,
          boundary_north, boundary_south, boundary_east, boundary_west,
          cadastral_certificate_folio, cadastral_certificate_issued_at, digital_stamp,
          owner_info, geom
       ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8,
          $9, $10,
          $11, $12, $13,
          $14, $15, $16,
          $17, $18, $19,
          $20, $21, $22, $23,
          $24, NOW(), $25,
          $26, ST_SetSRID(ST_GeomFromText($27), 4326)
       ) RETURNING id, cadastral_key, land_use, property_regime, land_area_sqm, cadastral_value, cadastral_certificate_folio, digital_stamp;`,
      [
        organizationId,
        dto.cadastralKey,
        dto.propertyType,
        dto.landUse,
        dto.propertyRegime || 'PRIVADA',
        dto.landAreaSqm,
        dto.builtAreaSqm || 0,
        dto.levelsCount || 1,
        landValueUnit,
        constValueUnit,
        landVal,
        constVal,
        totalVal,
        dto.taxStatus || 'CURRENT',
        annualTax,
        dto.taxDebtAmount || 0,
        dto.addressStreet || '',
        dto.addressNeighborhood || '',
        dto.addressPostalCode || '',
        dto.boundaryNorth || 'Con predio colindante norte',
        dto.boundarySouth || 'Con vía pública frontal',
        dto.boundaryEast || 'Con predio colindante oriente',
        dto.boundaryWest || 'Con predio colindante poniente',
        folio,
        digitalStamp,
        JSON.stringify(ownerInfo),
        dto.wktPolygon,
      ]
    );

    return res.rows[0];
  }

  async generateCedulaCatastral(organizationId: string, id: string) {
    const prop = await this.findOne(organizationId, id);
    
    // Obtener los vértices de la geometría en coordenadas WGS84 y proyectadas
    const verticesRes = await this.db.query(
      `SELECT 
          (ST_DumpPoints(geom)).path[2] AS vertex_index,
          ST_X((ST_DumpPoints(geom)).geom) AS lng,
          ST_Y((ST_DumpPoints(geom)).geom) AS lat,
          ST_X(ST_Transform((ST_DumpPoints(geom)).geom, 32614)) AS utm_x,
          ST_Y(ST_Transform((ST_DumpPoints(geom)).geom, 32614)) AS utm_y
       FROM properties
       WHERE id = $1;`,
      [id]
    );

    const qrVerificationUrl = `https://terranova-mx.vercel.app/verify/cedula/${prop.cadastral_certificate_folio || prop.cadastral_key}`;

    return {
      institution: 'DIRECCIÓN DE CATASTRO Y GESTIÓN TERRITORIAL',
      documentTitle: 'CÉDULA CATASTRAL OFICIAL ESTATAL Y MUNICIPAL',
      folio: prop.cadastral_certificate_folio || `CED-2026-${prop.id.substring(0, 8)}`,
      issuedAt: prop.cadastral_certificate_issued_at || new Date().toISOString(),
      cadastralKey: prop.cadastral_key,
      propertyRegime: prop.property_regime || 'PRIVADA',
      landUse: prop.land_use,
      propertyType: prop.property_type,
      location: {
        street: prop.address_street,
        neighborhood: prop.address_neighborhood,
        postalCode: prop.address_postal_code,
        centroid: {
          lat: prop.centroid_lat,
          lng: prop.centroid_lng,
        },
      },
      metrics: {
        landAreaSqm: Number(prop.land_area_sqm),
        landAreaHectares: Number((Number(prop.land_area_sqm) / 10000).toFixed(4)),
        builtAreaSqm: Number(prop.built_area_sqm),
        perimeterMeters: Number(prop.metric_perimeter_m || 0),
        levelsCount: prop.levels_count || 1,
      },
      valuation: {
        landUnitValueSqm: Number(prop.land_value_unit_sqm || 0),
        constructionUnitValueSqm: Number(prop.construction_value_unit_sqm || 0),
        landCadastralValue: Number(prop.land_cadastral_value || 0),
        constructionCadastralValue: Number(prop.construction_cadastral_value || 0),
        totalCadastralValue: Number(prop.cadastral_value || 0),
        currency: 'MXN',
      },
      taxStatus: {
        status: prop.tax_status,
        annualPropertyTax: Number(prop.annual_property_tax || 0),
        debtAmount: Number(prop.tax_debt_amount || 0),
      },
      boundaries: {
        north: prop.boundary_north || 'No registrado',
        south: prop.boundary_south || 'No registrado',
        east: prop.boundary_east || 'No registrado',
        west: prop.boundary_west || 'No registrado',
      },
      owner: prop.owner_info,
      cartography: {
        crsOfficial: 'EPSG:6362 (ITRF2008) / EPSG:32614 (UTM 14N)',
        vertices: verticesRes.rows,
        geojson: JSON.parse(prop.geojson),
      },
      security: {
        digitalStamp: prop.digital_stamp,
        qrVerificationUrl,
        authoritySeal: 'SELLO OFICIAL AUTENTICADO POR TERRANOVA OPERATING SYSTEM',
      },
    };
  }

  async getCadastreStats(organizationId: string) {
    const res = await this.db.queryWithTenant(
      organizationId,
      `SELECT 
          COUNT(*)::int AS total_properties,
          COALESCE(SUM(land_area_sqm), 0)::numeric AS total_land_area_sqm,
          COALESCE(SUM(built_area_sqm), 0)::numeric AS total_built_area_sqm,
          COALESCE(SUM(cadastral_value), 0)::numeric AS total_cadastral_value,
          COALESCE(SUM(annual_property_tax), 0)::numeric AS estimated_annual_tax_collection,
          COUNT(CASE WHEN tax_status = 'DELINQUENT' THEN 1 END)::int AS delinquent_properties_count,
          COUNT(CASE WHEN tax_status = 'CURRENT' THEN 1 END)::int AS current_properties_count
       FROM properties
       WHERE organization_id = $1 AND deleted_at IS NULL;`,
      [organizationId]
    );

    const row = res.rows[0] || {};
    return {
      totalProperties: Number(row.total_properties || 0),
      totalLandAreaSqm: Number(row.total_land_area_sqm || 0),
      totalLandAreaHectares: Number((Number(row.total_land_area_sqm || 0) / 10000).toFixed(2)),
      totalBuiltAreaSqm: Number(row.total_built_area_sqm || 0),
      totalCadastralValue: Number(row.total_cadastral_value || 0),
      estimatedAnnualTaxCollection: Number(row.estimated_annual_tax_collection || 0),
      delinquentPropertiesCount: Number(row.delinquent_properties_count || 0),
      currentPropertiesCount: Number(row.current_properties_count || 0),
    };
  }
}
