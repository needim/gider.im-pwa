import { Button } from "@/components/ui/button";
import { useLocalization } from "@/hooks/use-localization";
import { EntryCreateSchema } from "@/schemas/entry";
import { zodResolver } from "@hookform/resolvers/zod";
import { AutoTextSize } from "auto-text-size";

import { AmountDisplay } from "@/components/custom/amount-display";
import { CurrencySelector } from "@/components/custom/v2/add-entry/currency-selector";
import { DatePicker } from "@/components/custom/v2/add-entry/date-picker";
import { EntryTypeSelect } from "@/components/custom/v2/add-entry/entry-type-select";
import { GroupSelect } from "@/components/custom/v2/add-entry/group-select";
import { RecurrencePresetSelect } from "@/components/custom/v2/add-entry/recurrence-preset-select";
import { TagSelect } from "@/components/custom/v2/add-entry/tag-select";
import { HorizontalScrollView } from "@/components/custom/v2/horizontal-scroll-view";
import { Input } from "@/components/ui/input";
import { decodeAmount, decodeCurrency, decodeDate, decodeGroupId, decodeName, decodeTagId } from "@/evolu-db";
import { useData } from "@/contexts/data";
import { cn } from "@/lib/utils";
import type { TEntryType } from "@/types";
import {
	IconBackspaceFilled,
	IconCalendarMonth,
	IconCoins,
	IconExclamationCircleFilled,
	IconSquareRoundedLetterA,
	IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

export interface EntryDrawerRef {
	openDrawer: (startDate: dayjs.Dayjs, type: TEntryType) => void;
	closeDrawer: () => void;
	resetForm: () => void;
}

export const EntryDrawer = forwardRef<EntryDrawerRef, {}>((_, ref) => {
	const [open, setOpen] = useState(false);
	const { lang, mainCurrency, decimalMode, decimal, getCurrency, m } = useLocalization();

        const { groups, tags, createEntry: createEntryRecord, createRecurringConfig } = useData();
        const tagsCount = tags.length;
        const groupsCount = groups.length;

	dayjs.locale(lang);
	const decimalChar = decimalMode.includes("comma") ? "," : ".";
	const hideDecimalPoint = decimal === 0;

        useImperativeHandle(ref, () => ({
		openDrawer: (_startDate, _type) => {
			form.setValue("type", _type);
			form.setValue("startDate", _startDate.toDate());
			form.setValue("currency", mainCurrency);
			setOpen(true);
		},
		closeDrawer: () => {
			setOpen(false);
		},
		resetForm: () => {
			form.reset();
		},
	}));

	const form = useForm<z.input<typeof EntryCreateSchema>>({
		resolver: zodResolver(EntryCreateSchema),
		defaultValues: {
			startDate: dayjs().toDate(),
			type: "income",
			mode: "one-time",
			recurrence: undefined,
			interval: undefined,
			every: undefined,
			name: "",
			amount: "",
			currency: mainCurrency,
			group: "",
			tag: "",
		},
	});

        const handleCreateEntry = async (values: z.input<typeof EntryCreateSchema>) => {
                if (values.type !== "assets") {
                        // TODO: add assets support
                        const now = dayjs();
                        // We are setting these for ordering purposes
                        values.startDate.setHours(now.hour(), now.minute(), now.second(), now.millisecond());
                        let recurringId: string | null = null;

                        if (values.mode !== "one-time" && values.recurrence) {
                                const endDate =
                                        values.mode === "finite"
                                                ? dayjs(values.startDate)
                                                          .add(Number(values.every ?? 0), values.recurrence)
                                                          .toISOString()
                                                : null;

                                recurringId = await createRecurringConfig({
                                        frequency: values.recurrence,
                                        interval: values.interval ?? 0,
                                        every: values.every || 1,
                                        startDate: values.startDate.toISOString(),
                                        endDate,
                                });
                        }

                        await createEntryRecord({
                                type: values.type,
                                name: decodeName(values.name),
                                amount: decodeAmount(Number(values.amount).toFixed(8).toString()),
                                currencyCode: decodeCurrency(values.currency) || decodeCurrency(mainCurrency),
                                date: decodeDate(values.startDate.toISOString()),
                                groupId: values.group ? decodeGroupId(values.group) : null,
                                tagId: values.tag ? decodeTagId(values.tag) : null,
                                fullfilled: false,
                                recurringId,
                        });
                }

                setOpen(false);
                form.reset();

                return;
        };

	const backspaceIntervalId = useRef<ReturnType<typeof setInterval> | null>(null);

	const startBackspacing = () => {
		if (backspaceIntervalId.current) return;
		backspaceIntervalId.current = setInterval(() => {
			form.setValue("amount", form.watch("amount").slice(0, -1), {
				shouldValidate: true,
				shouldDirty: true,
				shouldTouch: true,
			});
		}, 150);
	};

	const stopBackspacing = () => {
		if (backspaceIntervalId.current) {
			clearInterval(backspaceIntervalId.current);
			backspaceIntervalId.current = null;
		}
	};

	useEffect(() => {
		return () => {
			if (backspaceIntervalId.current) {
				clearInterval(backspaceIntervalId.current);
			}
		};
	}, []);

	return (
		<motion.div
			initial={{ opacity: 1, top: "100%" }}
			animate={{ opacity: open ? 1 : 1, top: open ? 0 : "100%" }}
			transition={{
				type: "tween",
				ease: "circInOut",
				duration: 0.3,
			}}
			className="absolute z-50 bg-popover inset-0 flex flex-col min-h-svh p-6 pt-2 px-5"
		>
			<div className="flex justify-between items-center absolute z-50">
				<Button variant="ghost" size="icon" className="rounded shrink-0" onClick={() => setOpen(false)}>
					<IconX className="h-6 w-6" />
				</Button>
			</div>

			<div className="flex flex-col items-center mb-1.5 grow justify-center relative">
				<div className="mb-1.5 flex items-center w-full indent-11 pr-11">
					<div
						className={cn(
							"font-medium text-6xl w-full text-center block justify-center min-h-[76px] leading-[80px]",
							form.watch("amount").length === 0 && "text-muted-foreground",
							form.watch("amount").length > 8 && "text-right justify-end",
						)}
					>
						<AutoTextSize as={"div"} mode="oneline" minFontSizePx={24} maxFontSizePx={60} fontSizePrecisionPx={0.1}>
							<AmountDisplay
								amount={form.watch("amount")}
								currencyCode={form.watch("currency") || mainCurrency}
								type="short"
								showAs={form.watch("type") === "expense" ? "minus" : undefined}
								useVision={false}
								className={form.formState.errors.amount ? "text-rose-500" : ""}
							/>
						</AutoTextSize>
					</div>
					<Button
						className="rounded absolute right-0"
						variant="link"
						size="icon"
						onClick={() =>
							form.setValue("amount", form.getValues("amount").slice(0, -1), {
								shouldValidate: true,
								shouldDirty: true,
								shouldTouch: true,
							})
						}
						disabled={form.getValues("amount").length === 0}
						onMouseDown={startBackspacing}
						onMouseUp={stopBackspacing}
						onMouseLeave={stopBackspacing}
						onTouchStart={startBackspacing}
						onTouchEnd={stopBackspacing}
						onTouchCancel={stopBackspacing}
					>
						<IconBackspaceFilled />
					</Button>
				</div>

				<pre className="text-xs hidden">
					{JSON.stringify(
						{
							mode: form.watch("mode"),
							recurrence: form.watch("recurrence"),
							interval: form.watch("interval"),
							every: form.watch("every"),
						},
						null,
						2,
					)}
				</pre>
			</div>

			<div className="flex items-center gap-2 justify-center relative">
				<Input
					{...form.register("name")}
					startIcon={form.formState.errors.name ? IconExclamationCircleFilled : IconSquareRoundedLetterA}
					startIconClassName={form.formState.errors.name ? "text-rose-500" : ""}
					autoComplete="off"
					placeholder={m.AddName()}
					parentClassName=""
					className="rounded"
				/>
				<CurrencySelector value={form.watch("currency")} onValueChange={(val) => form.setValue("currency", val)}>
					<Button variant="outline" className="rounded" disableScale>
						<IconCoins className="-left-1.5 size-5 relative text-muted-foreground" />
						{getCurrency(form.watch("currency"))?.iso_code}
					</Button>
				</CurrencySelector>
			</div>
			<HorizontalScrollView>
				<div className="shrink-0">
					<EntryTypeSelect
						value={form.watch("type")}
						onValueChange={(val) => {
							form.setValue("type", val);
						}}
					/>
				</div>
				<div className="shrink-0">
					<RecurrencePresetSelect
						startDate={form.watch("startDate")}
						defaultValue={{
							mode: form.watch("mode"),
							recurrence: form.watch("recurrence"),
							interval: form.watch("interval"),
							every: form.watch("every"),
						}}
						onValueChange={(v) => {
							if (v) {
								form.setValue("mode", v.mode);
								form.setValue("recurrence", v.recurrence);
								form.setValue("interval", v.interval);
								form.setValue("every", v.every);
							} else {
								form.setValue("mode", "one-time");
								form.setValue("recurrence", undefined);
								form.setValue("interval", undefined);
								form.setValue("every", undefined);
							}
						}}
					/>
				</div>
				<div className="shrink-0">
					<DatePicker
						value={form.watch("startDate")}
						onValueChange={(val) => {
							if (val) form.setValue("startDate", val!); // disable undefined
						}}
					>
						<Button variant="outline" className="justify-start shrink rounded grow" disableScale>
							<IconCalendarMonth className="-left-1.5 relative text-muted-foreground size-5" />
							<span className="truncate">{dayjs(form.watch("startDate")).format("DD MMM, YY")}</span>
						</Button>
					</DatePicker>
				</div>

				{groupsCount > 0 && (
					<div className="shrink-0">
						<GroupSelect
							value={form.watch("group")}
							onValueChange={(val) => {
								if (val === "no-group") {
									form.setValue("group", undefined);
								} else {
									form.setValue("group", val);
								}
							}}
						/>
					</div>
				)}
				{tagsCount > 0 && (
					<div className="shrink-0">
						<TagSelect
							value={form.watch("tag")}
							onValueChange={(val) => {
								if (val === "no-tag") {
									form.setValue("tag", undefined);
								} else {
									form.setValue("tag", val);
								}
							}}
						/>
					</div>
				)}
			</HorizontalScrollView>
			<div className="grid grid-cols-3 gap-3 ">
				{[1, 2, 3, 4, 5, 6, 7, 8, 9, decimalChar, 0].map((char) => (
					<Button
						key={char}
						variant="secondary"
						className={cn(
							"text-3xl py-9 font-semibold rounded grow w-full",
							hideDecimalPoint && char === decimalChar && "hidden pointer-events-none",
							hideDecimalPoint && char === 0 && "col-span-2",
						)}
						disabled={char === decimalChar && hideDecimalPoint}
						onClick={() => {
							form.setValue("amount", form.getValues("amount") + (char === decimalChar ? "." : char), {
								shouldValidate: true,
								shouldDirty: true,
								shouldTouch: true,
							});
						}}
					>
						{char}
					</Button>
				))}
				<Button
					variant="default"
					className="text-3xl py-9 font-semibold rounded"
                                    onClick={form.handleSubmit(handleCreateEntry)}
				>
					✓
				</Button>
			</div>
		</motion.div>
	);
});
