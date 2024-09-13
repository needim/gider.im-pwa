import {
	type TEntryId,
	type TExclusionId,
	type TGroupId,
	type TRecurringConfigId,
	type TTagId,
	decodeAmount,
	decodeName,
	evolu,
} from "@/evolu-db";
import { storageKeys } from "@/lib/utils";
import {
	type ExtractRow,
	type NotNull,
	cast,
	jsonArrayFrom,
	jsonObjectFrom,
} from "@evolu/react";
import dayjs from "dayjs";

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

export const recurringConfigsQuery = evolu.createQuery(
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
						.select(["id", "recurringId", "date", "reason", "modifiedEntryId"])
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
									.select((eb) => [
										jsonObjectFrom(
											eb
												.selectFrom("entryGroup")
												.select(["id as groupId", "name"])
												.where("entryGroup.isDeleted", "is not", cast(true))
												.whereRef(
													"entryGroup.id",
													"=",
													"modifiedEntry.groupId",
												),
										).as("entryGroup"),
									])
									.select((eb) => [
										jsonObjectFrom(
											eb
												.selectFrom("entryTag")
												.select(["id as tagId", "name", "color"])
												.where("entryTag.isDeleted", "is not", cast(true))
												.whereRef("entryTag.id", "=", "modifiedEntry.tagId"),
										).as("entryTag"),
									])
									.$narrowType<TNarrowed>()
									.whereRef(
										"modifiedEntry.id",
										"=",
										"exclusion.modifiedEntryId",
									),
							).as("modifiedEntry"),
						])
						.where("exclusion.isDeleted", "is not", cast(true)),
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
									.whereRef("entryGroup.id", "=", "entry.groupId"),
							).as("entryGroup"),
						])
						.select((eb) => [
							jsonObjectFrom(
								eb
									.selectFrom("entryTag")
									.select(["id as tagId", "name", "color"])
									.where("entryTag.isDeleted", "is not", cast(true))
									.whereRef("entryTag.id", "=", "entry.tagId"),
							).as("entryTag"),
						])
						.whereRef("r.id", "=", "entry.recurringId")
						.where("entry.isDeleted", "is not", cast(true))
						.orderBy("entry.date", "asc")
						.$narrowType<TNarrowed>(),
				).as("entry"),
			]),
	queryOptions,
);
export type TRecurringConfigRow = ExtractRow<typeof recurringConfigsQuery>;

export const groupsQuery = evolu.createQuery(
	(db) =>
		db
			.selectFrom("entryGroup")
			.select(["id", "name"])
			.where("isDeleted", "is not", cast(true))
			.orderBy("createdAt"),
	queryOptions,
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
	queryOptions,
);

export type TTagsRow = Readonly<ExtractRow<typeof tagsQuery>>;

export const entriesQuery = evolu.createQuery(
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
						.whereRef("entryGroup.id", "=", "entry.groupId"),
				).as("entryGroup"),
			])
			.select((eb) => [
				jsonObjectFrom(
					eb
						.selectFrom("entryTag")
						.select(["id as tagId", "name", "color"])
						.where("entryTag.isDeleted", "is not", cast(true))
						.whereRef("entryTag.id", "=", "entry.tagId"),
				).as("entryTag"),
			])
			.where("isDeleted", "is not", cast(true))
			.where("name", "is not", null)
			.where("type", "is not", null)
			.where("amount", "is not", null)
			.where("recurringId", "is", null)
			.$narrowType<TNarrowed>()
			.orderBy("date", "asc"),
	queryOptions,
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
					"date",
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
		queryOptions,
	);

export type TEntryRow = ExtractRow<typeof entriesQuery>;
export type TExclusionRow = TRecurringConfigRow["exclusions"][number];
export type TModifiedEntry = TExclusionRow["modifiedEntry"];

