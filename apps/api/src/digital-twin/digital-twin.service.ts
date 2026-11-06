import { Injectable, Logger } from '@nestjs/common';
import { QueryBuildings3dDto, SolarSimulationDto, RunoffSimulationDto } from './dto/digital-twin.dto';

export interface Building3dModel {
  id: string;
  cadastralKey: string;
  name: string;
  zoningCode: string;
  levelsCount: number;
  heightMeters: number;
  groundElevationMeters: number;
  footprintAreaM2: number;
  totalConstructionM2: number;
  lodLevel: 'LoD1' | 'LoD2';
  colorHex: string;
  coordinates: [number, number]; // Centroid [lng, lat]
  vertices2d: Array<[number, number]>; // Polígono de desplante
}

export interface SolarPositionResult {
  timeOfDayHours: number;
  dayOfYear: number;
  latitude: number;
  solarAltitudeDegrees: number; // Elevación sobre el horizonte (0° a 90°)
  solarAzimuthDegrees: number;  // Orientación en brújula (0° Norte, 90° Este, 180° Sur, 270° Oeste)
  shadowLengthRatio: number;    // Longitud de sombra / Altura del edificio
  shadowDirectionAngle: number; // Dirección en que se proyecta la sombra
  insolationLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

@Injectable()
export class DigitalTwinService {
  private readonly logger = new Logger(DigitalTwinService.name);

  /**
   * 1. Consulta de Volúmenes 3D de Edificaciones Urbanas (LoD1 / LoD2)
   */
  async getBuildings3d(dto: QueryBuildings3dDto): Promise<{ total: number; lod: string; buildings: Building3dModel[] }> {
    this.logger.log(`Obteniendo volúmenes 3D para org: ${dto.organizationId}, LoD: ${dto.lod || 'LoD1'}`);

    const baseBuildings: Building3dModel[] = [
      {
        id: 'BLD-PUE-001',
        cadastralKey: '21-114-01-0045-0012-000-00',
        name: 'Torre Residencial Juárez 2104',
        zoningCode: 'H3-UNIFAMILIAR',
        levelsCount: 4,
        heightMeters: 14.5,
        groundElevationMeters: 2154.2,
        footprintAreaM2: 220.0,
        totalConstructionM2: 610.0,
        lodLevel: 'LoD1',
        colorHex: '#38bdf8', // Sky blue
        coordinates: [-98.2063, 19.0414],
        vertices2d: [
          [-98.2065, 19.0412],
          [-98.2061, 19.0412],
          [-98.2061, 19.0416],
          [-98.2065, 19.0416],
        ],
      },
      {
        id: 'BLD-PUE-002',
        cadastralKey: '21-114-01-0045-0013-000-00',
        name: 'Corporativo Reforma Plaza',
        zoningCode: 'C2-COMERCIAL',
        levelsCount: 8,
        heightMeters: 28.0,
        groundElevationMeters: 2153.8,
        footprintAreaM2: 450.0,
        totalConstructionM2: 3200.0,
        lodLevel: 'LoD1',
        colorHex: '#10b981', // Emerald green
        coordinates: [-98.2052, 19.042],
        vertices2d: [
          [-98.2055, 19.0418],
          [-98.2049, 19.0418],
          [-98.2049, 19.0423],
          [-98.2055, 19.0423],
        ],
      },
      {
        id: 'BLD-PUE-003',
        cadastralKey: '21-114-01-0046-0004-000-00',
        name: 'Hospital San José IMSS (Ala Norte)',
        zoningCode: 'EQ-EQUIPAMIENTO',
        levelsCount: 6,
        heightMeters: 22.5,
        groundElevationMeters: 2156.0,
        footprintAreaM2: 850.0,
        totalConstructionM2: 4800.0,
        lodLevel: 'LoD1',
        colorHex: '#f59e0b', // Amber
        coordinates: [-98.2078, 19.0435],
        vertices2d: [
          [-98.2082, 19.0431],
          [-98.2073, 19.0431],
          [-98.2073, 19.0439],
          [-98.2082, 19.0439],
        ],
      },
      {
        id: 'BLD-PUE-004',
        cadastralKey: '21-114-01-0047-0008-000-00',
        name: 'Edificio Departamental La Paz',
        zoningCode: 'H4-PLURIFAMILIAR',
        levelsCount: 5,
        heightMeters: 17.0,
        groundElevationMeters: 2162.4,
        footprintAreaM2: 320.0,
        totalConstructionM2: 1540.0,
        lodLevel: 'LoD1',
        colorHex: '#8b5cf6', // Violet
        coordinates: [-98.2088, 19.0402],
        vertices2d: [
          [-98.2091, 19.0399],
          [-98.2085, 19.0399],
          [-98.2085, 19.0405],
          [-98.2091, 19.0405],
        ],
      },
      {
        id: 'BLD-PUE-005',
        cadastralKey: '21-114-01-0048-0002-000-00',
        name: 'Palacio Municipal / Portal Hidalgo',
        zoningCode: 'HIST-PATRIMONIAL',
        levelsCount: 2,
        heightMeters: 9.8,
        groundElevationMeters: 2151.0,
        footprintAreaM2: 1100.0,
        totalConstructionM2: 2150.0,
        lodLevel: 'LoD1',
        colorHex: '#e11d48', // Rose red
        coordinates: [-98.2038, 19.0428],
        vertices2d: [
          [-98.2043, 19.0424],
          [-98.2033, 19.0424],
          [-98.2033, 19.0432],
          [-98.2043, 19.0432],
        ],
      },
    ];

    return {
      total: baseBuildings.length,
      lod: dto.lod || 'LoD1',
      buildings: baseBuildings,
    };
  }

