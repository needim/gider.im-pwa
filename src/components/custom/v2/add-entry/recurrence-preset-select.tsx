import { PeriodSelector } from "@/components/custom/settings";
import { Incrementor } from "@/components/custom/v2/add-entry/incrementor";
import { Button } from "@/components/ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectSeparator } from "@/components/ui/select";
import { useLocalization } from "@/hooks/use-localization";
import { cn } from "@/lib/utils";
import type { EntryCreateSchema } from "@/schemas/entry";
import { SelectTrigger } from "@radix-ui/react-select";
import {
	type Icon,
	IconAdjustmentsHorizontal,
	IconChevronDown,
	IconCircleNumber1,
	type IconProps,
	IconRotateClockwise2,
	IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import type { z } from "zod";

type RecurrencePreset =
	| "one-time"
	| "every-month"
	| "every-3-month"
	| "every-6-month"
	| "every-year"
	| "every-2-year"
	| "every-4-year"
	| "custom";

type TEntrySchema = z.input<typeof EntryCreateSchema>;
type RecurrenceConfig = {
	mode: TEntrySchema["mode"];
	recurrence: TEntrySchema["recurrence"];
	interval: TEntrySchema["interval"];
	every: TEntrySchema["every"];
};

type Option = {
	value: RecurrencePreset;
	label: string;
	icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
	config: RecurrenceConfig;
};

export const predictPreset = (config: RecurrenceConfig): RecurrencePreset => {
	if (config.mode === "one-time") return "one-time";
	if (config.mode === "infinite") {
		if (config.recurrence === "month") {
			if (config.every === 1) return "every-month";
			if (config.every === 3) return "every-3-month";
			if (config.every === 6) return "every-6-month";
		}
		if (config.recurrence === "year") {
			if (config.every === 1) return "every-year";
			if (config.every === 2) return "every-2-year";
			if (config.every === 4) return "every-4-year";
		}
	}
	return "custom";
};

export function RecurrencePresetSelect({
	onValueChange,
	startDate,
	defaultValue,
}: {
	defaultValue: RecurrenceConfig;
	startDate: Date;
	onValueChange: (value: RecurrenceConfig) => void;
}) {
	const { m } = useLocalization();

	const [recurrenceConfig, setRecurrenceConfig] = useState<RecurrenceConfig>(defaultValue);
	const [recurrencePreset, setRecurrencePreset] = useState<RecurrencePreset>(predictPreset(defaultValue));

	useEffect(() => {
		setRecurrencePreset(predictPreset(defaultValue));
	}, [defaultValue]);

	const [showCustomPopover, setShowCustomPopover] = useState(false);

	const options: Option[] = [
		{
			value: "one-time",
			label: m.OneTime(),
			icon: IconCircleNumber1,
			config: {
				mode: "one-time",
				recurrence: undefined,
				interval: undefined,
				every: undefined,
			},
		},
		{
			value: "every-month",
			label: m.EveryMonth(),
			icon: IconRotateClockwise2,
			config: {
				mode: "infinite",
				recurrence: "month",
				interval: 0,
				every: 1,
			},
		},
		{
			value: "every-3-month",
			label: m.Every3Months(),
			icon: IconRotateClockwise2,
			config: {
				mode: "infinite",
				recurrence: "month",
				interval: 0,
				every: 3,
			},
		},
		{
			value: "every-6-month",
			label: m.Every6Months(),
			icon: IconRotateClockwise2,
			config: {
				mode: "infinite",
				recurrence: "month",
				interval: 0,
				every: 6,
			},
		},
		{
			value: "every-year",
			label: m.EveryYear(),
			icon: IconRotateClockwise2,
			config: {
				mode: "infinite",
				recurrence: "year",
				interval: 0,
				every: 1,
			},
		},
		{
			value: "every-2-year",
			label: m.Every2Years(),
			icon: IconRotateClockwise2,
			config: {
				mode: "infinite",
				recurrence: "year",
				interval: 0,
				every: 2,
			},
		},
		{
			value: "every-4-year",
			label: m.Every4Years(),
			icon: IconRotateClockwise2,
			config: {
				mode: "infinite",
				recurrence: "year",
				interval: 0,
				every: 4,
			},
		},
		{
			value: "custom",
			label: m.Custom(),
			icon: IconAdjustmentsHorizontal,
			config: {
				// Default value, will be updated by the user
				mode: "finite",
				recurrence: "month",
				interval: 12,
				every: 1,
			},
		},
	];

	const selectedOption = options.find((o) => o.value === recurrencePreset);

	return (
		<div className="w-full relative h-10 flex items-center gap-0">
			<Select
				onValueChange={(v: RecurrencePreset) => {
					setRecurrencePreset(v);

					const selectedOption = options.find((o) => o.value === v);

					if (selectedOption?.config) {
						setRecurrenceConfig(selectedOption.config);
						onValueChange(selectedOption.config);
					}

					if (v === "custom") {
						setShowCustomPopover(true);
					}
				}}
				value={recurrencePreset}
			>
				<SelectTrigger asChild>
					<Button
						variant="default"
						className={cn("justify-start grow rounded w-full", recurrencePreset === "custom" && "rounded-r-none")}
						disableScale
						disabled={showCustomPopover}
					>
						{selectedOption?.icon && <selectedOption.icon className="-left-1.5 size-5 relative" />}
						<span className="truncate max-w-full">{selectedOption?.label}</span>
					</Button>
				</SelectTrigger>
				<SelectContent align="end" side="bottom">
					{options.map((option, index) => (
						<SelectGroup key={option.value}>
							<SelectItem value={option.value}>
								<div className="flex items-center gap-1">
									<option.icon className="size-4 text-muted-foreground" />
									{option.label}
								</div>
							</SelectItem>
							{(index === 0 || index === options.length - 2) && <SelectSeparator />}
						</SelectGroup>
					))}
				</SelectContent>
			</Select>
			{recurrencePreset === "custom" && (
				<Button
					variant="secondary"
					size="icon"
					className="shrink-0 rounded rounded-l-none border dark:border-white"
					disabled={showCustomPopover}
					onClick={() => setShowCustomPopover(true)}
				>
					<IconChevronDown className="size-4" />
				</Button>
			)}
			<Popover open={showCustomPopover} modal>
				<PopoverAnchor />
				<PopoverContent
					side="bottom"
					align="end"
					sideOffset={24}
					className="w-auto max-w-sm px-3 py-2 relative"
					onInteractOutside={() => setShowCustomPopover(false)}
				>
					<Button
						variant="secondary"
						size="iconXs"
						className="absolute top-1.5 right-1.5"
						onClick={() => setShowCustomPopover(false)}
					>
						<IconX className="size-4" />
					</Button>
					<h2 className="font-semibold leading-tight shrink mb-2">{m.RepeatsEvery()}</h2>
					<div className="grid grid-cols-2 gap-2 items-center">
						<Incrementor
							defaultValue={recurrenceConfig?.every || 1}
							min={1}
							max={12}
							zeroInfinitive={false}
							onChange={(every) => {
								const newConfig = {
									...recurrenceConfig,
									every,
								};
								setRecurrenceConfig(newConfig);
								onValueChange(newConfig);
							}}
						/>
						<div className="shrink-0">
							<PeriodSelector
								value={recurrenceConfig?.recurrence || "month"}
								onChange={(period) => {
									const newConfig = {
										...recurrenceConfig,
										recurrence: period,
									};
									setRecurrenceConfig(newConfig);
									onValueChange(newConfig);
								}}
							/>
						</div>
					</div>

					<div className="h-0 border-t mt-3 -mx-3" />
					<h2 className="font-semibold leading-tight grow mt-3">{m.TotalInstallments()}</h2>
					<div className="grid grid-cols-2 mt-2 items-center gap-2">
						<Incrementor
							defaultValue={recurrenceConfig?.interval || 12}
							min={0}
							max={240}
							zeroInfinitive
							onChange={(installments) => {
								const newConfig = {
									...recurrenceConfig,
									mode: (installments === 0 ? "infinite" : "finite") as TEntrySchema["mode"],
									interval: installments,
								};

								setRecurrenceConfig(newConfig);
								onValueChange(newConfig);
							}}
						/>
						<div className="text-sm pl-3 text-muted-foreground flex items-center gap-1">
							<div className="flex flex-col text-xs tabular-nums">
								{m.EndsAt()}{" "}
								{recurrenceConfig.interval === 0 ? (
									<span className="font-semibold">{m.Never()}</span>
								) : (
									<span className="font-semibold">
										{dayjs(startDate)
											.add(
												(recurrenceConfig.interval || 0) * (recurrenceConfig.every || 1),
												recurrenceConfig.recurrence,
											)
											.format("DD MMM, YYYY")}
									</span>
								)}
							</div>
						</div>
					</div>

					{/* <div className="flex items-center justify-end gap-2 mt-4"> */}
					{/* <Button
							size="sm"
							variant="secondary"
							className="mr-auto"
							onClick={() => {
								setShowCustomPopover(false);
								setRecurrencePreset(previousPreset);
							}}
						>
							Cancel
						</Button> */}
					{/* <Button variant="secondary" size="sm">
							<IconEyeDotted className="size-4 relative -left-1" />
							Preview
						</Button> */}
					{/* <Button
							size="sm"
							onClick={() => {
								setShowCustomPopover(false);
								setRecurrencePreset("custom");
								onValueChange(recurrenceConfig);
							}}
						>
							Apply
						</Button> */}
					{/* </div> */}
				</PopoverContent>
			</Popover>
		</div>
	);
}
