import Logo from "@/components/custom/logo";
import { buttonVariants } from "@/components/ui/button.variants";
import { useLocalization } from "@/hooks/use-localization";
import { STAGGER_CHILD_VARIANTS, cn } from "@/lib/utils";
import {
	IconAdOff,
	IconArrowRight,
	IconCloudLock,
	IconCookieOff,
	IconEyeOff,
	IconFreeRights,
	IconKey,
	IconLockSquare,
} from "@tabler/icons-react";
import { motion } from "framer-motion";

export default function OnboardingWelcome({
	nextStep,
}: {
	nextStep: () => void;
}) {
	const { m } = useLocalization();
	return (
		<motion.div
			className="z-10 w-full py-12 h-dvh px-12"
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ duration: 0.3, type: "spring" }}
		>
			<motion.div
				variants={{
					show: {
						transition: {
							staggerChildren: 0.2,
						},
					},
				}}
				initial="hidden"
				animate="show"
			>
				<motion.div variants={STAGGER_CHILD_VARIANTS}>
					<Logo className="size-12 mb-4 will-change-transform" />
				</motion.div>
				<motion.h1
					className="text-lg mt-12 mb-4"
					variants={STAGGER_CHILD_VARIANTS}
				>
					{m.WelcomeTo()}
				</motion.h1>

				<motion.div
					className="max-w-md text-muted-foreground transition-colors text-balance mt-4"
					variants={STAGGER_CHILD_VARIANTS}
				>
					{m.AppDescription()}
				</motion.div>
				<motion.div
					variants={{
						show: {
							transition: {
								staggerChildren: 0.2,
							},
						},
					}}
					className="mt-4 flex flex-col items-left flex-wrap gap-2"
				>
					<motion.div
						variants={STAGGER_CHILD_VARIANTS}
						className="flex items-center gap-1"
					>
						<IconFreeRights size={20} /> {m.Free()}
					</motion.div>
					<motion.div
						variants={STAGGER_CHILD_VARIANTS}
						className="flex items-center gap-1"
					>
						<IconLockSquare size={20} /> {m.PrivacyFirst()}
					</motion.div>
					<motion.div
						variants={STAGGER_CHILD_VARIANTS}
						className="flex items-center gap-1"
					>
						<IconKey size={20} /> {m.Encrypted()}
					</motion.div>
					<motion.div
						variants={STAGGER_CHILD_VARIANTS}
						className="flex items-center gap-1"
					>
						<IconCloudLock size={20} /> {m.LocalFirst()}
					</motion.div>
					<motion.div
						variants={STAGGER_CHILD_VARIANTS}
						className="flex items-center gap-1"
					>
						<IconCookieOff size={20} /> {m.NoTracking()}
					</motion.div>
					<motion.div
						variants={STAGGER_CHILD_VARIANTS}
						className="flex items-center gap-1"
					>
						<IconAdOff size={20} /> {m.NoAds()}
					</motion.div>
					<motion.div
						variants={STAGGER_CHILD_VARIANTS}
						className="flex items-center gap-1"
					>
						<IconEyeOff size={20} /> {m.NoDataCollection()}
					</motion.div>
				</motion.div>
				<motion.div
					variants={STAGGER_CHILD_VARIANTS}
					className={cn(
						buttonVariants({ variant: "default" }),
						"mt-8 inline-flex items-center gap-2 transform-gpu transition-none cursor-pointer",
					)}
					onClick={nextStep}
				>
					{m.GetStarted()} <IconArrowRight className="size-4" />
				</motion.div>
			</motion.div>
		</motion.div>
	);
}
