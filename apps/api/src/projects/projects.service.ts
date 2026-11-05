import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(organizationId: string) {
    const res = await this.db.queryWithTenant(
      organizationId,
      `SELECT 
          id, code, name, project_type, status, budget_allocated, 
          budget_exercised, contractor_name, progress_percentage,
          start_date, scheduled_end_date, ST_AsGeoJSON(geom) AS geojson
       FROM projects
       WHERE organization_id = $1
       ORDER BY created_at DESC;`,
      [organizationId]
    );
    return res.rows;
  }
}
