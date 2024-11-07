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
	const ref2 = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
	const { events: events2 } = useDraggable(ref2, {
		applyRubberBandEffect: true,
		decayRate: 5,
	});

	return (
		<div
			ref={ref2}
			{...events2}
			onTouchStart={(e) => {
				if (e.cancelable) {
					e.preventDefault();
				}
				e.stopPropagation();
			}}
			onTouchMove={(e) => {
				if (e.cancelable) {
					e.preventDefault();
				}
				e.stopPropagation();
			}}
			className={cn("shrink-0 flex gap-2 px-5 py-2 items-center -mx-5 overflow-x-scroll z-40 no-scrollbar", className)}
		>
			{children}
		</div>
	);
}
