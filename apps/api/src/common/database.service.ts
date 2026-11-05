import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      user: process.env.DATABASE_USER || 'terranova_user',
      password: process.env.DATABASE_PASSWORD || 'terranova_secure_dev_password',
      database: process.env.DATABASE_NAME || 'terranova_db',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async onModuleInit() {
    try {
      const client = await this.pool.connect();
      const res = await client.query('SELECT PostGIS_Version() AS postgis_ver;');
      this.logger.log(`Conexión a PostgreSQL + PostGIS exitosa: ${res.rows[0].postgis_ver}`);
      client.release();
    } catch (err: any) {
      this.logger.warn(`Base de datos PostgreSQL local no alcanzable en inicio: ${err.message}. Operando con soporte de contingencia.`);
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  /**
   * Ejecuta una consulta con aislamiento forzoso de Tenant mediante PostgreSQL RLS
   */
  async queryWithTenant<T extends QueryResultRow = any>(
    organizationId: string,
    sql: string,
    params: any[] = []
  ): Promise<QueryResult<T>> {
    const client: PoolClient = await this.pool.connect();
    try {
      await client.query('BEGIN');
      // Establecer variable de sesión para Row Level Security (RLS)
      await client.query(`SET LOCAL app.current_organization_id = $1`, [organizationId]);
      const result = await client.query<T>(sql, params);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async query<T extends QueryResultRow = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    return this.pool.query<T>(sql, params);
  }
}
