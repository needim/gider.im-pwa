import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function ConditionalView({
	condition,
	className,
	children,
}: { condition: boolean; children: React.ReactNode; className?: string }) {
	return (
		<motion.div
			className={cn("origin-center", className)}
			initial={
				condition
					? { height: "auto", scale: 1, opacity: 1 }
					: { height: 0, scale: 0.5, opacity: 0 }
			}
			animate={
				condition
					? { height: "auto", scale: 1, opacity: 1 }
					: { height: 0, scale: 0, opacity: 0 }
			}
		>
			{children}
		</motion.div>
	);
}
