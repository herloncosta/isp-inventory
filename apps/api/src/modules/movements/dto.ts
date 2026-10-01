import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export enum ReturnCondition {
  AVAILABLE = 'AVAILABLE',
  DEFECTIVE = 'DEFECTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export class CreateTransferDto {
  @IsUUID()
  sourceLocationId: string;

  @IsUUID()
  targetLocationId: string;

  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  serialNumbers?: string[];
}

export class CreateIssueDto {
  @IsUUID()
  sourceLocationId: string;

  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @MinLength(1)
  osNumber: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsOptional()
  serialNumbers?: string[];
}

export class CreateReturnDto {
  @IsUUID()
  sourceLocationId: string;

  @IsUUID()
  targetLocationId: string;

  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsEnum(ReturnCondition)
  condition: ReturnCondition;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  serialNumbers?: string[];
}
