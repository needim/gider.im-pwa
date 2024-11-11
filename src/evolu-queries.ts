import {
  type TAmountString,
  type TEntryId,
  type TExclusionId,
  type TGroupId,
  type TRecurringConfigId,
  type TTagId,
  decodeAmount,
  decodeBoolean,
  decodeName,
  evolu,
} from "@/evolu-db";
import { storageKeys } from "@/lib/utils";
import {
  type ExtractRow,
  type NotNull,
  type SqliteBoolean,
  cast,
  jsonArrayFrom,
  jsonObjectFrom,
} from "@evolu/react";
import dayjs, { type Dayjs } from "dayjs";

type TNarrowed = {
  name: NotNull;
  date: NotNull;
  amount: NotNull;
  fullfilled: NotNull;
  currencyCode: NotNull;
  type: NotNull;
};

const queryOptions = {
  logQueryExecutionTime: process.env.NODE_ENV === "development",
  logExplainQueryPlan: process.env.NODE_ENV === "development",
};

export const recurringConfigsQuery = (rId: TRecurringConfigId | null = null) =>
  evolu.createQuery(
    (db) =>
      db
        .selectFrom("recurringConfig as r")
        .select([
          "r.id as recurringConfigId",
          "r.frequency",
          "r.interval",
          "r.every",
          "r.startDate",
          "r.endDate",
          "r.createdAt",
        ])
        .where("r.isDeleted", "is not", cast(true))
        .$if(!!rId, (qb) => qb.where("r.id", "=", rId))
        .$narrowType<
          TNarrowed & {
            frequency: NotNull;
          }
        >()
        .orderBy("r.createdAt")
        .select((eb) => [
          jsonArrayFrom(
            eb
              .selectFrom("exclusion")
              .select([
                "id",
                "recurringId",
                "date",
                "modifiedDate",
                "index",
                "reason",
                "applyToSubsequents",
                "modifiedEntryId",
              ])
              .whereRef("r.id", "=", "exclusion.recurringId")
              .select((eb) => [
                jsonObjectFrom(
                  eb
                    .selectFrom("entry as modifiedEntry")
                    .select([
                      "id as entryId",
                      "name",
                      "type",
                      "currencyCode",
                      "amount",
                      "date",
                      "createdAt",
                      "fullfilled",
                      "recurringId",
                      "updatedAt",
                      "groupId",
                      "tagId",
                    ])
                    .$narrowType<TNarrowed>()
                    .select((eb) => [
                      jsonObjectFrom(
                        eb
                          .selectFrom("entryGroup")
                          .select(["id as groupId", "name"])
                          .where("entryGroup.isDeleted", "is not", cast(true))
                          .whereRef(
                            "entryGroup.id",
                            "=",
                            "modifiedEntry.groupId"
                          )
                      ).as("entryGroup"),
                    ])
                    .select((eb) => [
                      jsonObjectFrom(
                        eb
                          .selectFrom("entryTag")
                          .select(["id as tagId", "name", "color"])
                          .where("entryTag.isDeleted", "is not", cast(true))
                          .whereRef("entryTag.id", "=", "modifiedEntry.tagId")
                      ).as("entryTag"),
                    ])
                    .whereRef(
                      "modifiedEntry.id",
                      "=",
                      "exclusion.modifiedEntryId"
                    )
                ).as("modifiedEntry"),
              ])
              .where("exclusion.isDeleted", "is not", cast(true))
          ).as("exclusions"),
        ])
        .select((eb) => [
          jsonObjectFrom(
            eb
              .selectFrom("entry")
              .select([
                "id as entryId",
                "name",
                "type",
                "currencyCode",
                "amount",
                "date",
                "createdAt",
                "fullfilled",
                "recurringId",
                "updatedAt",
                "groupId",
                "tagId",
              ])
              .select((eb) => [
                jsonObjectFrom(
                  eb
                    .selectFrom("entryGroup")
                    .select(["id as groupId", "name"])
                    .where("entryGroup.isDeleted", "is not", cast(true))
                    .whereRef("entryGroup.id", "=", "entry.groupId")
                ).as("entryGroup"),
              ])
              .select((eb) => [
                jsonObjectFrom(
                  eb
                    .selectFrom("entryTag")
                    .select(["id as tagId", "name", "color"])
                    .where("entryTag.isDeleted", "is not", cast(true))
                    .whereRef("entryTag.id", "=", "entry.tagId")
                ).as("entryTag"),
              ])
              .whereRef("r.id", "=", "entry.recurringId")
              .where("entry.isDeleted", "is not", cast(true))
              .orderBy("entry.date", "asc")
              .$narrowType<TNarrowed>()
          ).as("originEntry"),
        ]),
    queryOptions
  );
