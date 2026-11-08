'use client';

import React, { useCallback } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import useSWR from 'swr';
import { Select } from '@gitroom/react/form/select';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

export const useApprovalPreference = () => {
  const fetch = useFetch();

  const load = useCallback(async () => {
    return (await fetch('/settings/approval')).json();
  }, []);

  return useSWR<{ requireApproval: boolean }>('approval-preference', load, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    revalidateOnMount: true,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
  });
};

const ApprovalPreferenceComponent = () => {
  const t = useT();
  const fetch = useFetch();
  const toaster = useToaster();
  const { data, isLoading, mutate } = useApprovalPreference();

  const handleChange = useCallback(
    async (event: React.ChangeEvent<HTMLSelectElement>) => {
      const requireApproval = event.target.value === 'YES';
      await fetch('/settings/approval', {
        method: 'POST',
        body: JSON.stringify({ requireApproval }),
      });

      mutate({ requireApproval });
      toaster.show(t('settings_updated', 'Settings updated'), 'success');
    },
    [fetch, mutate, toaster, t]
  );

  if (isLoading) {
    return (
      <div className="my-[16px] mt-[16px] bg-sixth border-fifth border rounded-[4px] p-[24px]">
        <div className="animate-pulse">{t('loading', 'Loading...')}</div>
      </div>
    );
  }

  return (
    <div className="my-[16px] mt-[16px] bg-sixth border-fifth border rounded-[4px] p-[24px] flex flex-col gap-[24px]">
      <div className="mt-[4px]">
        {t('approval_settings', 'Approval Workflow')}
      </div>
      <div className="flex items-center justify-between gap-[24px]">
        <div className="flex flex-col flex-1">
          <div className="text-[14px]">
            {t('approval_preference', 'Require approval before publishing')}
          </div>
          <div className="text-[12px] text-textItemBlur">
            {t(
              'approval_preference_description',
              'Posts scheduled by members wait as drafts until an admin approves them.'
            )}
          </div>
        </div>
        <div className="w-[200px]">
          <Select
            name="requireApproval"
            label=""
            disableForm={true}
            hideErrors={true}
            value={data?.requireApproval ? 'YES' : 'NO'}
            onChange={handleChange}
          >
            <option value="NO">{t('approval_no', 'Not required')}</option>
            <option value="YES">
              {t('approval_yes', 'Required for members')}
            </option>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ApprovalPreferenceComponent;
