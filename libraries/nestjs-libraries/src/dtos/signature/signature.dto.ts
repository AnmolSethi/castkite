import {
  IsBoolean,
  IsDefined,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class SignatureDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @IsString()
  @IsDefined()
  content: string;

  @IsBoolean()
  @IsDefined()
  autoAdd: boolean;
}
