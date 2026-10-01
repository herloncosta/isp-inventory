import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEntryDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  locationId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsUUID()
  @IsOptional()
  supplierId?: string;
}

export class SerialBatchItemDto {
  @IsString()
  @MinLength(1)
  serialNumber: string;

  @IsString()
  @IsOptional()
  macAddress?: string;
}

export class CreateSerialBatchDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  locationId: string;

  @IsUUID()
  @IsOptional()
  supplierId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SerialBatchItemDto)
  items: SerialBatchItemDto[];
}

export class CreateFractionalEntryDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  locationId: string;

  @IsUUID()
  @IsOptional()
  supplierId?: string;

  @IsInt()
  @Min(1)
  packages: number;

  @IsInt()
  @Min(1)
  metersPerPackage: number;
}
