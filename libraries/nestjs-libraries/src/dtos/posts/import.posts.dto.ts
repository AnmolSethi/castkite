import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsDefined,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ImportPostRow {
  @IsDefined()
  @IsString()
  integrationId: string;

  @IsDefined()
  @IsDateString()
  date: string;

  @IsDefined()
  @IsString()
  content: string;
}

export class ImportPostsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @Type(() => ImportPostRow)
  @ValidateNested({ each: true })
  rows: ImportPostRow[];
}
