"use client";

import { useLocalization } from "@/hooks/use-localization";
import useNextValue from "@/hooks/use-next-value";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import type { Theme } from "@/providers/theme";
import {
	IconContrastFilled,
	IconMoonFilled,
	IconSunFilled,
} from "@tabler/icons-react";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

export function ThemeToggle({
	hideIndicator = false,
	indicatorClassName,
}: {
	hideIndicator?: boolean;
	indicatorClassName?: string;
}) {
	const [mounted, setMounted] = useState(false);
	const { setTheme, theme } = useTheme();
	const controlsSun = useAnimation();
	const controlsMoon = useAnimation();
	const controlsContrast = useAnimation();
	const { m } = useLocalization();

	const iconVariants = {
		sun: {
			rotate: 0,
			scale: 1,
			opacity: 1,
		},
		moon: {
			rotate: 0,
			scale: 1,
			opacity: 1,
		},
		system: {
			rotate: 0,
			scale: 1,
			opacity: 1,
		},
		// applies to all
		hidden: {
			scale: 0,
			opacity: 0,
			rotate: 180,
		},
		systemHidden: {
			scale: 0,
			opacity: 0,
		},
	};

	useEffect(() => {
		setMounted(true);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (theme === "system") {
			controlsSun.start("hidden");
			controlsContrast.start("system");
			controlsMoon.start("hidden");
		} else {
			controlsSun.start(theme === "light" ? "sun" : "hidden");
			controlsMoon.start(theme === "dark" ? "moon" : "hidden");
			controlsContrast.start("systemHidden");
		}
	}, [mounted, controlsContrast, controlsMoon, controlsSun, theme]);

	const nextTheme = useNextValue(
		["light", "system", "dark"] as Theme[],
		theme as Theme,
	);

	if (!mounted) {
		return null;
	}

	return (
		<button
			type="button"
			className="flex items-center gap-2 cursor-pointer group h-[36px]"
			onClick={() => {
				setTheme(nextTheme);
			}}
		>
			{!hideIndicator && (
				<div
					className={cn(
						"capitalize text-sm",
						hideIndicator &&
							"transition-all translate-x-full opacity-0 group-hover:opacity-100 group-hover:translate-x-0 delay-150",
						indicatorClassName,
					)}
				>
					{theme === "system"
						? m.ThemeSystem()
						: theme === "light"
							? m.ThemeLight()
							: m.ThemeDark()}
				</div>
			)}
			<motion.div
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.9 }}
				className={cn(
					"h-6 w-10 flex items-center bg-zinc-0 ring-1 ring-zinc-900/5 backdrop-blur dark:bg-zinc-950 dark:ring-white/10 rounded-full shadow-inner dark:shadow-black/10 relative",
				)}
			>
				<motion.div
					animate={{
						x: theme === "light" ? 4 : theme === "system" ? 12 : 20,
						transition: { duration: 0.1, easings: ["easeInOut"] },
					}}
					className={cn(
						"rounded-full size-4 transition-all duration-300 ease-in-out relative",
						theme === "light" && "translate-x-1",
						theme === "system" && "translate-x-3",
						theme === "dark" && "translate-x-5",
					)}
				>
					<motion.div
						className="size-4 absolute top-0 left-0"
						variants={iconVariants}
						initial="hidden"
						animate={controlsSun}
						transition={{ duration: 0.2, ease: "easeInOut" }}
					>
						<IconSunFilled className="size-4" />
					</motion.div>
					<motion.div
						className="size-4 absolute top-0 left-0"
						variants={iconVariants}
						initial="hidden"
						animate={controlsContrast}
						transition={{ duration: 0.2, ease: "easeInOut" }}
					>
						<IconContrastFilled className="size-4 dark:rotate-180" />
					</motion.div>
					<motion.div
						className="size-4 absolute top-0 left-0"
						variants={iconVariants}
						initial="hidden"
						animate={controlsMoon}
						transition={{ duration: 0.2, ease: "easeInOut" }}
					>
						<IconMoonFilled className="size-4" />
					</motion.div>
				</motion.div>
			</motion.div>
		</button>
	);
}
