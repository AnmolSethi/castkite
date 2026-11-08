import {
  Equals,
  IsDefined,
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Provider } from '@prisma/client';

export class CreateOrgUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  @IsDefined()
  @ValidateIf((o) => !o.providerToken)
  password: string;

  @IsString()
  @IsDefined()
  provider: Provider;

  @IsString()
  @IsDefined()
  @ValidateIf((o) => !o.password)
  providerToken: string;

  @IsEmail()
  @IsDefined()
  @ValidateIf((o) => !o.providerToken)
  email: string;

  @IsString()
  @IsDefined()
  @MinLength(3)
  @MaxLength(128)
  company: string;

  // The terms set a minimum age of 18 (DPDP Act); sign-up requires the user to confirm it.
  @Equals(true, { message: 'You must be 18 or older to sign up' })
  ageConfirmed: boolean;

  datafast_visitor_id: string;
}