  /**
   * 2. Cálculo Astronómico de Posición Solar y Proyección de Sombras
   * Basado en la declinación solar, hora del día y latitud municipal de Puebla (19.04° N)
   */
  calculateSolarPosition(dto: SolarSimulationDto): SolarPositionResult {
    const { timeOfDayHours, dayOfYear = 172, latitude = 19.0414 } = dto;

    // 1. Declinación solar (δ) en radianes según el día del año
    const declinationRad = 23.45 * (Math.PI / 180) * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 81));

    // 2. Ángulo horario (H) en radianes: 15° por hora respecto al mediodía solar (12:00h)
    const hourAngleDeg = (timeOfDayHours - 12.0) * 15.0;
    const hourAngleRad = hourAngleDeg * (Math.PI / 180);

    const latRad = latitude * (Math.PI / 180);

    // 3. Elevación solar / Altura (α): sen(α) = sen(φ)*sen(δ) + cos(φ)*cos(δ)*cos(H)
    const sinAltitude =
      Math.sin(latRad) * Math.sin(declinationRad) +
      Math.cos(latRad) * Math.cos(declinationRad) * Math.cos(hourAngleRad);

    const solarAltitudeRad = Math.asin(Math.max(-1, Math.min(1, sinAltitude)));
    const solarAltitudeDeg = Math.max(0, solarAltitudeRad * (180 / Math.PI));

    // 4. Azimut solar (A): cos(A) = (sen(α)*sen(φ) - sen(δ)) / (cos(α)*cos(φ))
    let azimuthDeg = 180.0;
    if (solarAltitudeDeg > 0.1) {
      const cosAzimuth =
        (Math.sin(solarAltitudeRad) * Math.sin(latRad) - Math.sin(declinationRad)) /
        (Math.cos(solarAltitudeRad) * Math.cos(latRad));
      const clampedCos = Math.max(-1, Math.min(1, cosAzimuth));
      const rawAzimuth = Math.acos(clampedCos) * (180 / Math.PI);
      azimuthDeg = hourAngleDeg > 0 ? 360 - rawAzimuth : rawAzimuth;
    }

    // 5. Longitud de sombra: L = H / tan(α)
    const shadowRatio = solarAltitudeDeg > 3.0 ? Number((1 / Math.tan(solarAltitudeRad)).toFixed(2)) : 15.0;

    // La sombra se proyecta en dirección opuesta al sol (+180°)
    const shadowDirectionAngle = (azimuthDeg + 180) % 360;

    let insolationLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
    if (solarAltitudeDeg > 45) insolationLevel = 'HIGH';
    else if (solarAltitudeDeg < 15) insolationLevel = 'LOW';

    return {
      timeOfDayHours,
      dayOfYear,
      latitude,
      solarAltitudeDegrees: Number(solarAltitudeDeg.toFixed(1)),
      solarAzimuthDegrees: Number(azimuthDeg.toFixed(1)),
      shadowLengthRatio: shadowRatio,
      shadowDirectionAngle: Number(shadowDirectionAngle.toFixed(1)),
      insolationLevel,
    };
  }

  /**
   * 3. Simulación de Escorrentías Pluviales e Inundaciones Urbanas
   */
  async simulateRunoff(dto: RunoffSimulationDto) {
    const { rainfallIntensityMmH, durationMinutes = 60 } = dto;
    this.logger.log(`Simulando escorrentía con precipitación de ${rainfallIntensityMmH} mm/h`);

    // Puntos críticos de encharcamiento en cotas bajas de Puebla
    const criticalPonds = [
      { location: 'Depresión Vial Av. 11 Sur & Circuito Juan Pablo II', elevationMeters: 2148.5, maxDepthMeters: 0.65, risk: 'HIGH' },
      { location: 'Paso a Desnivel Boulevard 5 de Mayo & 43 Oriente', elevationMeters: 2147.2, maxDepthMeters: 0.95, risk: 'CRITICAL' },
      { location: 'Bajo Puente Calzada Zaragoza (Diagonal Defensores)', elevationMeters: 2150.1, maxDepthMeters: 0.42, risk: 'MEDIUM' },
    ];

    const runoffVolumeM3 = (rainfallIntensityMmH * (durationMinutes / 60) * 12.5 * 1000).toFixed(0);

    return {
      rainfallIntensityMmH,
      durationMinutes,
      accumulatedVolumeM3: Number(runoffVolumeM3),
      criticalPondsCount: criticalPonds.length,
      vulnerableZones: criticalPonds,
      drainageSystemLoadPct: Math.min(100, Number((rainfallIntensityMmH * 1.6).toFixed(1))),
    };
  }
}
