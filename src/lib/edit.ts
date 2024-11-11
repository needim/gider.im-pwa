import {
  type TEntryId,
  type TGroupId,
  type TTagId,
  decodeAmount,
  decodeName,
  evolu,
} from "@/evolu-db";
import { exclusionsQuery } from "@/evolu-queries";
import type { TPopulatedEntry } from "@/lib/populateEntries";
import dayjs from "dayjs";

export async function editEntry(
  entry: TPopulatedEntry,
  newName: string,
  newAmount: string,
  newGroup: string | null,
  newTag: string | null,
  newDate: Date | null,
  onComplete: () => void,
  applyToSubsequents = false
) {
  if (!newName || newName.length === 0) return;
  if (!newAmount || newAmount.length === 0) return;

  newGroup = newGroup === "" ? null : newGroup;
  newTag = newTag === "" ? null : newTag;

  // if it's a single entry
  if (entry.id && !entry.recurringConfigId) {
    evolu.update("entry", {
      id: entry.id,
      ...{
        name: decodeName(newName),
        amount: decodeAmount(Number(newAmount).toFixed(8).toString()),
        groupId: newGroup as TGroupId | null,
        tagId: newTag as TTagId | null,
        date: newDate ? dayjs(newDate).toDate() : entry.date,
      },
    });

    onComplete();
    return;
  }

  // if it's a recurring entry
  if (entry.recurringConfigId) {
    const allExclusions = await evolu.loadQuery(
      exclusionsQuery(entry.recurringConfigId)
    );

    const isNameChanged = newName !== entry.details.name;
    const isGroupChanged = newGroup !== entry.details.groupId;
    const isTagChanged = newTag !== entry.details.tagId;
    const isDateChanged =
      newDate && !dayjs(newDate).isSame(dayjs(entry.date), "day");

    const newValues = {
      name: decodeName(newName),
      amount: decodeAmount(Number(newAmount).toFixed(8).toString()),
      groupId: newGroup as TGroupId | null,
      tagId: newTag as TTagId | null,
      // date: isDateChanged ? newDate : entry.details.date,
    };

    if (isNameChanged && entry.recurringConfig?.originEntry?.entryId) {
      evolu.update("entry", {
        id: entry.recurringConfig.originEntry.entryId as TEntryId,
        name: decodeName(newName),
      });
    }

    if (isGroupChanged && entry.recurringConfig?.originEntry?.entryId) {
      evolu.update("entry", {
        id: entry.recurringConfig.originEntry.entryId as TEntryId,
        groupId: newGroup as TGroupId | null,
      });
    }

    if (isTagChanged && entry.recurringConfig?.originEntry?.entryId) {
      evolu.update("entry", {
        id: entry.recurringConfig.originEntry.entryId as TEntryId,
        tagId: newTag as TTagId | null,
      });
    }

    // user created an recurring entry and then edited it immediately with applyToSubsequents
    // we don't need to create a new entry and exclusion for that
    // keep the db clean and update the original entry
    if (
      applyToSubsequents &&
      allExclusions.rows.length === 0 &&
      entry.recurringConfig?.originEntry?.entryId &&
      entry.index === 1 &&
      entry.recurringConfig
    ) {
      evolu.update("entry", {
        id: entry.recurringConfig.originEntry.entryId as TEntryId,
        ...newValues,
      });

      // and if date is changed update the recurring config also
      if (isDateChanged) {
        evolu.update("recurringConfig", {
          id: entry.recurringConfigId,
          startDate: newDate,
          endDate:
            entry.recurringConfig.interval !== 0
              ? dayjs(newDate)
                  .add(
                    Number(entry.recurringConfig.every),
                    entry.recurringConfig.frequency
                  )
                  .toDate()
              : null,
        });
      }

      onComplete();
      return;
    }

    // if exlusion exists modify it
    if (entry.exclusionId && entry.details.entryId) {
      evolu.update("entry", {
        id: entry.details.entryId as TEntryId,
        ...newValues,
      });
      evolu.update("exclusion", {
        id: entry.exclusionId,
        modifiedDate: newDate,
        applyToSubsequents,
      });

      // if its's a ghost record (there is no edit yet)
    } else if (entry.recurringConfigId && !entry.exclusionId) {
      // create a new entry and exclusion for that date
      const newEntry = evolu.create("entry", {
        ...entry.details,
        ...newValues,
        fullfilled: false, // there is no edit yet, so it's not fullfilled
      });
      evolu.create("exclusion", {
        recurringId: entry.recurringConfigId,
        date: entry.date,
        modifiedDate: newDate,
        index: entry.index,
        reason: "modification",
        modifiedEntryId: newEntry.id,
        applyToSubsequents,
      });
    }

    if (applyToSubsequents) {
      allExclusions.rows
        .filter((ex) => dayjs(ex.date).isAfter(dayjs(entry.date)))
        .map((ex) => {
          evolu.update("exclusion", {
            id: ex.exclusionId,
            isDeleted: true,
          });
        });
    }
  }

  onComplete();
}
