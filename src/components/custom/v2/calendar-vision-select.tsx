import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocalization } from "@/hooks/use-localization";
import { useScreens } from "@/hooks/use-screens";
import { cn } from "@/lib/utils";
import type { TCalendarVision } from "@/types";
import { IconBinocularsFilled, IconCashBanknoteFilled, IconEyeFilled } from "@tabler/icons-react";

export function CalendarVisionSelect() {
	const { calendarVision, setCalendarVision } = useScreens();
	const { m } = useLocalization();
	const modes = [
		{
			key: "foresight",
			label: m.Foresight(),
			colorCode: "zinc",
			Icon: IconBinocularsFilled,
			description: m.ForesightDescription(),
		},
		{
			key: "actual",
			label: m.Actual(),
			colorCode: "sky",
			Icon: IconCashBanknoteFilled,
			description: m.ActualDescription(),
		},
		{
			key: "hidden",
			label: m.Hidden(),
			colorCode: "orange",
			Icon: IconEyeFilled,
			description: m.HiddenDescription(),
		},
	] satisfies Array<{
		key: TCalendarVision;
		label: string;
		colorCode: string;
		Icon: React.ElementType;
		description: string;
	}>;

	const activeMode = modes.find((mode) => mode.key === calendarVision);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="flex items-center gap-1 font-semibold text-sm text-muted-foreground">
				{activeMode?.label}
				{activeMode?.Icon && (
					<activeMode.Icon
						className={cn(
							"size-5",
							activeMode.colorCode === "zinc" && "text-zinc-600 dark:text-zinc-600",
							activeMode.colorCode === "sky" && "text-sky-600 dark:text-sky-600",
							activeMode.colorCode === "orange" && "text-orange-600 dark:text-orange-600",
						)}
					/>
				)}
				<span className="sr-only">Toggle menu</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="center" className="font-semibold">
				<DropdownMenuLabel className="uppercase text-xs text-muted-foreground tracking-tight font-bold text-center">
					{m.DisplayModes()}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />

				{modes.map((mode, index) => (
					<DropdownMenuGroup key={mode.key}>
						<DropdownMenuItem onClick={() => setCalendarVision(mode.key)}>
							<div className="flex flex-col w-full">
								<div className="flex items-center">
									{mode.label}
									{mode.Icon && (
										<mode.Icon
											className={cn(
												"size-7 absolute right-1",
												mode.colorCode === "zinc" && "text-zinc-600 dark:text-zinc-600",
												mode.colorCode === "sky" && "text-sky-600 dark:text-sky-600",
												mode.colorCode === "orange" && "text-orange-600 dark:text-orange-600",
											)}
										/>
									)}
								</div>
								<p className="text-xs text-muted-foreground font-normal max-w-36 text-balance">{mode.description}</p>
							</div>
						</DropdownMenuItem>
						{index !== modes.length - 1 && <DropdownMenuSeparator />}
					</DropdownMenuGroup>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
