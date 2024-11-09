import { PeriodSelector } from "@/components/custom/settings";
import { Incrementor } from "@/components/custom/v2/add-entry/incrementor";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useLocalization } from "@/hooks/use-localization";
import type { EntryCreateSchema } from "@/schemas/entry";
import {
	type Icon,
	IconAdjustmentsHorizontal,
	IconCheck,
	IconCircleNumber1,
	type IconProps,
	IconRotateClockwise2,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
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
	const [open, setOpen] = useState(false);
	return (
		<>
			<Drawer
				open={open}
				onOpenChange={(v) => {
					setOpen(v);
				}}
			>
				<Button
					onClick={() => setOpen(true)}
					variant="default"
					className="justify-start grow rounded w-full"
					disableScale
				>
					{selectedOption?.icon && <selectedOption.icon className="-left-1.5 size-5 relative" />}
					<span className="truncate max-w-full">{selectedOption?.label}</span>
				</Button>
				<DrawerContent className="pb-4 max-w-md px-4 mx-auto">
					<DrawerHeader className="sr-only">
						<DrawerTitle>Recurring entry selector</DrawerTitle>
						<DrawerDescription>Select the recurrence pattern for this entry</DrawerDescription>
					</DrawerHeader>
					<div className="grid grid-cols-1 overflow-x-hidden gap-2 mt-4">
						{options.map((option) => (
							<Button
								key={option.value}
								variant={option.value === recurrencePreset ? "default" : "secondary"}
								onClick={() => {
									setRecurrencePreset(option.value);

									if (option.config) {
										setRecurrenceConfig(option.config);
										onValueChange(option.config);
									}

									if (option.value !== "custom") {
										setOpen(false);
									}
								}}
								className="shrink-0 w-full justify-start"
								size="lg"
							>
								<option.icon className="size-5 shrink-0  relative -left-1.5" />
								{option.label}
								{option.value === recurrencePreset && <IconCheck className="ml-auto size-5" />}
							</Button>
						))}
					</div>
					<motion.div
						initial={{ height: 0 }}
						animate={recurrencePreset === "custom" ? { height: "auto" } : { height: 0 }}
						className="overflow-hidden mt-3"
					>
						<div className="bg-zinc-50 dark:bg-zinc-900 border  px-4 py-3 rounded-md">
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
						</div>
					</motion.div>
				</DrawerContent>
			</Drawer>
		</>
	);
}
