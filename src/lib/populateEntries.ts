import type { TEntryId, TExclusionId, TRecurringConfigId } from "@/evolu-db";
import type {
  TEntryRow,
  TModifiedEntry,
  TRecurringConfigRow,
} from "@/evolu-queries";
import { generateOccurrences } from "@/lib/generateOccurrences";
import { cast } from "@evolu/react";

export type TPopulatedEntry = ReturnType<typeof populateEntries>[number];

export const populateEntries = (
  entries: Readonly<TEntryRow[]>,
  recurringConfigs: Readonly<TRecurringConfigRow[]>
) => {
  // console.time("populateEntries");
  const entriesList: Array<{
    id: null | TEntryId;
    recurringConfigId: null | TRecurringConfigId;
    exclusionId: null | TExclusionId;
    index: number;
    date: Date;
    recurringConfig: null | TConfig;
    details: NonNullable<TEntryRow | TModifiedEntry>;
  }> = [];
  type TConfig = (typeof recurringConfigs)[0];

  recurringConfigs.forEach((recurringConfig) => {
    const exclusions = recurringConfig.exclusions || [];
    const occurrences = generateOccurrences(recurringConfig, exclusions);

    occurrences.forEach((occ) => {
      const details = {
        ...recurringConfig.originEntry,
        ...occ.modifiedEntry,
      } as NonNullable<TEntryRow>;

      if (!occ.modifiedEntry) {
        details.fullfilled = cast(false);
      }

      entriesList.push({
        recurringConfigId: recurringConfig.recurringConfigId,
        recurringConfig,
        id: (occ.modifiedEntry?.entryId as TEntryId) || null,
        exclusionId: (occ.exclusionId as TExclusionId) || null,
        index: occ.index,
        date: occ.date,
        details,
      });
    });
  });

  entries.forEach((entry) => {
    entriesList.push({
      id: entry.entryId,
      index: 1,
      exclusionId: null,
      recurringConfigId: null,
      recurringConfig: null,
      date: cast(entry.date!),
      details: entry,
    });
  });

  entriesList.sort((a, b) => a.date.getTime() - b.date.getTime());

  // console.timeEnd("populateEntries");
  return entriesList;
};
