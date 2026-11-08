import { IsBoolean } from 'class-validator';

export class ApprovalPreferenceDto {
  @IsBoolean()
  requireApproval: boolean;
}
