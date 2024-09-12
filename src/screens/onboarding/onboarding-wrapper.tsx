import { BottomNavV2 } from "@/components/custom/v2/bottom-nav-v2";
import { HeaderV2 } from "@/components/custom/v2/header-v2";
import { storageKeys } from "@/lib/utils";
import { ScreensProvider } from "@/providers/screens";
import OnboardingWelcome from "@/screens/onboarding/onboarding-welcome";
import { ScreenSwitcher } from "@/screens/screen-switcher";
import { useLocalStorage } from "@uidotdev/usehooks";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense } from "react";
import Confetti from "react-dom-confetti";
import OnboardingSettings from "./onboarding-settings";

export function OnboardingWrapper() {
	const [step, setStep] = useLocalStorage(storageKeys.onboarding, 0);
	const [firstShow, setFirstShow] = useLocalStorage(
		storageKeys.firstShowAnimation,
		false,
	);

	const maxStep = 2;

	const nextStep = () => {
		setStep((s) => Math.min(s + 1, maxStep));
	};

	const prevStep = () => {
		setStep((s) => Math.max(s - 1, 0));
	};

	return (
		<>
			<div className="max-w-md mx-auto flex flex-col h-full flex-1 w-full bg-background select-none sm:shadow-[rgba(0,_0,_0,_0.15)_0px_30px_90px]">
				<AnimatePresence mode="wait">
					{step === 0 && (
						<OnboardingWelcome nextStep={nextStep} key="welcome" />
					)}
					{step === 1 && (
						<OnboardingSettings
							nextStep={nextStep}
							prevStep={prevStep}
							key="language"
						/>
					)}
					{step >= 2 && (
						<motion.div
							initial={{ opacity: 0, scale: 0.97 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: firstShow ? 0.5 : 2, type: "spring" }}
							onAnimationStart={() => {
								setTimeout(() => {
									setFirstShow(true);
								}, 1000);
							}}
							className="flex flex-col flex-1 max-h-dvh relative will-change-auto"
						>
							<ScreensProvider>
								<Confetti
									active={firstShow}
									config={{
										angle: 360,
										spread: 151,
										startVelocity: 40,
										elementCount: 70,
										dragFriction: 0.12,
										duration: 4000,
										stagger: 3,
										width: "10px",
										height: "10px",
										colors: ["#000", "#333", "#666"],
									}}
								/>
								<HeaderV2 />
								<Suspense fallback={<div>Loading...</div>}>
									<ScreenSwitcher />
								</Suspense>
								<BottomNavV2 />
							</ScreensProvider>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</>
	);
}
