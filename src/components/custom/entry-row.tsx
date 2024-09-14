import { AmountDisplay } from "@/components/custom/amount-display";
import type { EntryEditDialogRef } from "@/components/custom/entry-edit-dialog";
import { Tag } from "@/components/custom/tag";
import type { TagColor } from "@/components/custom/tag-color-picker";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	type TPopulatedEntry,
	deleteEntry,
	toggleFullfilled,
} from "@/evolu-queries";
import { useLocalization } from "@/hooks/use-localization";
import { cn } from "@/lib/utils";
import {
	IconDotsVertical,
	IconEdit,
	IconInfinity,
	IconRotateClockwise2,
	IconTrash,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import type React from "react";
import { useId } from "react";

export function EntryRow({
	entry,
	editDialogRef,
}: {
	entry: TPopulatedEntry;
	editDialogRef: React.MutableRefObject<EntryEditDialogRef | null>;
	long?: boolean;
}): React.ReactElement {
	const { m, lang } = useLocalization();

	const rowId = useId();

	return (
		<motion.div
			data-entry-row="yes"
			key={rowId}
			className={cn(
				"flex justify-between items-center group border-b border-zinc-100 dark:border-zinc-900",
				!entry.details.fullfilled && "opacity-75",
			)}
		>
			<div className="flex items-center gap-3 grow">
				<motion.div
					whileTap={{ scale: 0.97 }}
					onClick={(e) => {
						e.stopPropagation();
						toggleFullfilled(entry);
					}}
					className="border-r cursor-pointer border-zinc-100 dark:border-zinc-900 p-3 pl-3"
				>
					<motion.input
						name={`toggle-${rowId}`}
						type="checkbox"
						checked={!!entry.details.fullfilled}
						readOnly
						className={cn(
							"size-6 rounded-xs pointer-events-none border-2 m-1 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sky-600 dark:checked:bg-sky-600 dark:checked:border-sky-600 focus:ring-2 focus:ring-transparent dark:focus:ring-transparent",
						)}
					/>
				</motion.div>
				<div className="flex flex-col gap-0 align-middle grow">
					<div className="font-medium text-sm">
						{entry.details.entryGroup && (
							<span className="text-muted-foreground">
								{entry.details.entryGroup?.name}{" "}
							</span>
						)}
						{entry.details.name}
					</div>
					<div className="text-xs flex items-center gap-2 text-muted-foreground tabular-nums">
						<span>{dayjs(entry.date).format("D MMM")}</span>
						<span className="text-xs font-sans text-right text-muted-foreground flex items-center gap-2 justify-end">
							{entry.details.entryTag?.name && (
								<Tag
									name={entry.details.entryTag.name}
									color={entry.details.entryTag.color as TagColor}
								/>
							)}
						</span>
					</div>
				</div>
				<span className="pr-0.5 flex flex-col text-right">
					<AmountDisplay
						amount={entry.details.amount!}
						locale={lang}
						currencyCode={entry.details.currencyCode!}
						type={"short"}
						className="font-medium"
						showAs={entry.details.type === "expense" ? "minus" : undefined}
					/>

					{!!entry.recurringConfigId && (
						<span className="text-xs font-sans text-right text-muted-foreground flex items-center gap-2 justify-end">
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
				</span>
			</div>
			<div className="pr-4">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button className="size-10 h-14 -mr-4 flex items-center justify-center text-muted-foreground">
							<IconDotsVertical className="size-4 mr-2" />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" sideOffset={0} alignOffset={8}>
						<DropdownMenuGroup>
							<DropdownMenuItem
								onSelect={async () => {
									editDialogRef?.current?.openDialog(entry);
								}}
							>
								<IconEdit className="size-4 mr-2" />
								{m.Edit()}
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem
								onSelect={async () => {
									setTimeout(() => {
										deleteEntry(entry, false, () => {});
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
											deleteEntry(entry, true, () => {});
										}, 100);
									}}
								>
									<IconRotateClockwise2 className="size-4 mr-2 text-orange-600" />
									{m.DeleteWithSubsequents()}
								</DropdownMenuItem>
							)}
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</motion.div>
	);
}
