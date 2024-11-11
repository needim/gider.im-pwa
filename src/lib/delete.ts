import { type TGroupId, type TTagId, evolu } from "@/evolu-db";
import { exclusionsQuery } from "@/evolu-queries";
import type { TPopulatedEntry } from "@/lib/populateEntries";
import dayjs from "dayjs";

export const deleteGroup = (groupId: TGroupId) => {
  evolu.update("entryGroup", { id: groupId, isDeleted: true });
};

export const deleteTag = (tagId: TTagId) => {
  evolu.update("entryTag", { id: tagId, isDeleted: true });
};

export async function deleteEntry(
  entry: TPopulatedEntry,
  withSubsequents = false,
  onComplete: () => void = () => {}
) {
  // if it's an exclusion
  if (entry.exclusionId) {
    evolu.update("exclusion", {
      id: entry.exclusionId,
      reason: "deletion",
    });
    // if it's a single entry
  } else if (entry.id && !entry.recurringConfigId) {
    evolu.update("entry", { id: entry.id, isDeleted: true });
  } else {
    // if its's a ghost record
    evolu.create("exclusion", {
      recurringId: entry.recurringConfigId!,
      date: entry.date,
      index: entry.index,
      reason: "deletion",
      applyToSubsequents: withSubsequents,
      modifiedEntryId: null,
    });
  }

  if (withSubsequents && entry.recurringConfigId) {
    const allExclusions = await evolu.loadQuery(
      exclusionsQuery(entry.recurringConfigId)
    );

    if (entry.index === 0) {
      // we are deleting main entry, so delete recurring config also
      evolu.update("recurringConfig", {
        id: entry.recurringConfigId,
        isDeleted: true,
      });

      allExclusions.rows.map((ex) => {
        evolu.update("exclusion", {
          id: ex.exclusionId,
          isDeleted: true,
        });
      });
    } else {
      // delete exclusions after this date
      allExclusions.rows
        .filter((ex) => dayjs(ex.date).isAfter(dayjs(entry.date)))
        .map((ex) => {
          evolu.update("exclusion", {
            id: ex.exclusionId,
            isDeleted: true,
          });
        });

      // modify main entry's endDate and internal
      evolu.update("recurringConfig", {
        id: entry.recurringConfigId,
        endDate: entry.date,
        every: entry.recurringConfig?.every || 1,
        interval: entry.index - 1,
        isDeleted: entry.index - 1 === 0, // if it's the last one, mark as deleted
      });
    }
  }

  setTimeout(() => {
    // we need to wait for the dialog to close
    // because the entry is still open
    onComplete();
  }, 200);
}
