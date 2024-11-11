import type { TGroupId, TTagId } from "@/evolu-db";
import type { TPopulatedEntry } from "@/lib/populateEntries";
import dayjs, { type Dayjs } from "dayjs";

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
