import { Controller, Get, Post, Query, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DigitalTwinService } from './digital-twin.service';
import { QueryBuildings3dDto, SolarSimulationDto, RunoffSimulationDto } from './dto/digital-twin.dto';

@ApiTags('Gemelo Digital Territorial 3D (Digital Twin)')
@Controller('digital-twin')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class DigitalTwinController {
  constructor(private readonly digitalTwinService: DigitalTwinService) {}

  @Get('buildings')
  @ApiOperation({ summary: 'Obtención de volúmenes 3D y alturas de edificaciones urbanas (LoD1/LoD2)' })
  @ApiResponse({ status: 200, description: 'Modelos tridimensionales con metadatos catastrales' })
  async getBuildings(@Query() query: QueryBuildings3dDto) {
    return this.digitalTwinService.getBuildings3d(query);
  }

  @Post('solar-analysis')
  @ApiOperation({ summary: 'Cálculo de posición astronómica del sol y proyección de sombras' })
  @ApiResponse({ status: 200, description: 'Parámetros de insolación, azimut, altitud y ratio de sombras' })
  async analyzeSolar(@Body() dto: SolarSimulationDto) {
    return this.digitalTwinService.calculateSolarPosition(dto);
  }

  @Post('runoff-simulation')
  @ApiOperation({ summary: 'Simulación de escorrentías pluviales e inundaciones urbanas' })
  @ApiResponse({ status: 200, description: 'Estimación de volumen de inundación y puntos críticos' })
  async simulateRunoff(@Body() dto: RunoffSimulationDto) {
    return this.digitalTwinService.simulateRunoff(dto);
  }
}
