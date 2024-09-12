import { ScreensContext } from "@/contexts/screens";
import type { TGroupId, TTagId } from "@/evolu-db";
import {
	entriesQuery,
	getCalculations,
	populateEntries,
	recurringConfigsQuery,
} from "@/evolu-queries";
import { useFilters } from "@/hooks/use-filters";
import { useLocalization } from "@/hooks/use-localization";
import { requestRates, storageKeys } from "@/lib/utils";
import type { TCalendarVision, TEntryType, TScreenId } from "@/types";
import { useQuery } from "@evolu/react";
import { useLocalStorage } from "@uidotdev/usehooks";
import dayjs from "dayjs";
import type React from "react";
import { type ReactNode, useEffect, useState } from "react";

export const ScreensProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	// const [owner, setOwner] = useState(evolu.getOwner());
	// const [error, setError] = useState(evolu.getError());
	const recurringConfigs = useQuery(recurringConfigsQuery);
	const entries = useQuery(entriesQuery);
	const populatedEntries = populateEntries(entries.rows, recurringConfigs.rows);

	// user can view 3 months into the past
	const viewportStartDate = dayjs().startOf("month").subtract(3, "month");
	// user can only view 12 months into the future
	const viewportEndDate = dayjs().startOf("month").add(11, "month");

	const [screen, setScreen] = useLocalStorage<TScreenId>(
		storageKeys.activeScreen,
		"calendar",
	);

	const [calendarType, setCalendarType] = useLocalStorage<TEntryType>(
		storageKeys.calendarType,
		"income",
	);
	const [calendarVision, setCalendarVision] = useLocalStorage<TCalendarVision>(
		storageKeys.calendarVision,
		"foresight",
	);

	const currentDate = dayjs();

	const [calendarIndex, setCalendarIndex] = useLocalStorage<string>(
		storageKeys.calendarIndex,
		currentDate.format("YYYY-MM"),
	);

	const currentMonthIndex = currentDate.diff(viewportStartDate, "month");
	const viewingIndex = dayjs(calendarIndex).diff(
		viewportStartDate.format("YYYY-MM"),
		"month",
	);

	const totalMonthCount = viewportEndDate.diff(viewportStartDate, "month");

	const currentMonth = dayjs().format("YYYY-MM");
	const viewingMonth = dayjs(new Date(calendarIndex)).format("YYYY-MM");
	const isViewingCurrentMonth = currentMonth === viewingMonth;

	const { activeFilters } = useFilters();

	const [rates, setRates] = useState<Record<string, number>>({});
	const { mainCurrency } = useLocalization();

	// biome-ignore lint/correctness/useExhaustiveDependencies: we need to fetch rates when the viewing index changes
	useEffect(() => {
		requestRates(mainCurrency).then((data) => {
			setRates(data);
		});
	}, [viewingIndex, mainCurrency]);

	const CALCULATIONS = getCalculations({
		rates,
		viewportStartDate,
		viewportEndDate,
		populatedEntries,
		groupFilters: activeFilters
			.filter((f) => f.type === "group")
			.map((f) => f.id as TGroupId),
		tagFilters: activeFilters
			.filter((f) => f.type === "tag")
			.map((f) => f.id as TTagId),
	});

	return (
		<ScreensContext.Provider
			value={{
				activeScreen: screen,
				setScreen,
				// ---- calendar screen ----
				populatedEntries,
				CALCULATIONS,
				currentMonthIndex,
				viewingIndex,
				totalMonthCount,
				isViewingCurrentMonth,
				// ---
				calendarIndex,
				setCalendarIndex,
				calendarType,
				setCalendarType,
				calendarVision,
				setCalendarVision,
				viewportStartDate,
				viewportEndDate,
			}}
		>
			{children}
		</ScreensContext.Provider>
	);
};
