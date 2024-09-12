import type { TCalculations, TPopulatedEntry } from "@/evolu-queries";
import type dayjs from "dayjs";

export type TScreenId =
	| "calendar"
	| "assets"
	| "graphs"
	| "settings"
	| "add-entry";

export type TCalendarVision = "foresight" | "actual" | "hidden";

export type TEntryType = "income" | "expense" | "assets";

export interface ScreensContextType {
	activeScreen: TScreenId;
	setScreen: (id: TScreenId) => void;
	// ---- calendar screen ----
	calendarIndex: string; // MM-YYYY
	setCalendarIndex: (index: string) => void;
	calendarType: TEntryType;
	setCalendarType: (type: TEntryType) => void;
	calendarVision: TCalendarVision;
	setCalendarVision: (vision: TCalendarVision) => void;
	viewportStartDate: dayjs.Dayjs;
	viewportEndDate: dayjs.Dayjs;
	isViewingCurrentMonth: boolean;
	populatedEntries: TPopulatedEntry[];
	CALCULATIONS: TCalculations;
	currentMonthIndex: number;
	viewingIndex: number;
	totalMonthCount: number;
}
