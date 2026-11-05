import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SyncOperationItemDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6', description: 'UUID generado offline' })
  @IsNotEmpty()
  @IsString()
  clientOperationId: string;

  @ApiProperty({ example: 'incidents', enum: ['incidents', 'inspections', 'properties'] })
  @IsNotEmpty()
  @IsString()
  entityType: string;

  @ApiProperty({ example: 'INSERT', enum: ['INSERT', 'UPDATE', 'DELETE'] })
  @IsNotEmpty()
  @IsString()
  operationType: string;

  @ApiProperty({ description: 'Carga útil de la operación en formato JSON' })
  @IsNotEmpty()
  payload: any;

  @ApiProperty({ example: '2026-11-05T12:00:00Z', description: 'Marca de tiempo en dispositivo móvil' })
  @IsNotEmpty()
  @IsString()
  clientTimestamp: string;
}

export class SyncBatchDto {
  @ApiProperty({ type: [SyncOperationItemDto], description: 'Lote de mutaciones capturadas sin internet' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncOperationItemDto)
  operations: SyncOperationItemDto[];
}
