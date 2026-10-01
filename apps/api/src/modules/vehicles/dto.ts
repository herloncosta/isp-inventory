import { IsString, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateVehicleDto {
  @IsString()
  @MinLength(3)
  plate: string;

  @IsString()
  @MinLength(2)
  model: string;
}

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {}
