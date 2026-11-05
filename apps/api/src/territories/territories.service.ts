import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';

@Injectable()
export class TerritoriesService {
  constructor(private readonly db: DatabaseService) {}

  async getMexicanStates() {
    // 32 Entidades Federativas Oficiales de los Estados Unidos Mexicanos (INEGI)
    return [
      { cve_ent: '01', name: 'Aguascalientes' },
      { cve_ent: '02', name: 'Baja California' },
      { cve_ent: '03', name: 'Baja California Sur' },
      { cve_ent: '04', name: 'Campeche' },
      { cve_ent: '05', name: 'Coahuila de Zaragoza' },
      { cve_ent: '06', name: 'Colima' },
      { cve_ent: '07', name: 'Chiapas' },
      { cve_ent: '08', name: 'Chihuahua' },
      { cve_ent: '09', name: 'Ciudad de México' },
      { cve_ent: '10', name: 'Durango' },
      { cve_ent: '11', name: 'Guanajuato' },
      { cve_ent: '12', name: 'Guerrero' },
      { cve_ent: '13', name: 'Hidalgo' },
      { cve_ent: '14', name: 'Jalisco' },
      { cve_ent: '15', name: 'México' },
      { cve_ent: '16', name: 'Michoacán de Ocampo' },
      { cve_ent: '17', name: 'Morelos' },
      { cve_ent: '18', name: 'Nayarit' },
      { cve_ent: '19', name: 'Nuevo León' },
      { cve_ent: '20', name: 'Oaxaca' },
      { cve_ent: '21', name: 'Puebla' },
      { cve_ent: '22', name: 'Querétaro' },
      { cve_ent: '23', name: 'Quintana Roo' },
      { cve_ent: '24', name: 'San Luis Potosí' },
      { cve_ent: '25', name: 'Sinaloa' },
      { cve_ent: '26', name: 'Sonora' },
      { cve_ent: '27', name: 'Tabasco' },
      { cve_ent: '28', name: 'Tamaulipas' },
      { cve_ent: '29', name: 'Tlaxcala' },
      { cve_ent: '30', name: 'Veracruz de Ignacio de la Llave' },
      { cve_ent: '31', name: 'Yucatán' },
      { cve_ent: '32', name: 'Zacatecas' },
    ];
  }

  async getMunicipalitiesByState(cveEnt: string) {
    const res = await this.db.query(
      `SELECT id, name, cve_geo, cve_ent, cve_mun, ST_AsGeoJSON(geom) AS geojson 
       FROM territories 
       WHERE cve_ent = $1 AND territory_type = 'MUNICIPALITY' 
       ORDER BY name ASC;`,
      [cveEnt]
    );
    return res.rows;
  }

  async getNeighborhoods(organizationId: string) {
    const res = await this.db.queryWithTenant(
      organizationId,
      `SELECT id, name, cve_geo, postal_code, ST_AsGeoJSON(geom) AS geojson 
       FROM territories 
       WHERE organization_id = $1 AND territory_type = 'COLONIA' 
       ORDER BY name ASC;`,
      [organizationId]
    );
    return res.rows;
  }
}
