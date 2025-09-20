import type { TGroupId, TTagId } from "@/evolu-db";
import { storageKeys } from "@/lib/utils";
import dayjs, { type Dayjs } from "dayjs";

type EntryGroupInfo = {
        groupId: string;
        name: string;
};

type EntryTagInfo = {
        tagId: string;
        name: string;
        color: string | null;
};

export type TGroupRow = {
        id: string;
        name: string;
        icon: string | null;
};

export type TTagRow = {
        id: string;
        name: string;
        color: string | null;
        suggestId: string | null;
};

export type TEntryRow = {
        entryId: string;
        name: string;
        type: "income" | "expense" | "assets";
        currencyCode: string;
        amount: string;
        date: string;
        createdAt: string;
        fullfilled: boolean;
        recurringId: string | null;
        updatedAt: string | null;
        groupId: string | null;
        tagId: string | null;
        entryGroup: EntryGroupInfo | null;
        entryTag: EntryTagInfo | null;
};

export type TModifiedEntry = TEntryRow;

export type TExclusionRow = {
        exclusionId: string;
        recurringId: string;
        modifiedEntryId: string | null;
        date: string;
        reason: "deletion" | "modification";
        createdAt: string;
        modifiedEntry: TModifiedEntry | null;
};

export type TRecurringConfigRow = {
        recurringConfigId: string;
        frequency: "week" | "month" | "year";
        interval: number;
        every: number;
        startDate: string;
        endDate: string | null;
        createdAt: string;
        entry: TEntryRow | null;
        exclusions: TExclusionRow[];
};

type TNarrowedEntry = NonNullable<TEntryRow>;

type TOccurrence = {
        index: number;
        date: Date;
        exclusionId: string | null;
        modifiedEntry: TModifiedEntry | null;
};

export const generateOccurrences = (recurringConfig: TRecurringConfigRow, exclusions: TExclusionRow[]) => {
        const occurrences: TOccurrence[] = [];
        const MAX_OCCURRENCES = {
                year: 20,
                month: 240,
                week: 1248,
        } as const;

        if (!recurringConfig.startDate) {
                return occurrences;
        }

        const frequency = recurringConfig.frequency;
        const every = recurringConfig.every || 1;
        const startDate = dayjs(recurringConfig.startDate).set("hour", 12);

        let endDate = recurringConfig.interval
                ? startDate.add(recurringConfig.interval, frequency)
                : startDate.add(MAX_OCCURRENCES[frequency], frequency);

        if (recurringConfig.interval === 0) {
                endDate = startDate.add(MAX_OCCURRENCES[frequency], frequency);
        }

        let diff = endDate.diff(startDate, frequency);

        if (diff < 0) diff = 0;
        if (diff > MAX_OCCURRENCES[frequency]) diff = MAX_OCCURRENCES[frequency];

        let installment = 0;

        for (let i = 0; i < diff; i += every) {
                        installment++;
                        const currentDate = dayjs(startDate).add(i, frequency);

                        const exclusionForDay = exclusions.find((exclusion) =>
                                currentDate.isSame(dayjs(exclusion.date), "day"),
                        );

                        if (exclusionForDay?.reason === "deletion") {
                                continue;
                        }

                        occurrences.push({
                                index: installment,
                                date: currentDate.toDate(),
                                exclusionId: exclusionForDay ? exclusionForDay.exclusionId : null,
                                modifiedEntry: exclusionForDay?.modifiedEntry ?? null,
                        });
        }

        return occurrences;
};

export const populateEntries = (
        entries: Readonly<TEntryRow[]>,
        recurringConfigs: Readonly<TRecurringConfigRow[]>,
) => {
        const entriesList: Array<{
                id: string | null;
                recurringConfigId: string | null;
                exclusionId: string | null;
                index: number;
                interval: number;
                date: Date;
                config: TRecurringConfigRow | null;
                details: TNarrowedEntry;
        }> = [];

        recurringConfigs.forEach((config) => {
                const baseEntry = config.entry;
                if (!baseEntry) return;

                const exclusions = config.exclusions || [];
                const occurrences = generateOccurrences(config, exclusions);

                occurrences.forEach((occurrence) => {
                        const details = occurrence.modifiedEntry || {
                                ...baseEntry,
                                fullfilled: false,
                        };

                        entriesList.push({
                                id: (occurrence.modifiedEntry?.entryId as string) || null,
                                recurringConfigId: config.recurringConfigId,
                                exclusionId: occurrence.exclusionId,
                                index: occurrence.index,
                                interval: config.interval,
                                date: occurrence.date,
                                config,
                                details,
                        });
                });
        });

        entries.forEach((entry) => {
                entriesList.push({
                        id: entry.entryId,
                        recurringConfigId: null,
                        exclusionId: null,
                        index: 0,
                        interval: 0,
                        date: new Date(entry.date),
                        config: null,
                        details: entry,
                });
        });

        entriesList.sort((a, b) => a.date.getTime() - b.date.getTime());

        return entriesList;
};

export type TPopulatedEntry = ReturnType<typeof populateEntries>[number];

export const groupByCurrency = (entries: TPopulatedEntry[]) => {
        return entries.reduce(
                (acc, entry) => {
                        const currency = entry.details.currencyCode;
                        if (!acc[currency]) {
                                acc[currency] = [];
                        }
                        acc[currency].push(entry);
                        return acc;
                },
                {} as Record<string, TPopulatedEntry[]>,
        );
};

