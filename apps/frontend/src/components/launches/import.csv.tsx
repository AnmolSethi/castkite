'use client';

import React, { FC, useCallback, useMemo, useState } from 'react';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import {
  Integrations,
  useCalendar,
} from '@gitroom/frontend/components/launches/calendar.context';
import { newDayjs } from '@gitroom/frontend/components/layout/set.timezone';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { parseCsv } from '@gitroom/helpers/utils/parse.csv';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { Button } from '@gitroom/react/form/button';

const TEMPLATE =
  'date,channel,content\n2026-12-01 09:00,My LinkedIn Page,"First line\nSecond line"\n';

interface ImportRow {
  line: number;
  channel: string;
  date: string;
  content: string;
  integrationId?: string;
  utcDate?: string;
  error?: string;
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// plain-text CSV content becomes the editor's HTML, one <p> per line
const toHtml = (text: string) =>
  text
    .split(/\r?\n/)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('');

const readRows = (
  text: string,
  integrations: Integrations[],
  t: ReturnType<typeof useT>
): ImportRow[] | string => {
  const [header, ...lines] = parseCsv(text);
  const columns = (header || []).map((h) => h.trim().toLowerCase());
  const at = {
    date: columns.indexOf('date'),
    channel: columns.indexOf('channel'),
    content: columns.indexOf('content'),
  };
  if (at.date < 0 || at.channel < 0 || at.content < 0) {
    return t(
      'csv_missing_columns',
      'The first row must have the columns: date, channel, content'
    );
  }
  if (lines.length > 500) {
    return t('csv_too_many_rows', 'You can import up to 500 posts at once');
  }

  const active = integrations.filter((i) => !i.disabled && !i.inBetweenSteps);
  return lines.map((cells, index) => {
    const row: ImportRow = {
      line: index + 2,
      channel: (cells[at.channel] || '').trim(),
      date: (cells[at.date] || '').trim(),
      content: cells[at.content] || '',
    };
    const channel = row.channel.toLowerCase();
    const integration = active.find(
      (i) => i.id === row.channel || i.name.toLowerCase() === channel
    );
    const date = newDayjs(row.date);

    if (!integration) {
      row.error = t('csv_unknown_channel', 'No active channel with this name');
    } else if (!row.date || !date.isValid()) {
      row.error = t('csv_invalid_date', 'Date must look like 2026-12-01 09:00');
    } else if (date.isBefore(newDayjs())) {
      row.error = t('csv_past_date', 'Date is in the past');
    } else if (!row.content.trim()) {
      row.error = t('csv_empty_content', 'Content is empty');
    } else {
      row.integrationId = integration.id;
      row.utcDate = date.utc().format('YYYY-MM-DDTHH:mm:ss');
    }
    return row;
  });
};

// the modal renders outside the calendar context, so the channels come in as a prop
const ImportCsvModal: FC<{
  integrations: Integrations[];
  onDone: () => void;
}> = ({ integrations, onDone }) => {
  const t = useT();
  const fetch = useFetch();
  const toaster = useToaster();
  const modal = useModals();
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileError, setFileError] = useState('');
  const [loading, setLoading] = useState(false);
  const ready = useMemo(() => rows.filter((r) => !r.error), [rows]);

  const templateHref = useMemo(
    () => 'data:text/csv;charset=utf-8,' + encodeURIComponent(TEMPLATE),
    []
  );