export type TRecurringConfigRow = ExtractRow<
  ReturnType<typeof recurringConfigsQuery>
>;

export const groupsQuery = evolu.createQuery(
  (db) =>
    db
      .selectFrom("entryGroup")
      .select(["id", "name"])
      .where("isDeleted", "is not", cast(true))
      .orderBy("createdAt"),
  queryOptions
);

export type TGroupsRow = Readonly<ExtractRow<typeof groupsQuery>>;

export const tagsQuery = evolu.createQuery(
  (db) =>
    db
      .selectFrom("entryTag")
      .select(["id", "name", "color", "suggestId"])
      .where("isDeleted", "is not", cast(true))
      .where("name", "is not", null)
      .where("color", "is not", null)
      .$narrowType<{ name: NotNull }>()
      .orderBy("createdAt"),
  queryOptions
);

export type TTagsRow = Readonly<ExtractRow<typeof tagsQuery>>;

export const entriesQuery = (eId: TEntryId | null = null) =>
  evolu.createQuery(
    (db) =>
      db
        .selectFrom("entry")
        .select([
          "id as entryId",
          "name",
          "type",
          "currencyCode",
          "amount",
          "date",
          "createdAt",
          "fullfilled",
          "recurringId",
          "updatedAt",
          "groupId",
          "tagId",
        ])
        .select((eb) => [
          jsonObjectFrom(
            eb
              .selectFrom("entryGroup")
              .select(["id as groupId", "name"])
              .where("entryGroup.isDeleted", "is not", cast(true))
              .whereRef("entryGroup.id", "=", "entry.groupId")
          ).as("entryGroup"),
        ])
        .select((eb) => [
          jsonObjectFrom(
            eb
              .selectFrom("entryTag")
              .select(["id as tagId", "name", "color"])
              .where("entryTag.isDeleted", "is not", cast(true))
              .whereRef("entryTag.id", "=", "entry.tagId")
          ).as("entryTag"),
        ])
        .where("isDeleted", "is not", cast(true))
        .$if(!!eId, (qb) => qb.where("id", "=", eId))
        .where("name", "is not", null)
        .where("type", "is not", null)
        .where("amount", "is not", null)
        .where("recurringId", "is", null)
        .$narrowType<TNarrowed>()
        .orderBy("date", "asc"),
    queryOptions
  );

export const deleteGroup = (groupId: TGroupId) => {
  evolu.update("entryGroup", { id: groupId, isDeleted: true });
};

export const deleteTag = (tagId: TTagId) => {
  evolu.update("entryTag", { id: tagId, isDeleted: true });
};

export const exclusionsQuery = (recurringId: TRecurringConfigId) =>
  evolu.createQuery(
    (db) =>
      db
        .selectFrom("exclusion")
        .select([
          "id as exclusionId",
          "recurringId",
          "modifiedEntryId",
          "applyToSubsequents",
          "date",
          "modifiedDate",
          "index",
          "reason",
        ])
        .where("isDeleted", "is not", cast(true))
        .where("recurringId", "is", recurringId)
        .$narrowType<{
          recurringId: NotNull;
          reason: NotNull;
          date: NotNull;
        }>()
        .orderBy("createdAt"),
    queryOptions
  );

