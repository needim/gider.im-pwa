"use client";

import { AnimatePresence, type Variants, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface HyperTextProps {
	text: string;
	duration?: number;
	framerProps?: Variants;
	className?: string;
	animateOnLoad?: boolean;
}

const alphabets = "abcdefghijklmnopqrstuvwxyz".split("");

const getRandomInt = (max: number) => Math.floor(Math.random() * max);

export default function HyperText({
	text,
	duration = 100,
	framerProps = {
		initial: { opacity: 0, y: -10 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: 3 },
	},
	className,
	animateOnLoad = true,
}: HyperTextProps) {
	const [displayText, setDisplayText] = useState(text.split(""));
	const [trigger, setTrigger] = useState(false);
	const interations = useRef(0);
	const isFirstRender = useRef(true);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const interval = setInterval(
			() => {
				if (!animateOnLoad && isFirstRender.current) {
					clearInterval(interval);
					isFirstRender.current = false;
					return;
				}
				if (interations.current < text.length) {
					setDisplayText((t) =>
						t.map((l, i) => (l === " " ? l : i <= interations.current ? text[i] : alphabets[getRandomInt(26)])),
					);
					interations.current = interations.current + 0.1;
				} else {
					setTrigger(false);
					clearInterval(interval);
				}
			},
			duration / (text.length * 10),
		);
		// Clean up interval on unmount
		return () => clearInterval(interval);
	}, [text, duration, trigger, animateOnLoad]);

	return (
		<pre className="overflow-hidden py-2 text-balance cursor-default scale-100">
			<AnimatePresence mode="wait">
				{displayText.map((letter, i) => (
					<motion.h1
						key={i}
						className={cn("font-mono inline", letter === " " ? "w-3" : "", className)}
						{...framerProps}
					>
						{letter}
					</motion.h1>
				))}
			</AnimatePresence>
		</pre>
	);
}