  const loadFile = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      const result = readRows(await file.text(), integrations, t);
      if (typeof result === 'string') {
        setFileError(result);
        setRows([]);
        return;
      }
      setFileError(
        result.length ? '' : t('csv_no_rows', 'The file has no posts')
      );
      setRows(result);
    },
    [integrations, t]
  );

  const submit = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/posts/import', {
      method: 'POST',
      body: JSON.stringify({
        rows: ready.map((r) => ({
          integrationId: r.integrationId,
          date: r.utcDate,
          content: toHtml(r.content),
        })),
      }),
    });
    setLoading(false);

    if (!res.ok) {
      toaster.show(
        res.status === 402
          ? t(
              'csv_over_limit',
              'This import is larger than the posts left in your plan this month'
            )
          : t('csv_import_failed', 'Import failed, try again'),
        'warning'
      );
      return;
    }

    const results: {
      row: number;
      ok: boolean;
      error?: string;
      pendingApproval?: boolean;
    }[] = await res.json();
    const failed = new Map(
      results.filter((r) => !r.ok).map((r) => [ready[r.row - 1].line, r.error])
    );
    const created = results.length - failed.size;
    // members' posts wait for an admin instead of being scheduled
    const pending = results.some((r) => r.pendingApproval);
    onDone();

    if (!failed.size) {
      toaster.show(
        pending
          ? t('csv_import_pending', '{{count}} posts sent for approval', {
              count: created,
            })
          : t('csv_import_done', '{{count}} posts scheduled', {
              count: created,
            }),
        'success'
      );
      // close so the same rows cannot be submitted twice
      modal.closeCurrent();
      return;
    }

    // keep only the rows that still need fixing on screen
    setRows(
      ready
        .filter((r) => failed.has(r.line))
        .map((r): ImportRow => ({ ...r, error: failed.get(r.line) }))
        .concat(rows.filter((r) => r.error))
        .sort((a, b) => a.line - b.line)
    );
    toaster.show(
      pending
        ? t(
            'csv_import_pending_partial',
            '{{count}} posts sent for approval, some rows failed',
            { count: created }
          )
        : t('csv_import_partial', '{{count}} posts scheduled, some rows failed', {
            count: created,
          }),
      'warning'
    );
  }, [ready, rows, fetch, toaster, t, onDone, modal]);

  return (
    <div className="flex flex-col gap-[16px] text-textColor">
      <p className="text-[14px]">
        {t(
          'csv_instructions',
          'Upload a CSV with the columns date, channel and content. Dates use your timezone setting, channel is the channel name as shown in the sidebar.'
        )}{' '}
        <a
          href={templateHref}
          download="castkite-import-template.csv"
          className="underline font-[600]"
        >
          {t('csv_download_template', 'Download template')}
        </a>
      </p>
      <label className="flex flex-col gap-[6px] text-[14px] font-[600]">
        {t('csv_file', 'CSV file')}
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={loadFile}
          className="text-[14px] font-[400] file:me-[12px] file:h-[40px] file:px-[16px] file:border file:border-newBorder file:bg-newBgColor file:text-textColor file:rounded-[4px] file:cursor-pointer"
        />
      </label>
      {!!fileError && (
        <div role="alert" className="text-[14px] text-red-500">
          {fileError}
        </div>
      )}
      {!!rows.length && (
        <div className="max-h-[50vh] overflow-auto border border-newBorder rounded-[4px]">
          <table className="w-full text-[13px] text-start">
            <thead className="bg-newTableHeader sticky top-0">
              <tr>
                <th className="p-[8px] text-start">{t('csv_row', 'Row')}</th>
                <th className="p-[8px] text-start">{t('csv_date', 'Date')}</th>
                <th className="p-[8px] text-start">
                  {t('csv_channel', 'Channel')}
                </th>
                <th className="p-[8px] text-start">
                  {t('csv_content', 'Content')}
                </th>
                <th className="p-[8px] text-start">
                  {t('csv_status', 'Status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.line} className="border-t border-newTableBorder">
                  <td className="p-[8px]">{row.line}</td>
                  <td className="p-[8px] whitespace-nowrap">{row.date}</td>
                  <td className="p-[8px]">{row.channel}</td>
                  <td className="p-[8px] max-w-[280px] truncate">
                    {row.content}
                  </td>
                  <td
                    className={
                      row.error ? 'p-[8px] text-red-500' : 'p-[8px] font-[600]'
                    }
                  >
                    {row.error || t('csv_ready', 'Ready')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-end">
        <Button loading={loading} disabled={!ready.length} onClick={submit}>
          {t('csv_schedule_count', 'Schedule {{count}} posts', {
            count: ready.length,
          })}
        </Button>
      </div>
    </div>
  );
};

export const ImportCsvButton = () => {
  const t = useT();
  const modal = useModals();
  const { integrations, reloadCalendarView } = useCalendar();

  const open = useCallback(() => {
    modal.openModal({
      title: t('csv_import_title', 'Bulk schedule from CSV'),
      closeOnClickOutside: false,
      classNames: {
        modal: 'text-textColor',
      },
      size: 'xl',
      children: (
        <ImportCsvModal
          integrations={integrations}
          onDone={reloadCalendarView}
        />
      ),
    });
  }, [modal, t, integrations, reloadCalendarView]);

  return (
    <button
      type="button"
      onClick={open}
      aria-label={t('csv_import_title', 'Bulk schedule from CSV')}
      title={t('csv_import_title', 'Bulk schedule from CSV')}
      className="h-[44px] w-[44px] min-w-[44px] group-[.sidebar]:w-full bg-btnSimple text-btnText justify-center items-center flex rounded-[8px] cursor-pointer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M14 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V8L14 3ZM14 3V8H19M12 18V12M12 12L9.5 14.5M12 12L14.5 14.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};
