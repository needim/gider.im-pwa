import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type React from "react";
import { useState } from "react";

import colors from "tailwindcss/colors";
export const ALL_COLOR_OPTIONS = [
	{
		name: "red",
		className: "bg-red-500 dark:bg-red-400",
		colorValue: colors.red[500],
	},
	{
		name: "pink",
		className: "bg-pink-500 dark:bg-pink-400",
		colorValue: colors.pink[500],
	},
	{
		name: "orange",
		className: "bg-orange-500 dark:bg-orange-400",
		colorValue: colors.orange[500],
	},
	{
		name: "yellow",
		className: "bg-yellow-500 dark:bg-yellow-400",
		colorValue: colors.yellow[500],
	},
	{
		name: "green",
		className: "bg-green-500 dark:bg-green-400",
		colorValue: colors.green[500],
	},
	{
		name: "lime",
		className: "bg-lime-500 dark:bg-lime-400",
		colorValue: colors.lime[500],
	},
	{
		name: "teal",
		className: "bg-teal-500 dark:bg-teal-400",
		colorValue: colors.teal[500],
	},
	{
		name: "cyan",
		className: "bg-cyan-500 dark:bg-cyan-400",
		colorValue: colors.cyan[500],
	},
	{
		name: "blue",
		className: "bg-blue-500 dark:bg-blue-400",
		colorValue: colors.blue[500],
	},
	{
		name: "indigo",
		className: "bg-indigo-500 dark:bg-indigo-400",
		colorValue: colors.indigo[500],
	},
	{
		name: "purple",
		className: "bg-purple-500 dark:bg-purple-400",
		colorValue: colors.purple[500],
	},
	{
		name: "zinc",
		className: "bg-zinc-500 dark:bg-zinc-400",
		colorValue: colors.zinc[500],
	},
] as const;

export const MAPPED_COLOR_OPTIONS = ALL_COLOR_OPTIONS.reduce(
	(acc, colorOption) => {
		acc[colorOption.name] = colorOption;
		return acc;
	},
	{} as Record<TagColor, (typeof ALL_COLOR_OPTIONS)[number]>,
);

export type TagColor = (typeof ALL_COLOR_OPTIONS)[number]["name"];

export function TagColorPicker({
	defaultValue = "zinc",
	onChange,
	className,
	circleClassName,
	alignOffset = 0,
	align = "end",
}: {
	defaultValue: string;
	className?: string;
	circleClassName?: string | undefined;
	alignOffset?: number;
	align?: "start" | "center" | "end";
	onChange: (color: string) => void;
}): React.ReactElement {
	const [newTagColor, setNewTagColor] = useState<string>(defaultValue);

	const setColor = (color: string) => {
		setNewTagColor(color);
		onChange(color);
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button className={cn("flex items-center justify-center h-14 min-w-11", className)}>
					<div
						className={cn(
							"size-6 rounded-full bg-zinc-500 dark:bg-zinc-400",
							ALL_COLOR_OPTIONS.find((colorOption) => colorOption.name === newTagColor)?.className,
							circleClassName,
						)}
					/>
				</button>
			</PopoverTrigger>
			<PopoverContent side="top" align={align} alignOffset={alignOffset} className="grid grid-cols-6 gap-3">
				{ALL_COLOR_OPTIONS.map((colorOption) => (
					<button
						key={colorOption.name}
						onClick={() => {
							setColor(colorOption.name);
						}}
						className={cn(
							"size-5 flex items-center justify-center rounded-full transition-transform",
							colorOption.className,
							newTagColor === colorOption.name && "scale-[1.35]",
						)}
					/>
				))}
			</PopoverContent>
		</Popover>
	);
}
