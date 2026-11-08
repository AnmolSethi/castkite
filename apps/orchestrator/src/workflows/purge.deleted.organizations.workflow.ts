import {
  continueAsNew,
  proxyActivities,
  sleep,
  workflowInfo,
} from '@temporalio/workflow';
import { OrganizationActivity } from '@gitroom/orchestrator/activities/organization.activity';

const { purgeDeletedOrganizations } = proxyActivities<OrganizationActivity>({
  startToCloseTimeout: '1 hour',
  // no retry: a timed-out attempt is not cancelled and would overlap the
  // retry, the next daily run picks up whatever is left
  retry: { maximumAttempts: 1 },
});

export async function purgeDeletedOrganizationsWorkflow() {
  let loops = 0;
  while (true) {
    try {
      await purgeDeletedOrganizations();
    } catch (err) {
      // tomorrow's run picks up whatever is left
    }

    await sleep('1 day');

    // Keep the history small
    if (++loops >= 30 || workflowInfo().historyLength > 1000) {
      return await continueAsNew<typeof purgeDeletedOrganizationsWorkflow>();
    }
  }
}
