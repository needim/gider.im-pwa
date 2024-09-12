import Logo from "@/components/custom/logo";
import { motion } from "framer-motion";

export function AnimatedLogo() {
	return (
		<motion.div
			className="opacity-75"
			transition={{ delay: 1 }}
			initial={{
				rotate: 45,
			}}
			animate={{
				rotate: 0,
			}}
		>
			<a href="/" className="size-7">
				<Logo className="size-7" />
			</a>
		</motion.div>
	);
}
