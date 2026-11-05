import { Controller, Get, Post, Query, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto, HeatmapQueryDto, ExportReportDto } from './dto/analytics.dto';

@ApiTags('Inteligencia Territorial & BI (Analytics)')
@Controller('analytics')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'Consulta de indicadores clave de desempeño (MTTR, SLA %, UHI)' })
  @ApiResponse({ status: 200, description: 'KPIs estratégicos de comando territorial' })
  async getKpis(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getExecutiveKpis(query);
  }

  @Get('heatmap')
  @ApiOperation({ summary: 'Generación de cuadrícula de calor espacial para mapas de densidad' })
  @ApiResponse({ status: 200, description: 'Celdas espaciales agregadas con peso de intensidad' })
  async getHeatmap(@Query() query: HeatmapQueryDto) {
    return this.analyticsService.getSpatialHeatmap(query);
  }

  @Get('neighborhoods')
  @ApiOperation({ summary: 'Ranking y salud territorial por colonia' })
  @ApiQuery({ name: 'organizationId', required: true })
  async getNeighborhoods(@Query('organizationId') organizationId: string) {
    return this.analyticsService.getNeighborhoodRanking(organizationId);
  }

  @Get('crews')
  @ApiOperation({ summary: 'Métricas de desempeño y eficiencia de cuadrillas' })
  @ApiQuery({ name: 'organizationId', required: true })
  async getCrews(@Query('organizationId') organizationId: string) {
    return this.analyticsService.getCrewPerformance(organizationId);
  }

  @Post('export')
  @ApiOperation({ summary: 'Emisión de reporte ejecutivo certificado con sello SHA-256' })
  @ApiResponse({ status: 200, description: 'Reporte generado listo para descarga o impresión' })
  async exportReport(@Body() dto: ExportReportDto) {
    return this.analyticsService.exportReport(dto);
  }
}
