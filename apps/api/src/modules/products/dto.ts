import { IsEnum, IsInt, IsString, Min, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ProductCategory, Technology, Unit } from '@isp/shared';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  sku: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsEnum(Technology)
  technology: Technology;

  @IsEnum(Unit)
  unit: Unit;

  @IsInt()
  @Min(0)
  minStock: number;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