export type TEntryRow = ExtractRow<ReturnType<typeof entriesQuery>>;
export type TExclusionRow = TRecurringConfigRow["exclusions"][number];
export type TModifiedEntry = TExclusionRow["modifiedEntry"];

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

  for (let i = 0; i < diff; i += every) {
    const currDate = dayjs(startDate).add(i, frequency);

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
        index: i + 1,
        date: occDate,
        exclusionId: isModified ? isModified.id : null,
        modifiedEntry: modEntry,
      });
    }
  }

  // console.timeEnd("generateOccurrences");
  return occurences;
};

// needs a hard refactor
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

export type TPopulatedEntry = ReturnType<typeof populateEntries>[number];
export const groupByCurrency = (entries: TPopulatedEntry[]) => {
  return entries.reduce((acc, entry) => {
    const currency = entry.details.currencyCode;
    if (!acc[currency]) {
      acc[currency] = [];
    }
    acc[currency].push(entry);
    return acc;
  }, {} as Record<string, TPopulatedEntry[]>);
};

export const calculateTotals = (
  groupedEntries: Record<string, TPopulatedEntry[]>
) => {
  return Object.entries(groupedEntries).reduce((acc, [currency, entries]) => {
    acc[currency] = entries.reduce(
      (acc, e) => acc + Number(e.details.amount),
      0
    );
    return acc;
  }, {} as Record<string, number>);
};

export const calculatedFullfilledTotals = (
  groupedEntries: Record<string, TPopulatedEntry[]>
) => {
  return Object.entries(groupedEntries).reduce((acc, [currency, entries]) => {
    acc[currency] = entries
      .filter((e) => e.details.fullfilled)
      .reduce((acc, e) => acc + Number(e.details.amount), 0);
    return acc;
  }, {} as Record<string, number>);
};

export type TCALCULATIONS_OUTPUT = Record<
  number,
  {
    month: Dayjs;
    income: TPopulatedEntry[];
    expense: TPopulatedEntry[];
    assets: TPopulatedEntry[]; // not implemented yet
    grouped: {
      income: Record<
        string,
        {
          entries: TPopulatedEntry[];
          expected: number;
          fullfilled: number;
          remaining: number;
        }
      >;
      expense: Record<
        string,
        {
          entries: TPopulatedEntry[];
          expected: number;
          fullfilled: number;
          remaining: number;
        }
      >;
    };
    // ---
    result: {
      inMainCurrency: {
        actual: {
          income: number;
          expense: number;
          total: number;
        };
        foresight: {
          income: number;
          expense: number;
          total: number;
        };
      };
      actual: Record<string, number>;
      foresight: Record<string, number>;
    };
  }
>;

