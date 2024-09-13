import {
	EntryEditDialog,
	type EntryEditDialogRef,
} from "@/components/custom/entry-edit-dialog";
import { EntryRow } from "@/components/custom/entry-row";
import IconEntriesEmptyState from "@/components/custom/v2/icons/entries-empty-state";
import { useLocalization } from "@/hooks/use-localization";
import { useScreens } from "@/hooks/use-screens";
import { IconArrowDown } from "@tabler/icons-react";
import { motion } from "framer-motion";
import type React from "react";
import { useRef } from "react";

export function CalendarScreen(): React.ReactElement {
	const { calendarType, CALCULATIONS, viewingIndex } = useScreens();

	const { m } = useLocalization();

	// const addTransactionRef = useRef<EntryDrawerRef>(null);
	const editDialogRef = useRef<EntryEditDialogRef>(null);

	const showEmptyState =
		CALCULATIONS[viewingIndex]?.[calendarType].length === 0;

	return (
		<>
			<div className="flex-1 h-svh overflow-y-auto pb-4 relative">
				{showEmptyState && (
					<IconEntriesEmptyState className="absolute dark:invert dark:opacity-80 size-[50%] left-1/2 -translate-x-1/2 top-1/2 -translate-y-3/4 -ml-3" />
				)}
				{showEmptyState && (
					<div className="flex-1 absolute w-full bottom-4 items-center pointer-events-none">
						<div className="text-center">
							<h3 className="mt-2 text-sm font-semibold">{m.NoEntries()}</h3>
							<p className="mt-1 text-sm text-muted-foreground text-balance">
								{m.ClickToAdd()}
							</p>
							<motion.div
								className="mx-auto text-center mt-4"
								animate={{ y: 5 }}
								transition={{
									type: "spring",
									stiffness: 100,
									repeat: Number.POSITIVE_INFINITY,
									repeatType: "reverse",
								}}
							>
								<IconArrowDown className="text-muted-foreground inline-block" />
							</motion.div>
						</div>
					</div>
				)}
				{CALCULATIONS[viewingIndex]?.[calendarType]?.map((t, i) => (
					<EntryRow
						key={`${i}-${t.id}-${t.recurringConfigId}`}
						entry={t}
						editDialogRef={editDialogRef}
					/>
				))}
			</div>

			{/* <Button
				className={cn(
					"absolute standalone:bottom-16 bottom-12 z-50 mb-7 rounded-lg left-1/2 transform -translate-x-1/2 shadow-md transition-all duration-200",
				)}
				size="icon"
				onClick={() => {
					addTransactionRef.current?.openDrawer(
						dayjs().isSame(calendarIndex, "month")
							? dayjs()
							: dayjs(calendarIndex),
						calendarType,
					);
				}}
			>
				<IconPlus />
			</Button> */}

			<EntryEditDialog ref={editDialogRef} />
		</>
	);
}