export const calculateTotals = (groupedEntries: Record<string, TPopulatedEntry[]>) => {
        return Object.entries(groupedEntries).reduce(
                (acc, [currency, grouped]) => {
                        acc[currency] = grouped.reduce((total, entry) => total + Number(entry.details.amount), 0);
                        return acc;
                },
                {} as Record<string, number>,
        );
};

export const calculatedFullfilledTotals = (groupedEntries: Record<string, TPopulatedEntry[]>) => {
        return Object.entries(groupedEntries).reduce(
                (acc, [currency, grouped]) => {
                        acc[currency] = grouped
                                .filter((entry) => entry.details.fullfilled)
                                .reduce((total, entry) => total + Number(entry.details.amount), 0);
                        return acc;
                },
                {} as Record<string, number>,
        );
};

type TCALCULATIONS_OUTPUT = Record<
        number,
        {
                month: Dayjs;
                income: TPopulatedEntry[];
                expense: TPopulatedEntry[];
                assets: TPopulatedEntry[];
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

export type TCALCULATIONS_OUTPUT_V2 = TCALCULATIONS_OUTPUT;

export const getCalculations_v2 = ({
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
        const CALC: TCALCULATIONS_OUTPUT_V2 = {};

        let month: Dayjs = viewportStartDate;
        const totalMonthCount = viewportEndDate.diff(viewportStartDate, "month");

        let filteredEntries = populatedEntries;

        if (groupFilters && groupFilters.length > 0) {
                filteredEntries = filteredEntries.filter((entry) =>
                        groupFilters.includes((entry.details.groupId as TGroupId | null) || "no-group"),
                );
        }

        if (tagFilters && tagFilters.length > 0) {
                filteredEntries = filteredEntries.filter((entry) =>
                        tagFilters.includes((entry.details.tagId as TTagId | null) || "no-tag"),
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
                                        actual: { income: 0, expense: 0, total: 0 },
                                        foresight: { income: 0, expense: 0, total: 0 },
                                },
                                actual: {},
                                foresight: {},
                        },
                };

                const monthEntries = filteredEntries.filter(
                        (entry) =>
                                dayjs(entry.date).month() === month.month() && dayjs(entry.date).year() === month.year(),
                );

                const currenciesUsed = new Set<string>();

                monthEntries.forEach((entry) => {
                        const currency = entry.details.currencyCode;
                        const type = entry.details.type;
                        const isFullfilled = !!entry.details.fullfilled;
                        const amount = Number(entry.details.amount);
                        const actualAmount = isFullfilled ? amount : 0;

                        if (type === "income") {
                                CALC[i].income.push(entry);
                        } else if (type === "expense") {
                                CALC[i].expense.push(entry);
                        } else {
                                CALC[i].assets.push(entry);
                        }

                        currenciesUsed.add(currency);

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

                        CALC[i].result.actual[currency] += type === "expense" ? -1 * actualAmount : actualAmount;
                        CALC[i].result.foresight[currency] += type === "expense" ? -1 * amount : amount;

                        CALC[i].result.inMainCurrency.actual[type === "expense" ? "expense" : "income"] += actualAmount;
                        CALC[i].result.inMainCurrency.foresight[type === "expense" ? "expense" : "income"] += amount;
                });

                const usesDifferentCurrency = Array.from(currenciesUsed).some((currency) => currency !== mainCurrency);

                if (!usesDifferentCurrency) {
                        CALC[i].result.inMainCurrency.actual.total =
                                CALC[i].result.inMainCurrency.actual.income - CALC[i].result.inMainCurrency.actual.expense;

                        CALC[i].result.inMainCurrency.foresight.total =
                                CALC[i].result.inMainCurrency.foresight.income - CALC[i].result.inMainCurrency.foresight.expense;
                } else if (Object.keys(rates).length > 0) {
                        CALC[i].result.inMainCurrency.actual.income = Object.entries(CALC[i].grouped.income).reduce(
                                (acc, [currency, data]) => acc + data.fullfilled * (rates[currency] ?? 0),
                                0,
                        );

                        CALC[i].result.inMainCurrency.actual.expense = Object.entries(CALC[i].grouped.expense).reduce(
                                (acc, [currency, data]) => acc + data.fullfilled * (rates[currency] ?? 0),
                                0,
                        );

                        CALC[i].result.inMainCurrency.actual.total =
                                CALC[i].result.inMainCurrency.actual.income - CALC[i].result.inMainCurrency.actual.expense;

                        CALC[i].result.inMainCurrency.foresight.income = Object.entries(CALC[i].grouped.income).reduce(
                                (acc, [currency, data]) => acc + data.expected * (rates[currency] ?? 0),
                                0,
                        );

                        CALC[i].result.inMainCurrency.foresight.expense = Object.entries(CALC[i].grouped.expense).reduce(
                                (acc, [currency, data]) => acc + data.expected * (rates[currency] ?? 0),
                                0,
                        );

                        CALC[i].result.inMainCurrency.foresight.total =
                                CALC[i].result.inMainCurrency.foresight.income -
                                CALC[i].result.inMainCurrency.foresight.expense;
                }
        }

        return CALC;
};

export function getEntries(obj: Record<string, number>) {
        const mainCurrency = localStorage.getItem(storageKeys.mainCurrency) || "TRY";
        return Object.entries(obj).length ? Object.entries(obj) : [[mainCurrency, 0]];
}

export function sum(a: number, b: number) {
        return a + b;
}
