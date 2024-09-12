import { useLocalization } from "@/hooks/use-localization";
import { cn } from "@/lib/utils";
import type { TEntryType } from "@/types";
import { motion } from "framer-motion";
import { useId } from "react";

export function CalendarTabs({
	value,
	onValueChange,
	className,
	size = "default",
	assetsAllowed = false,
}: {
	value: TEntryType;
	onValueChange: (value: TEntryType) => void;
	className?: string;
	size?: "default" | "small";
	assetsAllowed?: boolean;
}) {
	const { m } = useLocalization();
	const layoutId = useId();
	const tabs = [
		{
			id: "income",
			type: "entry",
			label: (active: boolean) => (
				<span
					className={cn(
						"text-muted-foreground",
						active && "text-green-700 dark:text-green-400 opacity-100",
					)}
				>
					{m.Income()}
				</span>
			),
		},
		{
			id: "expense",
			type: "entry",
			label: (active: boolean) => (
				<span
					className={cn(
						"text-muted-foreground",
						active && "text-red-700 dark:text-red-400 opacity-100",
					)}
				>
					{m.Expense()}
				</span>
			),
		},
		{
			id: "assets",
			type: "assets",
			label: (active: boolean) => (
				<span
					className={cn(
						"text-muted-foreground",
						active && "text-sky-700 dark:text-sky-400 opacity-100",
					)}
				>
					Asset
				</span>
			),
		},
	] as const;

	return (
		<div
			className={cn(
				"grid font-semibold text-base bg-zinc-100 dark:bg-muted/50 shadow-inner rounded px-1 py-1 w-full",
				className,
				assetsAllowed ? "grid-cols-3" : "grid-cols-2",
			)}
		>
			{tabs.map((tab) => (
				<button
					key={tab.id}
					onClick={() => onValueChange(tab.id)}
					className={cn(
						"relative h-10 outline-0 transition",
						size === "small" && "text-sm h-9",
						!assetsAllowed && tab.id === "assets" && "hidden",
					)}
				>
					{value === tab.id && (
						<motion.span
							layoutId={layoutId}
							className="absolute rounded-sm inset-0 bg-white dark:bg-zinc-950 shadow-sm"
							transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
						/>
					)}
					<motion.span
						className={cn("relative z-10", value !== tab.id && "opacity-50")}
					>
						{tab.label(value === tab.id)}
					</motion.span>
				</button>
			))}
		</div>
	);
}
