import { type TAmountString, decodeBoolean } from "@/evolu-db";
import type { TExclusionRow, TRecurringConfigRow } from "@/evolu-queries";
import { type SqliteBoolean, cast } from "@evolu/react";
import dayjs from "dayjs";

export const generateOccurrences = (
  recurringConfig: TRecurringConfigRow,
  exclusions: TExclusionRow[]
) => {
  // console.time("generateOccurrences");
  const occurences = [];
  const MAX_OCCURENCES = {
    year: 20,
    month: 240,
    week: 1248,
  } as const;

  const frequency = recurringConfig.frequency;
  const every = recurringConfig.every || 1;
  const startDate = dayjs(cast(recurringConfig.startDate!)).set("hour", 12); // set to noon to avoid DST issues

  let endDate = startDate.add(recurringConfig.interval!, frequency);

  if (recurringConfig.interval === 0) {
    endDate = startDate.add(MAX_OCCURENCES[frequency], frequency);
  }

  let diff = endDate.diff(startDate, frequency);

  if (diff < 0) {
    diff = 0;
  }

  if (diff > MAX_OCCURENCES[frequency]) {
    diff = MAX_OCCURENCES[frequency];
  }

  let occurenceForFuture: {
    amount: string;
    fullfilled: SqliteBoolean;
    dayOfMonth: number | null;
  } | null = null;

  let logicalIndex = 0;
  for (let i = 0; i < diff; i += every) {
    const currDate = dayjs(startDate).add(i, frequency);
    logicalIndex++;

    const isExcluded = exclusions.some(
      (e) =>
        (currDate.isSame(dayjs(e.date), "day") || e.index === i + 1) &&
        e.reason === "deletion"
    );

    const isModified = exclusions.find(
      (e) =>
        (currDate.isSame(dayjs(e.date), "day") || e.index === i + 1) &&
        e.reason === "modification"
    );

    if (isModified && !!isModified?.applyToSubsequents) {
      occurenceForFuture = {
        amount: isModified.modifiedEntry!.amount as TAmountString,
        fullfilled: decodeBoolean(0),
        dayOfMonth: isModified.modifiedDate
          ? dayjs(isModified.modifiedDate).date()
          : null,
      };
    }

    if (!isExcluded) {
      const modEntry = isModified
        ? isModified.modifiedEntry
        : occurenceForFuture
        ? { ...recurringConfig.originEntry, ...occurenceForFuture }
        : null;

      // name, group, tag is shared between recurring entries
      if (modEntry && recurringConfig.originEntry) {
        modEntry.name = recurringConfig.originEntry.name;
        modEntry.entryGroup = recurringConfig.originEntry.entryGroup;
        modEntry.entryTag = recurringConfig.originEntry.entryTag;
      }

      let occDate = isModified?.modifiedDate
        ? dayjs(isModified.modifiedDate).toDate()
        : currDate.toDate();

      if (occurenceForFuture?.dayOfMonth) {
        let adjustedDate = dayjs(occDate).set(
          "date",
          occurenceForFuture.dayOfMonth
        );

        if (adjustedDate.month() !== currDate.month()) {
          adjustedDate = dayjs(currDate).endOf("month");
        }

        if (!isModified?.modifiedDate) occDate = adjustedDate.toDate();
      }

      occurences.push({
        index: logicalIndex,
        date: occDate,
        exclusionId: isModified ? isModified.id : null,
        modifiedEntry: modEntry,
      });
    }
  }

  // console.timeEnd("generateOccurrences");
  return occurences;
};
