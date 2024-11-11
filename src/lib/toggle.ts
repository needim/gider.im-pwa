import { type TEntryId, evolu } from "@/evolu-db";
import type { TPopulatedEntry } from "@/lib/populateEntries";

export function toggleFullfilled(entry: TPopulatedEntry) {
  // if it's an exclusion
  if (entry.exclusionId && entry.details.entryId) {
    evolu.update("entry", {
      id: entry.details.entryId as TEntryId,
      fullfilled: !entry.details.fullfilled,
    });
    // if it's a single entry
  } else if (entry.id && !entry.recurringConfigId) {
    evolu.update("entry", {
      id: entry.id,
      fullfilled: !entry.details.fullfilled,
    });
    // if its's a ghost record
  } else if (entry.recurringConfigId) {
    const newEntry = evolu.create("entry", {
      ...entry.details,
      fullfilled: !entry.details.fullfilled,
    });
    evolu.create("exclusion", {
      recurringId: entry.recurringConfigId,
      date: entry.date,
      modifiedDate: entry.date,
      index: entry.index,
      reason: "modification",
      applyToSubsequents: false,
      modifiedEntryId: newEntry.id,
    });
  }
}
