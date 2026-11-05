import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async findByEmail(email: string) {
    const res = await this.db.query(
      `SELECT 
          u.id, u.email, u.password_hash, u.first_name, u.last_name, 
          u.job_title, u.phone, u.mfa_enabled, u.mfa_secret, u.is_active,
          om.organization_id, om.role_id, r.slug AS role_slug, r.name AS role_name,
          o.code AS organization_code, o.trade_name AS organization_name
       FROM users u
       LEFT JOIN organization_members om ON u.id = om.user_id AND om.is_active = TRUE
       LEFT JOIN roles r ON om.role_id = r.id
       LEFT JOIN organizations o ON om.organization_id = o.id
       WHERE LOWER(u.email) = LOWER($1) AND u.is_active = TRUE;`,
      [email]
    );
    return res.rows[0] || null;
  }

  async findById(id: string) {
    const res = await this.db.query(
      `SELECT 
          u.id, u.email, u.first_name, u.last_name, u.job_title, 
          u.phone, u.mfa_enabled, u.is_active, u.created_at,
          om.organization_id, r.slug AS role_slug, r.name AS role_name,
          o.code AS organization_code, o.trade_name AS organization_name
       FROM users u
       LEFT JOIN organization_members om ON u.id = om.user_id
       LEFT JOIN roles r ON om.role_id = r.id
       LEFT JOIN organizations o ON om.organization_id = o.id
       WHERE u.id = $1;`,
      [id]
    );
    if (!res.rows[0]) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
    return res.rows[0];
  }

  async findAllByOrganization(organizationId: string) {
    const res = await this.db.query(
      `SELECT 
          u.id, u.email, u.first_name, u.last_name, u.job_title, 
          u.phone, u.mfa_enabled, u.is_active, u.created_at,
          r.slug AS role_slug, r.name AS role_name,
          d.name AS department_name
       FROM users u
       INNER JOIN organization_members om ON u.id = om.user_id
       LEFT JOIN roles r ON om.role_id = r.id
       LEFT JOIN departments d ON om.department_id = d.id
       WHERE om.organization_id = $1
       ORDER BY u.first_name ASC;`,
      [organizationId]
    );
    return res.rows;
  }

  async assignRole(userId: string, organizationId: string, roleSlug: string, departmentId?: string) {
    // Buscar rol por slug
    const roleRes = await this.db.query(
      `SELECT id FROM roles WHERE slug = $1 LIMIT 1;`,
      [roleSlug]
    );
    if (!roleRes.rows[0]) {
      throw new NotFoundException(`Rol con slug '${roleSlug}' no encontrado`);
    }
    const roleId = roleRes.rows[0].id;

    // Asignar o actualizar membresía
    const res = await this.db.query(
      `INSERT INTO organization_members (organization_id, user_id, role_id, department_id, is_active)
       VALUES ($1, $2, $3, $4, TRUE)
       ON CONFLICT (organization_id, user_id) 
       DO UPDATE SET role_id = EXCLUDED.role_id, department_id = EXCLUDED.department_id, is_active = TRUE
       RETURNING *;`,
      [organizationId, userId, roleId, departmentId || null]
    );

    return res.rows[0];
  }

  async updateMfa(userId: string, secret: string, enabled: boolean) {
    await this.db.query(
      `UPDATE users SET mfa_secret = $1, mfa_enabled = $2, updated_at = NOW() WHERE id = $3;`,
      [secret, enabled, userId]
    );
  }
}