export const getCalculations = ({
  rates,
  viewportStartDate,
  viewportEndDate,
  populatedEntries,
  groupFilters,
  tagFilters,
  mainCurrency,
}: {
  rates: Record<string, number>;
  viewportStartDate: dayjs.Dayjs;
  viewportEndDate: dayjs.Dayjs;
  populatedEntries: TPopulatedEntry[];
  groupFilters?: (TGroupId | "no-group")[];
  tagFilters?: (TTagId | "no-tag")[];
  mainCurrency: string;
}) => {
  // console.time("getCalculations_v2");
  const CALC: TCALCULATIONS_OUTPUT = {};

  let month: Dayjs = viewportStartDate;
  const totalMonthCount = viewportEndDate.diff(viewportStartDate, "month");

  if (groupFilters && groupFilters.length > 0) {
    populatedEntries = populatedEntries.filter((entry) =>
      groupFilters.includes(entry.details.groupId || "no-group")
    );
  }

  if (tagFilters && tagFilters.length > 0) {
    populatedEntries = populatedEntries.filter((entry) =>
      tagFilters.includes(entry.details.tagId || "no-tag")
    );
  }

  for (let i = 0; i <= totalMonthCount; i++) {
    month = viewportStartDate.add(i, "month");
    CALC[i] = {
      month,
      income: [],
      expense: [],
      assets: [],
      grouped: {
        income: {},
        expense: {},
      },
      result: {
        inMainCurrency: {
          actual: {
            income: 0,
            expense: 0,
            total: 0,
          },
          foresight: { income: 0, expense: 0, total: 0 },
        },
        actual: {},
        foresight: {},
      },
    };

    const monthEntries = populatedEntries.filter(
      (e) =>
        dayjs(e.date).month() === month.month() &&
        dayjs(e.date).year() === month.year()
    );

    const allUsedCurrencies = new Set<string>();

    monthEntries.map((entry) => {
      const currency = entry.details.currencyCode;
      const type = entry.details.type;
      const isFullfilled = !!entry.details.fullfilled;
      const amount = Number(entry.details.amount);
      const actualAmount = isFullfilled ? amount : 0;

      CALC[i][type].push(entry);

      allUsedCurrencies.add(currency);

      CALC[i].grouped[type][currency] ??= {
        entries: [],
        expected: 0,
        fullfilled: 0,
        remaining: 0,
      };

      CALC[i].grouped[type][currency].entries.push(entry);
      CALC[i].grouped[type][currency].expected += amount;
      CALC[i].grouped[type][currency].fullfilled += isFullfilled ? amount : 0;
      CALC[i].grouped[type][currency].remaining += isFullfilled ? 0 : amount;

      CALC[i].result.actual[currency] ??= 0;
      CALC[i].result.foresight[currency] ??= 0;

      CALC[i].result.actual[currency] +=
        type === "expense" ? -1 * actualAmount : actualAmount;
      CALC[i].result.foresight[currency] +=
        type === "expense" ? -1 * amount : amount;

      CALC[i].result.inMainCurrency.actual[type] += actualAmount;
      CALC[i].result.inMainCurrency.foresight[type] += amount;
    });

    const isDifferentCurrencyUsed = Array.from(allUsedCurrencies).some(
      (currency) => currency !== mainCurrency
    );

    if (!isDifferentCurrencyUsed) {
      CALC[i].result.inMainCurrency.actual.total =
        CALC[i].result.inMainCurrency.actual.income -
        CALC[i].result.inMainCurrency.actual.expense;

      CALC[i].result.inMainCurrency.foresight.total =
        CALC[i].result.inMainCurrency.foresight.income -
        CALC[i].result.inMainCurrency.foresight.expense;
    } else {
      if (Object.keys(rates).length > 0) {
        CALC[i].result.inMainCurrency.actual.income = Object.entries(
          CALC[i].grouped.income
        ).reduce((acc, [currency, data]) => {
          acc += data.fullfilled * rates[currency];
          return acc;
        }, 0);

        CALC[i].result.inMainCurrency.actual.expense = Object.entries(
          CALC[i].grouped.expense
        ).reduce((acc, [currency, data]) => {
          acc += data.fullfilled * rates[currency];
          return acc;
        }, 0);

        CALC[i].result.inMainCurrency.actual.total =
          CALC[i].result.inMainCurrency.actual.income -
          CALC[i].result.inMainCurrency.actual.expense;

        CALC[i].result.inMainCurrency.foresight.income = Object.entries(
          CALC[i].grouped.income
        ).reduce((acc, [currency, data]) => {
          acc += data.expected * rates[currency];
          return acc;
        }, 0);

        CALC[i].result.inMainCurrency.foresight.expense = Object.entries(
          CALC[i].grouped.expense
        ).reduce((acc, [currency, data]) => {
          acc += data.expected * rates[currency];
          return acc;
        }, 0);

        CALC[i].result.inMainCurrency.foresight.total =
          CALC[i].result.inMainCurrency.foresight.income -
          CALC[i].result.inMainCurrency.foresight.expense;
      }
    }
  }
  // console.timeEnd("getCalculations_v2");
  return CALC;
};

export function getEntries<T extends object>(obj: T) {
  const mainCurrency = localStorage.getItem(storageKeys.mainCurrency) || "TRY";
  return Object.entries(obj).length
    ? Object.entries(obj)
    : [[mainCurrency, "0.00000000"]];
}

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

export async function getEntryHistory(entry: TPopulatedEntry) {
  if (!entry.recurringConfigId) return [];

  const recurringConfig = await evolu.loadQuery(
    recurringConfigsQuery(entry.recurringConfigId)
  );

  const populatedEntries = populateEntries([], recurringConfig.rows);

  return populatedEntries;
}

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

export function sum(a: number, b: number) {
  return a + b;
}
