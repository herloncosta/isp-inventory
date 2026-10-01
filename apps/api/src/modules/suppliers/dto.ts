import { IsString, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateSupplierDto {
  @IsString()
  @MinLength(14)
  cnpj: string;

  @IsString()
  @MinLength(2)
  razaoSocial: string;

  @IsString()
  @MinLength(2)
  contato: string;
}

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}