export const generateOccurrences = (
	recurringConfig: TRecurringConfigRow,
	exclusions: TExclusionRow[],
) => {
	const occurences = [];
	const MAX_OCCURENCES = {
		year: 1,
		month: 24,
		week: 52,
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

	let installment = 0;
	for (let i = 0; i < diff; i += every) {
		installment++;
		const currDate = dayjs(startDate).add(i, frequency);

		const isExcluded = exclusions.some(
			(e) => currDate.isSame(dayjs(e.date), "day") && e.reason === "deletion",
		);

		const isModified = exclusions.find(
			(e) =>
				currDate.isSame(dayjs(e.date), "day") && e.reason === "modification",
		);

		if (!isExcluded) {
			occurences.push({
				index: installment,
				date: currDate.toDate(),
				exclusionId: isModified ? isModified.id : null,
				modifiedEntry: isModified ? isModified.modifiedEntry : null,
			});
		}
	}

	return occurences;
};

// needs a hard refactor
export const populateEntries = (
	entries: Readonly<TEntryRow[]>,
	recurringConfigs: Readonly<TRecurringConfigRow[]>,
) => {
	const entriesList: Array<{
		id: null | TEntryId;
		recurringConfigId: null | TRecurringConfigId;
		exclusionId: null | TExclusionId;
		index: number;
		interval: number;
		date: Date;
		config: null | TConfig;
		details: NonNullable<TEntryRow | TModifiedEntry>;
	}> = [];
	type TConfig = (typeof recurringConfigs)[0];

	recurringConfigs.forEach((recurringEntry) => {
		const exclusions = recurringEntry.exclusions || [];
		const occurrences = generateOccurrences(recurringEntry, exclusions);
		occurrences.forEach((occ) => {
			entriesList.push({
				recurringConfigId: recurringEntry.recurringConfigId,
				id: (occ.modifiedEntry?.entryId as TEntryId) || null,
				exclusionId: (occ.exclusionId as TExclusionId) || null,
				index: occ.index,
				interval: recurringEntry.interval!,
				config: recurringEntry,
				date: occ.date,
				details:
					occ.modifiedEntry ||
					({
						...recurringEntry.entry,
						fullfilled: cast(false),
					} as NonNullable<TEntryRow>),
			});
		});
	});

	entries.forEach((entry) => {
		entriesList.push({
			id: entry.entryId,
			index: 0,
			interval: 0,
			exclusionId: null,
			recurringConfigId: null,
			config: null,
			date: cast(entry.date!),
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

export const calculateTotals = (
	groupedEntries: Record<string, TPopulatedEntry[]>,
) => {
	return Object.entries(groupedEntries).reduce(
		(acc, [currency, entries]) => {
			acc[currency] = entries.reduce(
				(acc, e) => acc + Number(e.details.amount),
				0,
			);
			return acc;
		},
		{} as Record<string, number>,
	);
};

export const calculatedFullfilledTotals = (
	groupedEntries: Record<string, TPopulatedEntry[]>,
) => {
	return Object.entries(groupedEntries).reduce(
		(acc, [currency, entries]) => {
			acc[currency] = entries
				.filter((e) => e.details.fullfilled)
				.reduce((acc, e) => acc + Number(e.details.amount), 0);
			return acc;
		},
		{} as Record<string, number>,
	);
};

// needs a hard refactor
export const getCalculations = ({
	rates,
	viewportStartDate,
	viewportEndDate,
	populatedEntries,
	groupFilters,
	tagFilters,
}: {
	rates: Record<string, number>;
	viewportStartDate: dayjs.Dayjs;
	viewportEndDate: dayjs.Dayjs;
	populatedEntries: TPopulatedEntry[];
	groupFilters?: (TGroupId | "no-group")[];
	tagFilters?: (TTagId | "no-tag")[];
	monthFilter?: string;
}) => {
	const CALCULATIONS: Record<
		number,
		{
			income: TPopulatedEntry[];
			expense: TPopulatedEntry[];
			assets: TPopulatedEntry[]; // not implemented yet
			// ---
			incomesGroupedByCurrency: Record<string, TPopulatedEntry[]>;
			totalExpectedIncomeGroupedByCurrency: Record<string, number>;
			totalReceivedIncomeGroupedByCurrency: Record<string, number>;
			totalRemainingIncomeGroupedByCurrency: Record<string, number>;
			// ---
			expensesGroupedByCurrency: Record<string, TPopulatedEntry[]>;
			totalExpectedExpenseGroupedByCurrency: Record<string, number>;
			totalPaidExpenseGroupedByCurrency: Record<string, number>;
			totalRemainingExpenseGroupedByCurrency: Record<string, number>;
			// ---
			result: {
				inMainCurrency: {
					actual: number;
					foresight: number;
				};
				actual: Record<string, number>;
				foresight: Record<string, number>;
			};
			// ---
			hasAnyFullfilled: boolean;
		}
	> = {};

	const mainCurrency = localStorage.getItem(storageKeys.mainCurrency) || "TRY";

	if (
		(groupFilters && groupFilters.length > 0) ||
		(tagFilters && tagFilters.length > 0)
	) {
		if (groupFilters && groupFilters.length > 0) {
			populatedEntries = populatedEntries.filter((entry) =>
				groupFilters.includes(entry.details.groupId || "no-group"),
			);
		}

		if (tagFilters && tagFilters.length > 0) {
			populatedEntries = populatedEntries.filter((entry) =>
				tagFilters.includes(entry.details.tagId || "no-tag"),
			);
		}
	}

	const totalMonthCount = viewportEndDate.diff(viewportStartDate, "month");

	for (let i = 0; i <= totalMonthCount; i++) {
		const month = viewportStartDate.add(i, "month");
		const monthEntries = populatedEntries.filter(
			(e) =>
				dayjs(e.date).month() === month.month() &&
				dayjs(e.date).year() === month.year(),
		);

		const income = monthEntries.filter((e) => e.details.type === "income");
		const expense = monthEntries.filter((e) => e.details.type === "expense");

		const hasAnyFullfilled = monthEntries.some((e) => e.details.fullfilled);

		const incomesGroupedByCurrency = groupByCurrency(income);
		const expensesGroupedByCurrency = groupByCurrency(expense);

		const totalExpectedIncomeGroupedByCurrency = calculateTotals(
			incomesGroupedByCurrency,
		);
		const totalReceivedIncomeGroupedByCurrency = calculatedFullfilledTotals(
			incomesGroupedByCurrency,
		);

		const totalExpectedExpenseGroupedByCurrency = calculateTotals(
			expensesGroupedByCurrency,
		);

		const totalPaidExpenseGroupedByCurrency = calculatedFullfilledTotals(
			expensesGroupedByCurrency,
		);

		const resultGroupedByCurrencyForesight = Object.entries(
			totalExpectedIncomeGroupedByCurrency,
		).reduce(
			(acc, [currency]) => {
				acc[currency] =
					(totalExpectedIncomeGroupedByCurrency[currency] || 0) -
					(totalExpectedExpenseGroupedByCurrency[currency] || 0);

				return acc;
			},
			{} as Record<string, number>,
		);

		const resultGroupedByCurrency = Object.entries(
			totalExpectedIncomeGroupedByCurrency,
		).reduce(
			(acc, [currency]) => {
				acc[currency] =
					(totalReceivedIncomeGroupedByCurrency[currency] || 0) -
					(totalPaidExpenseGroupedByCurrency[currency] || 0);

				return acc;
			},
			{} as Record<string, number>,
		);

		const missingCurrencies = Object.keys(
			totalExpectedExpenseGroupedByCurrency,
		).filter((currency) => !resultGroupedByCurrency.hasOwnProperty(currency));

		const missingCurrenciesForsight = Object.keys(
			totalExpectedExpenseGroupedByCurrency,
		).filter(
			(currency) => !resultGroupedByCurrencyForesight.hasOwnProperty(currency),
		);

		missingCurrencies.forEach((currency) => {
			resultGroupedByCurrency[currency] =
				-totalPaidExpenseGroupedByCurrency[currency];
		});

		missingCurrenciesForsight.forEach((currency) => {
			resultGroupedByCurrencyForesight[currency] =
				-totalExpectedExpenseGroupedByCurrency[currency];
		});

		const allUsedCurrencies = new Set([
			...Object.keys(incomesGroupedByCurrency),
			...Object.keys(expensesGroupedByCurrency),
		]);

		const isDifferentCurrencyUsed = Array.from(allUsedCurrencies).some(
			(currency) => currency !== mainCurrency,
		);

		let inMainCurrencyActual = 0;
		let inMainCurrencyForesight = 0;
		if (isDifferentCurrencyUsed && Object.keys(rates).length > 0) {
			inMainCurrencyActual = Object.entries(resultGroupedByCurrency).reduce(
				(acc, [currency, amount]) => {
					if (rates[currency]) acc += amount * rates[currency];
					return acc;
				},
				0,
			);

			inMainCurrencyForesight = Object.entries(
				resultGroupedByCurrencyForesight,
			).reduce((acc, [currency, amount]) => {
				if (rates[currency]) acc += amount * rates[currency];
				return acc;
			}, 0);
		}

		const inMainCurrency = isDifferentCurrencyUsed
			? {
					actual: inMainCurrencyActual,
					foresight: inMainCurrencyForesight,
				}
			: {
					actual: resultGroupedByCurrency[mainCurrency],
					foresight: resultGroupedByCurrencyForesight[mainCurrency],
				};

		CALCULATIONS[i] = {
			income,
			expense,
			assets: [],
			incomesGroupedByCurrency,
			totalExpectedIncomeGroupedByCurrency,
			totalReceivedIncomeGroupedByCurrency,
			totalRemainingIncomeGroupedByCurrency: Object.entries(
				totalExpectedIncomeGroupedByCurrency,
			).reduce(
				(acc, [currency, amount]) => {
					acc[currency] =
						amount - (totalReceivedIncomeGroupedByCurrency[currency] || 0);
					return acc;
				},
				{} as Record<string, number>,
			),
			expensesGroupedByCurrency,
			totalExpectedExpenseGroupedByCurrency,
			totalPaidExpenseGroupedByCurrency,
			totalRemainingExpenseGroupedByCurrency: Object.entries(
				totalExpectedExpenseGroupedByCurrency,
			).reduce(
				(acc, [currency, amount]) => {
					acc[currency] =
						amount - (totalPaidExpenseGroupedByCurrency[currency] || 0);
					return acc;
				},
				{} as Record<string, number>,
			),
			result: {
				inMainCurrency,
				actual: resultGroupedByCurrency,
				foresight: resultGroupedByCurrencyForesight,
			},
			hasAnyFullfilled,
		};
	}
	return CALCULATIONS;
};

export type TCalculations = ReturnType<typeof getCalculations>;

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
			reason: "modification",
			modifiedEntryId: newEntry.id,
		});
	}
}

export async function deleteEntry(
	entry: TPopulatedEntry,
	withSubsequents = false,
	onComplete: () => void = () => {},
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
			reason: "deletion",
			modifiedEntryId: null,
		});
	}

	if (withSubsequents && entry.recurringConfigId) {
		const allExclusions = await evolu.loadQuery(
			exclusionsQuery(entry.recurringConfigId),
		);

		// mark deletion to all exclusions after this date
		allExclusions.rows
			.filter((ex) => dayjs(ex.date).isAfter(dayjs(entry.date)))
			.map((ex) => {
				evolu.update("exclusion", {
					id: ex.exclusionId,
					reason: "deletion",
				});
			});

		// modify main entry's endDate and internal
		evolu.update("recurringConfig", {
			id: entry.recurringConfigId,
			endDate: entry.date,
			every: entry.config?.every || 1,
			interval: entry.index - 1,
			isDeleted: entry.index - 1 === 0, // if it's the last one, mark as deleted
		});
	}

	setTimeout(() => {
		// we need to wait for the dialog to close
		// because the entry is still open
		onComplete();
	}, 200);
}

