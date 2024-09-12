import Logo from "@/components/custom/logo";
import {
	LanguageSelector,
	MainCurrencySelector,
} from "@/components/custom/settings";
import { buttonVariants } from "@/components/ui/button.variants";
import { useLocalization } from "@/hooks/use-localization";
import { STAGGER_CHILD_VARIANTS, cn } from "@/lib/utils";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { motion } from "framer-motion";

export default function OnboardingSettings({
	nextStep,
	prevStep,
}: {
	nextStep: () => void;
	prevStep: () => void;
}) {
	const { m } = useLocalization();
	return (
		<motion.div
			className="z-10 w-full pt-24 h-dvh px-12"
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

				<motion.div
					className="max-w-md text-muted-foreground transition-colors text-balance text-lg mt-12 mb-4"
					variants={STAGGER_CHILD_VARIANTS}
				>
					<motion.h1 className="text-lg mb-2 text-foreground">
						{m.Localization()}
					</motion.h1>

					<LanguageSelector />

					<motion.p className="max-w-md text-muted-foreground transition-colors text-balance mt-2 text-sm">
						{m.MoreLanguagesWillBeAdded()}
					</motion.p>
				</motion.div>

				<motion.div
					className="max-w-md text-muted-foreground transition-colors text-balance mt-1"
					variants={STAGGER_CHILD_VARIANTS}
				>
					<motion.h1
						className="text-lg mt-6 text-foreground"
						variants={STAGGER_CHILD_VARIANTS}
					>
						{m.MainCurrency()}
					</motion.h1>
					<MainCurrencySelector className="max-w-full mt-2" />
				</motion.div>

				<div className="flex items-center gap-4">
					<motion.button
						variants={STAGGER_CHILD_VARIANTS}
						className={cn(
							buttonVariants({ variant: "secondary" }),
							"mt-8 flex items-center will-change-transform gap-2",
						)}
						onClick={prevStep}
					>
						<IconArrowLeft className="size-4" /> {m.Back()}
					</motion.button>
					<motion.button
						variants={STAGGER_CHILD_VARIANTS}
						className={cn(
							buttonVariants(),
							"mt-8 flex items-center will-change-transform gap-2",
						)}
						onClick={nextStep}
					>
						{m.Next()} <IconArrowRight className="size-4" />
					</motion.button>
				</div>
			</motion.div>
		</motion.div>
	);
}
