import { Button } from "@/components/ui/button";
import { useLocalization } from "@/hooks/use-localization";
import { useScreens } from "@/hooks/use-screens";
import { cn } from "@/lib/utils";
import {
	IconArrowNarrowLeft,
	IconArrowNarrowRight,
	IconChevronLeft,
	IconChevronRight,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { motion } from "framer-motion";

export function CalendarMonthSwitcher(): React.ReactElement {
	const {
		activeScreen,
		calendarIndex,
		viewingIndex,
		setCalendarIndex,
		isViewingCurrentMonth,
	} = useScreens();
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
			<div className="w-full relative flex justify-center text-muted-foreground">
				<div className="inline-flex items-center justify-between">
					<Button
						onClick={() => {
							setCalendarIndex(
								dayjs(calendarIndex).subtract(1, "month").format("YYYY-MM"),
							);
						}}
						size="iconXs"
						variant="ghost"
						disabled={isPrevDisabled}
						className={cn(isPrevDisabled && "opacity-20")}
					>
						<span className="sr-only">{m.PreviousMonth()}</span>
						<IconChevronLeft className="size-5" />
					</Button>
					<div
						className={cn(
							"tabular-nums text-sm font-semibold min-w-32 text-center relative",
							isViewingCurrentMonth && "",
						)}
					>
						{dayjs(new Date(calendarIndex)).format("MMMM, YYYY")}

						<motion.div
							animate={
								isViewingCurrentMonth
									? { opacity: 0, scale: 0, top: 20 }
									: { opacity: 1, scale: 0.64, top: 20 }
							}
							className="absolute text-center top-0 opacity-0 z-40 origin-top w-full"
						>
							<Button
								variant="secondary"
								size="sm"
								className={cn(
									"rounded-full border shadow-sm",
									isViewingCurrentMonth && "pointer-events-none",
								)}
								onClick={() => {
									setCalendarIndex(currentMonth);
								}}
							>
								{currentMonth < viewingMonth && (
									<IconArrowNarrowLeft className="size-4 mr-0 relative -left-1" />
								)}
								{m.CurrentMonth()}
								{currentMonth > viewingMonth && (
									<IconArrowNarrowRight className="size-4 ml-0 relative -right-1" />
								)}
							</Button>
						</motion.div>
					</div>
					<Button
						disabled={isNextDisabled}
						size="iconXs"
						variant="ghost"
						className={cn(isNextDisabled && "opacity-20")}
						onClick={() => {
							setCalendarIndex(
								dayjs(calendarIndex).add(1, "month").format("YYYY-MM"),
							);
						}}
					>
						<span className="sr-only">{m.NextMonth()}</span>
						<IconChevronRight className="size-5" />
					</Button>
				</div>
			</div>
		</>
	);
}
