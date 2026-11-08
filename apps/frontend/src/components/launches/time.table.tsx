'use client';

import React, { FC, useCallback, useMemo, useState } from 'react';
import { Integrations } from '@gitroom/frontend/components/launches/calendar.context';
import dayjs from 'dayjs';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
import { Select } from '@gitroom/react/form/select';
import { Button } from '@gitroom/react/form/button';
import utc from 'dayjs/plugin/utc';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
// @ts-ignore
import useKeypress from 'react-use-keypress';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { sortBy } from 'lodash';
import { usePreventWindowUnload } from '@gitroom/react/helpers/use.prevent.window.unload';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import {
  fromUtc,
  newDayjs,
} from '@gitroom/frontend/components/layout/set.timezone';
import clsx from 'clsx';
import useSWR from 'swr';
import {
  TrashIcon,
  PlusIcon,
  DelayIcon,
} from '@gitroom/frontend/components/ui/icons';

dayjs.extend(utc);

const hours = [...Array(24).keys()].map((i) => ({
  value: i,
}));

const minutes = [...Array(60).keys()].map((i) => ({
  value: i,
}));

interface BestTimes {
  analyzed: number;
  slots: { time: number; posts: number; lift: number }[];
}

const useBestTimes = (integrationId: string) => {
  const fetch = useFetch();
  const load = useCallback(async () => {
    return (await fetch(`/posts/best-times/${integrationId}`)).json();
  }, [integrationId]);

  return useSWR<BestTimes>(`best-times-${integrationId}`, load, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
};

export const TimeTable: FC<{
  integration: Integrations;
  mutate: () => void;
}> = (props) => {
  const t = useT();
  const {
    integration: { time },
    mutate,
  } = props;
  const [currentTimes, setCurrentTimes] = useState([...time]);
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const fetch = useFetch();
  const modal = useModals();
  const { data: bestTimes, isLoading: loadingBestTimes } = useBestTimes(
    props.integration.id
  );
  usePreventWindowUnload(true);

  const askClose = useCallback(async () => {
    if (
      !(await deleteDialog(
        t(
          'are_you_sure_you_want_to_close_the_window',
          'Are you sure you want to close the window?'
        ),
        t('yes_close', 'Yes, close')
      ))
    ) {
      return;
    }
    modal.closeAll();
  }, []);

  useKeypress('Escape', askClose);

  const removeSlot = useCallback(
    (index: number) => async () => {
      if (
        !(await deleteDialog(
          t(
            'are_you_sure_you_want_to_delete_this_slot',
            'Are you sure you want to delete this slot?'
          )
        ))
      ) {
        return;
      }
      setCurrentTimes((prev) => prev.filter((_, i) => i !== index));
    },
    []
  );

  const addHour = useCallback(() => {
    const calculateMinutes =
      newDayjs()
        .utc()
        .startOf('day')
        .add(hour, 'hours')
        .add(minute, 'minutes')
        .diff(newDayjs().utc().startOf('day'), 'minutes') -
      newDayjs().utcOffset();
    setCurrentTimes((prev) => [
      ...prev,
      {
        time: calculateMinutes,
      },
    ]);
  }, [hour, minute]);

  const times = useMemo(() => {
    return sortBy(
      currentTimes.map(({ time }) => ({
        value: time,
        formatted: fromUtc(
          dayjs.utc().startOf('day').add(time, 'minutes')
        ).format('HH:mm'),
      })),
      (p) => p.value
    );
  }, [currentTimes]);

  const save = useCallback(async () => {
    await fetch(`/integrations/${props.integration.id}/time`, {
      method: 'POST',
      body: JSON.stringify({
        time: currentTimes,
      }),
    });
    mutate();
    modal.closeAll();
  }, [currentTimes]);

  return (
    <div className="relative w-full max-w-[400px] mx-auto">
      {/* Add Time Slot Section */}
      <div className="bg-newBgColorInner rounded-[12px] p-[20px] border border-newTableBorder">
        <div className="text-[15px] font-semibold mb-[16px] flex items-center gap-[8px]">
          <DelayIcon size={18} className="text-accentLine" />
          {t('add_time_slot', 'Add Time Slot')}
        </div>

        <div className="flex gap-[12px] items-end">
          <div className="flex-1">
            <Select
              label={t('hour', 'Hour')}
              name="hour"
              disableForm={true}
              hideErrors={true}
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
            >
              {hours.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.value.toString().padStart(2, '0')}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex-1">
            <Select
              label={t('minutes', 'Minutes')}
              name="minutes"
              disableForm={true}
              hideErrors={true}
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
            >
              {minutes.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.value.toString().padStart(2, '0')}
                </option>
              ))}
            </Select>
          </div>
          <button
            type="button"
            onClick={addHour}
            className="h-[42px] px-[16px] bg-brand hover:bg-brand/85 transition-colors rounded-[8px] flex items-center gap-[6px] text-black text-[14px] font-medium"
          >
            <PlusIcon size={14} />
            {t('add', 'Add')}
          </button>
        </div>
      </div>

      {/* Suggested times from the channel's own results */}
      <div className="mt-[20px] bg-newBgColorInner rounded-[12px] p-[20px] border border-newTableBorder">
        <div className="text-[15px] font-semibold mb-[4px]">
          {t('best_times_title', 'Best times to post')}
        </div>
        <div className="text-[12px] text-newTextColor/60 mb-[12px]">
          {t(
            'best_times_description',
            'Based on how your recent posts on this channel performed.'
          )}
        </div>
        {loadingBestTimes ? (
          <div className="text-[14px] animate-pulse">
            {t('best_times_loading', 'Analyzing your recent posts...')}
          </div>
        ) : !bestTimes?.slots?.length ? (
          <div className="text-[14px] text-newTextColor/60">
            {t(
              'best_times_not_enough',
              'Not enough results yet. Suggestions appear after a few published posts with analytics.'
            )}
          </div>
        ) : (
          <ul className="flex flex-col gap-[8px]">
            {bestTimes.slots.map((slot) => {
              const added = currentTimes.some((c) => c.time === slot.time);
              return (
                <li
                  key={slot.time}
                  className="flex items-center justify-between gap-[12px] h-[48px] px-[16px] rounded-[8px] border border-newTableBorder"
                >
                  <span className="text-[15px] font-medium tabular-nums">
                    {fromUtc(
                      dayjs.utc().startOf('day').add(slot.time, 'minutes')
                    ).format('HH:mm')}
                  </span>
                  <span className="flex-1 text-[12px] text-newTextColor/60">
                    {t('best_times_lift', '{{lift}}x your average, {{posts}} posts', {
                      lift: slot.lift,
                      posts: slot.posts,
                    })}
                  </span>
                  <button
                    type="button"
                    disabled={added}
                    onClick={() =>
                      setCurrentTimes((prev) => [...prev, { time: slot.time }])
                    }
                    className="h-[32px] px-[12px] rounded-[6px] bg-brand text-black text-[13px] font-medium disabled:opacity-50 disabled:cursor-default"
                  >
                    {added ? t('added', 'Added') : t('add', 'Add')}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Time Slots List */}
      <div className="mt-[20px]">
        <div className="text-[14px] text-newTextColor/60 mb-[12px]">
          {t('scheduled_times', 'Scheduled Times')} ({times.length})
        </div>

        {times.length === 0 ? (
          <div className="text-center py-[32px] text-newTextColor/40 text-[14px] border border-dashed border-newTableBorder rounded-[12px]">
            {t('no_time_slots', 'No time slots added yet')}
          </div>
        ) : (
          <div className="flex flex-col gap-[8px]">
            {times.map((timeSlot, index) => (
              <div
                key={`${timeSlot.value}-${index}`}
                className={clsx(
                  'group flex items-center justify-between',
                  'h-[48px] px-[16px] rounded-[8px]',
                  'bg-newBgColorInner border border-newTableBorder',
                  'hover:border-accentLine/40 transition-colors'
                )}
              >
                <div className="flex items-center gap-[12px]">
                  <div className="w-[8px] h-[8px] rounded-full bg-brand" />
                  <span className="text-[15px] font-medium tabular-nums">
                    {timeSlot.formatted}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeSlot(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-[8px] hover:bg-red-500/10 rounded-[6px] text-red-400 hover:text-red-500"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="mt-[24px]">
        <Button type="button" className="w-full rounded-[8px]" onClick={save}>
          {t('save_changes', 'Save Changes')}
        </Button>
      </div>
    </div>
  );
};
