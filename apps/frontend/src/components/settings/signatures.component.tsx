import React, { FC, useCallback, useMemo, useState } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import useSWR from 'swr';
import { Button } from '@gitroom/react/form/button';
import clsx from 'clsx';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { TopTitle } from '@gitroom/frontend/components/launches/helpers/top.title.component';
import { array, boolean, object, string } from 'yup';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CopilotTextarea } from '@copilotkit/react-textarea';
import { Select } from '@gitroom/react/form/select';
import { Input } from '@gitroom/react/form/input';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
export const SignaturesComponent: FC<{
  appendSignature?: (value: string) => void;
}> = (props) => {
  const { appendSignature } = props;
  const t = useT();
  const fetch = useFetch();
  const modal = useModals();
  const toaster = useToaster();
  const load = useCallback(async () => {
    return (await fetch('/signatures')).json();
  }, []);
  const { data, mutate } = useSWR('signatures', load);
  const [search, setSearch] = useState('');
  const snippets = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data || []).filter(
      (p: any) =>
        !query ||
        (p.name || '').toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query)
    );
  }, [data, search]);
  const addSignature = useCallback(
    (data?: any) => () => {
      modal.openModal({
        title: data
          ? t('edit_snippet', 'Edit snippet')
          : t('add_snippet', 'Add a snippet'),
        withCloseButton: true,
        children: <AddOrRemoveSignature data={data} reload={mutate} />,
      });
    },
    [mutate]
  );

  const deleteSignature = useCallback(
    (data: any) => async () => {
      if (
        await deleteDialog(
          t(
            'are_you_sure_you_want_to_delete',
            `Are you sure you want to delete?`,
            { name: data.content.slice(0, 15) + '...' }
          )
        )
      ) {
        await fetch(`/signatures/${data.id}`, {
          method: 'DELETE',
        });
        mutate();
        toaster.show(t('snippet_deleted', 'Snippet deleted'), 'success');
      }
    },
    []
  );

  return (
    <div className="flex flex-col">
      <h3 className="text-[20px]">
        {t('caption_library', 'Caption & hashtag library')}
      </h3>
      <div className="text-textItemBlur mt-[4px]">
        {t(
          'caption_library_description',
          'Save hashtag sets, captions and sign-offs once, then insert them into any post. One snippet can be added to every new post automatically.'
        )}
      </div>
      {(data?.length || 0) > 3 && (
        <label className="mt-[16px] flex flex-col gap-[6px] text-[14px]">
          {t('search_snippets', 'Search snippets')}
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_snippets_placeholder', 'launch, #hiring...')}
            className="h-[40px] px-[12px] rounded-[4px] border border-newBorder bg-newBgColorInner text-textColor outline-none focus:border-accentLine"
          />
        </label>
      )}
      <div className="my-[16px] mt-[16px] bg-sixth border-fifth items-center border rounded-[4px] p-[24px] mobile:p-[12px] flex gap-[24px]">
        <div className="flex flex-col w-full">
          {!!data?.length && !snippets.length && (
            <div className="text-[14px] text-textItemBlur">
              {t('no_snippets_match', 'No snippets match your search')}
            </div>
          )}
          {!!snippets.length && (
            <div
              className={`grid ${
                !!appendSignature
                  ? 'grid-cols-[1fr,1fr,1fr,1fr,1fr]'
                  : 'grid-cols-[1fr,1fr,1fr,1fr]'
              } mobile:grid-cols-1 w-full gap-y-[10px] mobile:gap-y-[8px]`}
            >
              <div className="mobile:hidden">{t('content', 'Content')}</div>
              <div className="text-center mobile:hidden">
                {t('auto_add', 'Auto Add?')}
              </div>
              {!!appendSignature && (
                <div className="text-center mobile:hidden">
                  {t('actions', 'Actions')}
                </div>
              )}
              <div className="text-center mobile:hidden">{t('edit', 'Edit')}</div>
              <div className="text-center mobile:hidden">
                {t('delete', 'Delete')}
              </div>
              {snippets.map((p: any) => (
                // a row of the table, a card on phones
                <div
                  key={p.id}
                  className="contents mobile:flex mobile:flex-wrap mobile:gap-[8px] mobile:p-[12px] mobile:rounded-[8px] mobile:border mobile:border-newColColor"
                >
                  <div className="relative flex-1 me-[20px] overflow-x-hidden mobile:basis-full mobile:me-0">
                    <div
                      title={p.content}
                      className="absolute start-0 line-clamp-1 top-[50%] -translate-y-[50%] text-ellipsis mobile:static mobile:translate-y-0"
                    >
                      {p.name ? (
                        <>
                          <span className="font-[600]">{p.name}</span>{' '}
                          <span className="text-textItemBlur">
                            {p.content.slice(0, 30)}
                          </span>
                        </>
                      ) : (
                        p.content.slice(0, 15) + '...'
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center relative me-[20px] mobile:basis-full mobile:me-0">
                    <div className="text-center w-full absolute start-0 line-clamp-1 top-[50%] -translate-y-[50%] mobile:static mobile:translate-y-0 mobile:text-start mobile:text-[12px] mobile:text-newTextColor/60">
                      <span className="hidden mobile:inline">
                        {t('auto_add', 'Auto Add?')}{' '}
                      </span>
                      {p.autoAdd ? 'Yes' : 'No'}
                    </div>
                  </div>
                  {!!appendSignature && (
                    <div className="flex justify-center mobile:basis-full">
                      <Button
                        className="mobile:w-full mobile:px-[12px]"
                        onClick={() => appendSignature(p.content)}
                      >
                        {t('insert_snippet', 'Insert')}
                      </Button>
                    </div>
                  )}
                  <div className="flex justify-center mobile:flex-1">
                    <div className="mobile:w-full">
                      <Button
                        className="mobile:w-full mobile:px-[12px]"
                        onClick={addSignature(p)}
                      >
                        {t('edit', 'Edit')}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-center mobile:flex-1">
                    <div className="mobile:w-full">
                      <Button
                        className="mobile:w-full mobile:px-[12px]"
                        onClick={deleteSignature(p)}
                      >
                        {t('delete', 'Delete')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div>
            <Button
              onClick={addSignature()}
              className={clsx(
                (data?.length || 0) > 0 && 'my-[16px]',
                'mobile:w-full'
              )}
            >
              {t('add_snippet', 'Add a snippet')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
const details = object().shape({
  name: string().max(80),
  content: string().required(),
  autoAdd: boolean().required(),
});
const AddOrRemoveSignature: FC<{
  data?: any;
  reload: () => void;
}> = (props) => {
  const { data, reload } = props;
  const t = useT();
  const toast = useToaster();
  const fetch = useFetch();
  const form = useForm({
    resolver: yupResolver(details),
    values: {
      name: data?.name || '',
      content: data?.content || '',
      autoAdd: data?.autoAdd || false,
    },
  });
  const text = form.watch('content');
  const autoAdd = form.watch('autoAdd');
  const modal = useModals();
  const callBack = useCallback(
    async (values: any) => {
      await fetch(data?.id ? `/signatures/${data.id}` : '/signatures', {
        method: data?.id ? 'PUT' : 'POST',
        body: JSON.stringify(values),
      });
      toast.show(t('snippet_saved', 'Snippet saved'), 'success');
      modal.closeCurrent();
      reload();
    },
    [data, modal]
  );

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(callBack)}>
        <div className="relative flex gap-[20px] flex-col flex-1 rounded-[4px] pt-0">
          <button
            className="outline-none absolute end-[20px] top-[15px] mantine-UnstyledButton-root mantine-ActionIcon-root hover:bg-tableBorder cursor-pointer mantine-Modal-close mantine-1dcetaa"
            type="button"
            onClick={() => modal.closeCurrent()}
          >
            <svg
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
            >
              <path
                d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>

          <Input
            label={t('snippet_name', 'Name (optional)')}
            name="name"
            maxLength={80}
            placeholder={t('snippet_name_placeholder', 'e.g. Launch week hashtags')}
          />

          <div className="relative bg-customColor2">
            <CopilotTextarea
              disableBranding={true}
              className={clsx(
                '!min-h-40 !max-h-80 p-2 overflow-x-hidden scrollbar scrollbar-thumb-brand bg-bigStrip outline-none'
              )}
              value={text}
              onChange={(e) => {
                form.setValue('content', e.target.value);
              }}
              placeholder={t(
                'snippet_placeholder',
                'Write hashtags, a caption or a sign-off...'
              )}
              autosuggestionsConfig={{
                textareaPurpose: `Assist me in writing social media signature`,
                chatApiConfigs: {},
              }}
            />
          </div>

          <Select
            label="Auto add signature?"
            translationKey="label_auto_add_signature"
            {...form.register('autoAdd', {
              setValueAs: (value) => value === 'true',
            })}
          >
            <option value="false">
              {t('no', 'No')}
            </option>
            <option value="true">
              {t('yes', 'Yes')}
            </option>
          </Select>

          <Button type="submit">{t('save', 'Save')}</Button>
        </div>
      </form>
    </FormProvider>
  );
};
