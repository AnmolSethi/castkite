import { IsBoolean } from 'class-validator';

export class ApprovalDecisionDto {
  @IsBoolean()
  approve: boolean;
}
