import { Controller, Post, Get, Body, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ChatMessageDto } from './dto/ai.dto';

@ApiTags('Inteligencia Artificial Territorial (TERRANOVA AI)')
@Controller('ai')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Consulta conversacional geoespacial con GeoAgentes y Tool Calling controlado' })
  @ApiResponse({ status: 200, description: 'Respuesta estructurada del agente con citas oficiales y acciones' })
  async chat(@Body() dto: ChatMessageDto) {
    return this.aiService.processQuery(dto);
  }

  @Get('agents')
  @ApiOperation({ summary: 'Catálogo de GeoAgentes especializados activos en la plataforma' })
  async getAgents() {
    return this.aiService.getAvailableAgents();
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Sugerencias de consultas frecuentes por contexto territorial' })
  @ApiQuery({ name: 'organizationId', required: true })
  async getSuggestions(@Query('organizationId') _organizationId: string) {
    return [
      { agent: 'INCIDENT_AGENT', text: '¿Cuáles colonias presentan mayor retraso en atención de baches este mes?' },
      { agent: 'URBAN_AGENT', text: 'Verifica la compatibilidad de COS y CUS para un predio de 350 m² en zona H3.' },
      { agent: 'PROJECT_AGENT', text: 'Dame el estatus de amortización y avance de Curva S del contrato COP-PUE-2026-003.' },
      { agent: 'INFRA_AGENT', text: '¿Qué tramos de tubería de agua potable en el Centro Histórico tienen vida útil menor al 25%?' },
      { agent: 'GEO_AGENT', text: 'Verifica los parámetros de proyección EPSG:6362 y colindancias del Marco Geoestadístico INEGI.' },
    ];
  }
}
