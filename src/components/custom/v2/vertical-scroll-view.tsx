import { cn } from "@/lib/utils";
import type React from "react";
import { useRef } from "react";
import { useDraggable } from "react-use-draggable-scroll";

export function VerticalScrollView({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	const ref2 = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
	const { events: events2 } = useDraggable(ref2, {
		applyRubberBandEffect: true,
	});

	return (
		<div
			ref={ref2}
			{...events2}
			className={cn("shrink-0 flex flex-col w-full gap-2 overflow-y-scroll z-40 no-scrollbar", className)}
		>
			{children}
		</div>
	);
}
