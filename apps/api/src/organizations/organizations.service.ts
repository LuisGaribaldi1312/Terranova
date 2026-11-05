import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    const res = await this.db.query(
      `SELECT id, code, legal_name, trade_name, tenant_type, cve_ent, cve_mun, subscription_plan, settings, is_active, created_at 
       FROM organizations WHERE deleted_at IS NULL ORDER BY created_at DESC;`
    );
    return res.rows;
  }

  async findOne(id: string) {
    const res = await this.db.query(
      `SELECT id, code, legal_name, trade_name, tenant_type, cve_ent, cve_mun, subscription_plan, settings, is_active 
       FROM organizations WHERE id = $1 AND deleted_at IS NULL;`,
      [id]
    );
    if (!res.rows[0]) {
      throw new NotFoundException(`Organización ${id} no encontrada`);
    }
    return res.rows[0];
  }

  async create(dto: CreateOrganizationDto) {
    const res = await this.db.query(
      `INSERT INTO organizations (code, legal_name, trade_name, tenant_type, cve_ent, cve_mun)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *;`,
      [dto.code, dto.legalName, dto.tradeName, dto.tenantType, dto.cveEnt, dto.cveMun]
    );
    return res.rows[0];
  }
}
