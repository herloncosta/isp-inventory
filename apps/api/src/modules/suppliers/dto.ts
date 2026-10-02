import { IsString, Matches, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateSupplierDto {
  /**
   * MinLength(14) aceitava qualquer catorze letras. Agora é CNPJ mesmo — mas
   * pontuação entra livre e some na gravação, porque é assim que a base já
   * guarda (`12.345.678/0001-90`) e é assim que a pessoa digita.
   */
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value))
  @Matches(/^\d{14}$/, { message: 'CNPJ deve ter exatamente 14 dígitos' })
  cnpj: string;

  @IsString()
  @MinLength(2)
  razaoSocial: string;

  @IsString()
  @MinLength(2)
  contato: string;
}

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}
