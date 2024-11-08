import { AmountDisplay } from "@/components/custom/amount-display";
import { EntryEditDrawer, type EntryEditDrawerRef } from "@/components/custom/entry-edit-dialog";
import { predictPreset } from "@/components/custom/v2/add-entry/recurrence-preset-select";
import { VerticalScrollView } from "@/components/custom/v2/vertical-scroll-view";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";

import { type TPopulatedEntry, getEntryHistory } from "@/evolu-queries";
import { useLocalization } from "@/hooks/use-localization";
import { cn } from "@/lib/utils";
import { IconInfinity, IconPointFilled, IconRotateClockwise2 } from "@tabler/icons-react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

export interface EntryDetailDrawerRef {
	openDrawer: (entry: TPopulatedEntry) => void;
	closeDrawer: () => void;
}

export const EntryDetailDrawer = forwardRef<EntryDetailDrawerRef, {}>((_, ref) => {
	const [open, setOpen] = useState(false);
	const [entry, setEntry] = useState<TPopulatedEntry>();
	const [history, setHistory] = useState<TPopulatedEntry[]>([]);
	const editDrawerRef = useRef<EntryEditDrawerRef>(null);

	const { m } = useLocalization();

	useImperativeHandle(ref, () => ({
		openDrawer: (entry) => {
			setEntry(entry);
			setOpen(true);
		},
		closeDrawer: () => {
			setOpen(false);
		},
	}));

	useEffect(() => {
		if (open && entry) {
			getEntryHistory(entry).then((history) => {
				console.log("hisstory", history);
				setHistory(history);
			});
		}
	}, [open, entry]);

	const total = useMemo(
		() => history.reduce((acc, h) => acc + (h.details.fullfilled ? Number(h.details.amount) : 0), 0),
		[history],
	);

	if (!entry) return null;

	const preset = predictPreset({
		every: entry.config?.every ?? 1,
		interval: entry.config?.interval ?? 0,
		mode: !entry.recurringConfigId ? "one-time" : entry.config?.interval === 0 ? "infinite" : "finite",
		recurrence: entry?.config?.frequency,
	});

	return (
		<Drawer
			nested
			open={open}
			onOpenChange={(v) => {
				setOpen(v);
			}}
		>
			<DrawerContent className="standalone:pb-6 max-w-md mx-auto">
				<DrawerHeader>
					{/* <IconCircleKeyFilled className="w-12 h-12 mx-auto mb-2" /> */}
					<DrawerTitle className="text-2xl text-left flex items-center justify-between">
						<div>{entry.details.name}</div>
						<div className="text-lg flex items-center shrink-0 gap-2 text-muted-foreground relative">
							{!!entry.recurringConfigId && (
								<span className="flex items-center font-mono gap-1 text-muted-foreground">
									<IconRotateClockwise2 className="size-5" />
									<span>
										{entry.index}/
										{entry.interval === 0 ? (
											<IconInfinity className="inline" size={18} />
										) : (
											Math.round(entry.interval / (entry.config?.every ?? 1))
										)}
									</span>
								</span>
							)}
						</div>
					</DrawerTitle>
					<DrawerDescription className="text-left text-lg flex gap-1 items-center">
						<span
							className={cn(
								"font-semibold",
								entry.details.type === "income"
									? "text-green-700 dark:text-green-400"
									: "text-red-700 dark:text-red-400",
							)}
						>
							{entry.details.type === "income" && m.Income()}
							{entry.details.type === "expense" && m.Expense()}
						</span>
						-
						<span>
							{preset === "one-time" && m.OneTime()}
							{preset === "every-month" && m.EveryMonth()}
							{preset === "every-3-month" && m.Every3Months()}
							{preset === "every-6-month" && m.Every6Months()}
							{preset === "every-year" && m.EveryYear()}
							{preset === "every-2-year" && m.Every2Years()}
							{preset === "every-4-year" && m.Every4Years()}
							{preset === "custom" && m.Custom()}
						</span>
					</DrawerDescription>
					{preset === "custom" && (
						<div className="text-left text-muted-foreground">
							{m.RepeatsEvery()} {entry.config?.every} {entry.config?.frequency}
						</div>
					)}
				</DrawerHeader>
				<div className="text-left flex items-center justify-between px-4 border-b pb-3">
					<p className="text-muted-foreground font-semibold">
						{entry.details.type === "expense" ? m.PaidStatus() : m.IncomePaidStatus()}
					</p>
					<AmountDisplay
						amount={!entry.recurringConfigId && entry.details.fullfilled ? entry.details.amount : total}
						currencyCode={entry.details.currencyCode!}
						type={"short"}
						className="font-semibold"
						showAs={entry.details.type === "expense" ? "minus" : undefined}
					/>
				</div>
				{!entry.recurringConfigId && (
					<div className={cn("mx-4 py-1.5 relative flex items-center justify-between font-medium")}>
						<div>{dayjs(entry.date).format("YYYY, MMMM")}</div>
						<div>
							<AmountDisplay
								amount={entry.details.amount!}
								currencyCode={entry.details.currencyCode!}
								type={"short"}
								className="font-medium"
								showAs={entry.details.type === "expense" ? "minus" : undefined}
							/>
						</div>
					</div>
				)}
				{entry.recurringConfigId && (
					<VerticalScrollView className="max-h-52 overflow-x-hidden gap-0 scrollGradient">
						{history?.map((h, i) => {
							if (h.index < entry.index - 4 || h.index > entry.index + 11) {
								return null;
							}
							return (
								<div
									key={h.index}
									className={cn(
										"mx-4 text-sm relative flex items-center justify-between py-1.5",
										h.index === entry.index && "font-medium  mx-0 px-4 py-3 bg-zinc-100 dark:bg-zinc-900",
										h.index !== entry.index && "text-muted-foreground",
									)}
								>
									<div className="flex items-center gap-1">
										<motion.input
											type="checkbox"
											checked={!!h.details.fullfilled}
											readOnly
											disabled
											className={cn(
												"size-3 rounded-xs pointer-events-none border m-1 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:zinc:bg-sky-600 dark:checked:border-zinc-600 focus:ring-2 focus:ring-transparent dark:focus:ring-transparent relative -left-1",
											)}
										/>
										<span className="tabular-nums font-mono">
											{h.index < 10 && "0"}
											{h.index}
										</span>{" "}
										{h.index === entry.index ? (
											<span className="relative flex size-2 mx-0.5">
												<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
												<span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500" />
											</span>
										) : (
											<IconPointFilled className="size-2 mx-0.5 text-muted-foreground" />
										)}
										{dayjs(h.date).format("YYYY, MMMM")}
									</div>
									<div>
										<AmountDisplay
											amount={h.details.amount!}
											currencyCode={h.details.currencyCode!}
											type={"short"}
											className="font-medium"
											showAs={h.details.type === "expense" ? "minus" : undefined}
										/>
									</div>
								</div>
							);
						})}
					</VerticalScrollView>
				)}

				<DrawerFooter className="grid grid-cols-2">
					<Button
						variant="secondary"
						size="lg"
						onClick={() => {
							editDrawerRef?.current?.openDrawer(entry);
						}}
					>
						{m.Edit()}
					</Button>
					<Button
						variant="destructive"
						size="lg"
						onClick={() => {
							// copyToClipboard(owner?.mnemonic || "");
						}}
					>
						{m.Delete()}
					</Button>
				</DrawerFooter>

				<EntryEditDrawer onSave={() => setOpen(false)} ref={editDrawerRef} />
			</DrawerContent>
		</Drawer>
	);
});