export async function editEntry(
	entry: TPopulatedEntry,
	newName: string,
	newAmount: string,
	newGroup: string | null,
	newTag: string | null,
	onComplete: () => void,
	applyToSubsequents = false,
) {
	if (!newName || newName.length === 0) return;
	if (!newAmount || newAmount.length === 0) return;

	newGroup = newGroup === "" ? null : newGroup;
	newTag = newTag === "" ? null : newTag;

	const newValues = {
		name: decodeName(newName),
		amount: decodeAmount(Number(newAmount).toFixed(8).toString()),
		groupId: newGroup as TGroupId | null,
		tagId: newTag as TTagId | null,
	};

	// if it's an exclusion
	if (entry.exclusionId && entry.details.entryId) {
		evolu.update("entry", {
			id: entry.details.entryId as TEntryId,
			...newValues,
		});
		// if it's a single entry
	} else if (entry.id && !entry.recurringConfigId) {
		evolu.update("entry", {
			id: entry.id,
			...newValues,
		});
		// if its's a ghost record
	} else if (entry.recurringConfigId && !entry.exclusionId) {
		// create a new entry and exclusion for that date
		const newEntry = evolu.create("entry", {
			...entry.details,
			...newValues,
			fullfilled: false,
		});
		evolu.create("exclusion", {
			recurringId: entry.recurringConfigId,
			date: entry.date,
			reason: "modification",
			modifiedEntryId: newEntry.id,
		});
	}

	if (applyToSubsequents && entry.recurringConfigId && entry.config) {
		const allExclusions = await evolu.loadQuery(
			exclusionsQuery(entry.recurringConfigId),
		);

		// if we are modifiying a main entry and there is no occurrences
		// just update the main entry
		if (
			allExclusions.rows.length === 0 &&
			entry.details.entryId
			// && entry.index === 1
		) {
			evolu.update("entry", {
				id: entry.details.entryId as TEntryId,
				...newValues,
			});

			onComplete();
			return;
		}

		// mark deletion to all exclusions after this date
		allExclusions.rows
			.filter((ex) => dayjs(ex.date).isAfter(dayjs(entry.date)))
			.map((ex) => {
				evolu.update("exclusion", {
					id: ex.exclusionId,
					reason: "deletion",
				});
			});

		// delete self
		evolu.create("exclusion", {
			recurringId: entry.recurringConfigId!,
			date: entry.date,
			reason: "deletion",
		});

		// stop old recurring config and delete if needed
		evolu.update("recurringConfig", {
			id: entry.recurringConfigId,
			endDate: entry.date,
			every: entry.config.every || 1,
			interval: entry.index - 1,
			isDeleted: entry.index - 1 === 0,
		});

		// create new recurring config
		const newRecurring = evolu.create("recurringConfig", {
			...entry.config,
			startDate: entry.date,
			endDate: entry.config.endDate,
			every: entry.config.every || 1,
			interval: entry.config.interval
				? entry.config.interval - entry.index + 1
				: 0,
		});

		// new entry
		const newModifiedEntry = evolu.create("entry", {
			...entry.details,
			...newValues,
			fullfilled: cast(!!entry.details.fullfilled),
			recurringId: newRecurring.id,
		});

		// create new exclusion
		evolu.create("exclusion", {
			recurringId: newRecurring.id,
			date: entry.date,
			reason: "modification",
			modifiedEntryId: newModifiedEntry.id,
		});
	}

	onComplete();
}
