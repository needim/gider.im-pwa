import { cn } from "@/lib/utils";
import type React from "react";
import { useRef } from "react";
import { useDraggable } from "react-use-draggable-scroll";

export function HorizontalScrollView({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	const ref = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
	const { events } = useDraggable(ref, {
		applyRubberBandEffect: true,
	});

	return (
		<div
			ref={ref}
			{...events}
			className={cn("shrink-0 flex gap-2 px-4 py-2 items-center overflow-x-scroll z-40 no-scrollbar", className)}
		>
			{children}
		</div>
	);
}
