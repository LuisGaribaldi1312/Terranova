import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { TerritoriesModule } from './territories/territories.module';
import { PropertiesModule } from './properties/properties.module';
import { IncidentsModule } from './incidents/incidents.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { ProjectsModule } from './projects/projects.module';
import { SyncModule } from './sync/sync.module';
import { GisModule } from './gis/gis.module';
import { CitizenModule } from './citizen/citizen.module';
import { PermitsModule } from './permits/permits.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AiModule } from './ai/ai.module';
import { DigitalTwinModule } from './digital-twin/digital-twin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    CommonModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    TerritoriesModule,
    PropertiesModule,
    IncidentsModule,
    InfrastructureModule,
    ProjectsModule,
    SyncModule,
    GisModule,
    CitizenModule,
    PermitsModule,
    AnalyticsModule,
    AiModule,
    DigitalTwinModule,
  ],
})
export class AppModule {}
