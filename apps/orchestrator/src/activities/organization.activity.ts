import { Injectable } from '@nestjs/common';
import { Activity, ActivityMethod } from 'nestjs-temporal-core';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';

@Injectable()
@Activity()
export class OrganizationActivity {
  constructor(private _organizationService: OrganizationService) {}

  @ActivityMethod()
  async purgeDeletedOrganizations() {
    return this._organizationService.purgeDeletedOrganizations();
  }
}
