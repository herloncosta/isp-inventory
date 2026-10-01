import { IsOptional, IsString, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateTechnicianDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(1)
  userId: string;

  @IsString()
  @IsOptional()
  vehicleId?: string;
}

export class UpdateTechnicianDto extends PartialType(CreateTechnicianDto) {}
