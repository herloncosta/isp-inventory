import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { LocationType } from '@isp/shared';

export class CreateLocationDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(LocationType)
  type: LocationType;

  @IsString()
  @IsOptional()
  responsibleUserId?: string;

  @IsString()
  @IsOptional()
  vehicleId?: string;
}

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}
