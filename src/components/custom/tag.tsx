import {
	ALL_COLOR_OPTIONS,
	type TagColor,
	TagColorPicker,
} from "@/components/custom/tag-color-picker";
import { cn } from "@/lib/utils";
import type React from "react";

export function Tag({
	name,
	color = "zinc",
	className,
	dotClassName,
	allowColorChange = false,
	onColorChange,
	displayColor = true,
}: {
	name: string;
	className?: string;
	dotClassName?: string;
	allowColorChange?: boolean;
	onColorChange?: (color: TagColor) => void;
	displayColor?: boolean;
	color: TagColor;
}): React.ReactElement {
	return (
		<span
			className={cn(
				"flex items-center gap-x-1.5 rounded-full relative",
				className,
			)}
		>
			{allowColorChange && (
				<TagColorPicker
					defaultValue={color}
					circleClassName={dotClassName}
					alignOffset={-15}
					align="start"
					className="min-w-6 mr-1 h-auto"
					onChange={(color) => {
						onColorChange?.(color as TagColor);
					}}
				/>
			)}
			{!allowColorChange && displayColor && (
				<div
					className={cn(
						"h-1.5 w-1.5 shrink-0 rounded-full",
						ALL_COLOR_OPTIONS.find((c) => c.name === color)?.className,
						dotClassName,
					)}
					aria-hidden="true"
				/>
			)}

			{name}
		</span>
	);
}
