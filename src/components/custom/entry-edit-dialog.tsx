import { useLocalization } from "@/hooks/use-localization";

import { IconInfinity, IconRotateClockwise2 } from "@tabler/icons-react";

import { Input } from "@/components/custom/input";
import { InputAmount } from "@/components/custom/input-amount";
import { Tag } from "@/components/custom/tag";
import type { TagColor } from "@/components/custom/tag-color-picker";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type TPopulatedEntry, editEntry, groupsQuery, tagsQuery } from "@/evolu-queries";
import { cn } from "@/lib/utils";
import { useQuery } from "@evolu/react";
import dayjs from "dayjs";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

export interface EntryEditDrawerRef {
	openDrawer: (entry: TPopulatedEntry) => void;
	closeDrawer: () => void;
}

export const EntryEditDrawer = forwardRef<
	EntryEditDrawerRef,
	{
		onSave: () => void;
	}
>(({ onSave }, ref) => {
	const [entry, setEntry] = useState<TPopulatedEntry>();
	const groups = useQuery(groupsQuery);
	const tags = useQuery(tagsQuery);
	const tagsCount = tags.rows.length;
	const groupsCount = groups.rows.length;

	const [oName, setOName] = useState<string>(entry?.details.name || "");
	const [oAmount, setOAmount] = useState<string>(entry?.details.amount || "");
	const [oGroup, setOGroup] = useState<string>(entry?.details.entryGroup?.groupId || "");
	const [oTag, setOTag] = useState<string>(entry?.details.entryTag?.tagId || "");
	const [applyToSubsequents, setApplyToSubsequents] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setApplyToSubsequents(false);
	}, [entry]);

	const { m } = useLocalization();

	const [open, setOpen] = useState(false);

	useImperativeHandle(ref, () => ({
		openDrawer: (entry) => {
			setEntry(entry);
			setOName(entry.details.name);
			setOAmount(entry.details.amount);
			setOGroup(entry.details.entryGroup?.groupId || "");
			setOTag(entry.details.entryTag?.tagId || "");
			setOpen(true);
		},
		closeDrawer: () => {
			setOpen(false);
		},
	}));

	if (!entry) return null;

	return (
		<Drawer
			nested
			open={open}
			onOpenChange={(open) => {
				setOpen(open);
			}}
		>
			<DrawerContent
				className="standalone:pb-6 max-w-md mx-auto"
				onOpenAutoFocus={(e) => {
					e.preventDefault();
				}}
			>
				<DrawerHeader className="flex items-center justify-between">
					<DrawerTitle>{dayjs(entry.date).format("YYYY, MMMM")}</DrawerTitle>

					<div className="text-sm flex items-center gap-2 text-muted-foreground relative -top-0.5">
						{!!entry.recurringConfigId && (
							<span className="flex items-center font-mono gap-0.5 text-muted-foreground">
								<IconRotateClockwise2 className="size-3" />
								<span>
									{entry.index}/
									{entry.interval === 0 ? (
										<IconInfinity className="inline" size={14} />
									) : (
										Math.round(entry.interval / (entry.config?.every ?? 1))
									)}
								</span>
							</span>
						)}
						{entry.details.fullfilled ? m.PaidStatus() : m.AwaitingStatus()}
					</div>
				</DrawerHeader>
				<div className="px-4">
					{groupsCount + tagsCount > 0 && (
						<div className={cn("grid grid-cols-2 gap-3 mb-3", groupsCount === 0 || (tagsCount === 0 && "grid-cols-1"))}>
							<div className={cn(groupsCount === 0 && "hidden")}>
								<Select
									onValueChange={(value) => {
										if (value === "no-group") {
											setOGroup("");
										} else {
											setOGroup(value);
										}
									}}
									defaultValue={oGroup || "no-group"}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Group" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="no-group">Group</SelectItem>
										{groups.rows.map((group) => (
											<SelectItem key={group.id} value={group.id}>
												{group.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className={cn(tagsCount === 0 && "hidden")}>
								<Select
									onValueChange={(value) => {
										if (value === "no-tag") {
											setOTag("");
										} else {
											setOTag(value);
										}
									}}
									defaultValue={oTag || "no-tag"}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Tag" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="no-tag">Tag</SelectItem>
										{tags.rows.map((tag) => (
											<SelectItem key={tag.id} value={tag.id}>
												<Tag className="ml-0" name={tag.name} color={tag.color as TagColor} />
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					)}

					<div className="flex items-center gap-4">
						<Input
							label={m.Name()}
							value={oName}
							autoFocus={false}
							onChange={(e) => setOName(e.target.value)}
							wrapperClassName="w-full relative"
						/>
					</div>

					<div className="flex items-center gap-4 mt-3">
						<InputAmount
							wrapperClassName="w-full"
							currencyIsoCode={entry.details.currencyCode!}
							label={m.Amount()}
							value={oAmount}
							onValueChange={(v) => setOAmount(v.value)}
						/>
					</div>

					<div className="flex items-center gap-4">
						{/* <Button
							size="sm"
							variant="default"
							onClick={async () => {
								await editEntry(
									entry,
									oName,
									oAmount,
									oGroup ? oGroup : null,
									oTag ? oTag : null,
									() => {},
									applyToSubsequents,
								);
								setOpen(false);
							}}
						>
							{m.Save()}
						</Button>

						{!!entry.recurringConfigId && (
							<div className="flex items-center space-x-2">
								<Checkbox
									checked={applyToSubsequents}
									onCheckedChange={(checked) => setApplyToSubsequents(!!checked)}
									id="update-subsequents"
								/>
								<label
									htmlFor="update-subsequents"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									{m.ApplyToSubsequents()}
								</label>
							</div>
						)} */}

						{/* <DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="icon" className="ml-auto">
									<IconTrash className="size-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end">
								<DropdownMenuGroup>
									<DropdownMenuItem
										onSelect={async () => {
											setTimeout(() => {
												deleteEntry(entry, false, () => {
													setOpen(false);
												});
											}, 100);
										}}
									>
										<IconTrash className="size-4 mr-2 text-orange-600" />
										{m.Delete()}
									</DropdownMenuItem>
									{!!entry.recurringConfigId && (
										<DropdownMenuItem
											onSelect={async () => {
												setTimeout(() => {
													deleteEntry(entry, true, () => {
														setOpen(false);
													});
												}, 100);
											}}
										>
											<IconRotateClockwise2 className="size-4 mr-2 text-orange-600" />
											{m.DeleteWithSubsequents()}
										</DropdownMenuItem>
									)}
								</DropdownMenuGroup>
							</DropdownMenuContent>
						</DropdownMenu> */}

						{!!entry.recurringConfigId && (
							<div className="flex items-center space-x-2 py-2 mt-2">
								{/* <Checkbox
									checked={applyToSubsequents}
									onCheckedChange={(checked) => setApplyToSubsequents(!!checked)}
									id="update-subsequents"
									className="rounded-sm"
								/> */}
								<input
									id="update-subsequents"
									type="checkbox"
									checked={applyToSubsequents}
									onChange={() => {
										setApplyToSubsequents(!applyToSubsequents);
									}}
									className={cn(
										"size-5 rounded-xs border-2 m-1 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sky-600 dark:checked:bg-sky-600 dark:checked:border-sky-600 focus:ring-2 focus:ring-transparent dark:focus:ring-transparent",
									)}
								/>
								<label htmlFor="update-subsequents" className="text-sm font-medium leading-none">
									{m.ApplyToSubsequents()}
								</label>
							</div>
						)}
					</div>
				</div>
				<DrawerFooter className="grid grid-cols-2">
					<Button
						variant="default"
						size="lg"
						onClick={async () => {
							await editEntry(
								entry,
								oName,
								oAmount,
								oGroup ? oGroup : null,
								oTag ? oTag : null,
								() => {},
								applyToSubsequents,
							);
							setOpen(false);
							onSave();
						}}
					>
						{m.Save()}
					</Button>
					<Button
						variant="secondary"
						size="lg"
						onClick={() => {
							setOpen(false);
						}}
					>
						{m.Cancel()}
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
});
