'use client';

import React, { useCallback, useState } from 'react';
import useSWR from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import { fromUtc } from '@gitroom/frontend/components/layout/set.timezone';
import { stripHtmlValidation } from '@gitroom/helpers/utils/strip.html.validation';
import { Button } from '@gitroom/react/form/button';

export interface PendingApproval {
  id: string;
  group: string;
  content: string;
  publishDate: string;
  integration: {
    id: string;
    name: string;
    picture: string | null;
    providerIdentifier: string;
  };
}

export const usePendingApprovals = () => {
  const fetch = useFetch();

  const load = useCallback(async () => {
    return (await fetch('/posts/approvals')).json();
  }, []);

  return useSWR<PendingApproval[]>('pending-approvals', load);
};

export const ApprovalsComponent = () => {
  const t = useT();
  const fetch = useFetch();
  const toaster = useToaster();
  const user = useUser();
  const { data, isLoading, mutate } = usePendingApprovals();
  const [working, setWorking] = useState<string | null>(null);
  const canDecide = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

  const decide = useCallback(
    (id: string, approve: boolean) => async () => {
      setWorking(id);
      const res = await fetch(`/posts/${id}/approval`, {
        method: 'POST',
        body: JSON.stringify({ approve }),
      });
      setWorking(null);

      if (!res.ok) {
        toaster.show(
          t('approval_failed', 'Could not update this post, try again'),
          'warning'
        );
        return;
      }

      toaster.show(
        approve
          ? t('approval_approved', 'Post approved and scheduled')
          : t('approval_rejected', 'Post sent back to drafts'),
        'success'
      );
      mutate();
    },
    [fetch, mutate, toaster, t]
  );

  return (
    <div className="flex flex-col gap-[16px] flex-1 bg-newBgColorInner rounded-[12px] p-[24px] mobile:p-[16px]">
      <h1 className="text-[24px] font-[700]">
        {t('approvals', 'Approvals')}
      </h1>
      <p className="text-[14px] text-textItemBlur">
        {canDecide
          ? t(
              'approvals_admin_description',
              'Posts from your team waiting for your review. Approving schedules them; rejecting keeps them as drafts.'
            )
          : t(
              'approvals_member_description',
              'Your scheduled posts appear here until an admin approves them.'
            )}
      </p>
      {isLoading ? (
        <div className="animate-pulse">{t('loading', 'Loading...')}</div>
      ) : !data?.length ? (
        <div className="text-[14px] py-[40px] text-center text-textItemBlur">
          {t('approvals_empty', 'Nothing is waiting for approval.')}
        </div>
      ) : (
        <ul className="flex flex-col gap-[12px]">
          {data.map((post) => (
            <li
              key={post.id}
              className="flex gap-[16px] items-center border border-newBorder rounded-[8px] p-[16px] bg-newBgColor mobile:flex-col mobile:items-stretch"
            >
              <div className="relative min-w-[36px]">
                <img
                  className="w-[36px] h-[36px] rounded-[8px]"
                  src={post.integration.picture || '/no-picture.jpg'}
                  alt=""
                />
                <img
                  className="w-[16px] h-[16px] rounded-[8px] absolute -bottom-[4px] -end-[4px] border border-fifth"
                  src={`/icons/platforms/${post.integration.providerIdentifier}.png`}
                  alt={post.integration.providerIdentifier}
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
                <div className="text-[12px] text-textItemBlur">
                  {post.integration.name} ·{' '}
                  {fromUtc(post.publishDate).format('ddd D MMM YYYY, HH:mm')}
                </div>
                <div className="text-[14px] line-clamp-2 break-words">
                  {stripHtmlValidation('none', post.content, false, true, false) ||
                    t('no_content', 'no content')}
                </div>
              </div>
              <div className="flex gap-[8px] flex-wrap">
                <a
                  href={`/p/${post.id}?share=true`}
                  target="_blank"
                  rel="noreferrer"
                  className="h-[40px] px-[16px] flex items-center rounded-[4px] border border-newBorder text-[14px]"
                >
                  {t('preview', 'Preview')}
                </a>
                {canDecide && (
                  <>
                    <Button
                      secondary={true}
                      disabled={!!working}
                      onClick={decide(post.id, false)}
                    >
                      {t('reject', 'Reject')}
                    </Button>
                    <Button
                      loading={working === post.id}
                      disabled={!!working}
                      onClick={decide(post.id, true)}
                    >
                      {t('approve', 'Approve')}
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
