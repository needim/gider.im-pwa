import { Button } from "@/components/ui/button";
import { useLocalization } from "@/hooks/use-localization";
import { useScreens } from "@/hooks/use-screens";
import { cn } from "@/lib/utils";
import { IconChevronLeft, IconChevronRight, IconRestore } from "@tabler/icons-react";
import dayjs from "dayjs";

export function CalendarMonthSwitcher(): React.ReactElement {
	const { activeScreen, calendarIndex, viewingIndex, setCalendarIndex, isViewingCurrentMonth } = useScreens();
	const { m } = useLocalization();

	const currentMonth = dayjs().format("YYYY-MM");
	const viewingMonth = dayjs(new Date(calendarIndex)).format("YYYY-MM");

	const isPrevDisabled = viewingIndex === 0;
	const isNextDisabled = viewingIndex === 13;

	if (activeScreen !== "calendar") {
		return <></>;
	}

	return (
		<>
			<div className="w-full relative flex justify-center">
				<div className="inline-flex items-center justify-between">
					<Button
						onClick={() => {
							setCalendarIndex(dayjs(calendarIndex).subtract(1, "month").format("YYYY-MM"));
						}}
						size="icon"
						variant="ghost"
						disabled={isPrevDisabled}
						className={cn(isPrevDisabled && "opacity-20")}
					>
						<span className="sr-only">{m.PreviousMonth()}</span>
						<IconChevronLeft className="size-6" />
					</Button>
					<button
						className={cn(
							"tabular-nums text-sm font-semibold min-w-48 space-x-2 text-center relative flex items-center justify-center",
							isViewingCurrentMonth && "text-foreground",
						)}
						onClick={() => {
							if (isViewingCurrentMonth) return;
							setCalendarIndex(currentMonth);
						}}
					>
						<span className={cn("flex items-center pr-2 rounded-full h-7", isViewingCurrentMonth ? "pl-2" : "")}>
							{!isViewingCurrentMonth && (
								<Button size="iconXs" variant="default" className="rounded-full size-[27px] mr-1.5">
									<IconRestore className="size-4" />
								</Button>
							)}
							<span>{dayjs(new Date(calendarIndex)).format("MMMM, YYYY")}</span>
						</span>
					</button>
					<Button
						disabled={isNextDisabled}
						size="icon"
						variant="ghost"
						className={cn(isNextDisabled && "opacity-20")}
						onClick={() => {
							setCalendarIndex(dayjs(calendarIndex).add(1, "month").format("YYYY-MM"));
						}}
					>
						<span className="sr-only">{m.NextMonth()}</span>
						<IconChevronRight className="size-6" />
					</Button>
				</div>
			</div>
		</>
	);
}
