import IconMaintenance from "@/components/custom/v2/icons/maintenance";
import { useScreens } from "@/hooks/use-screens";
import { CalendarScreen } from "@/screens/calendar-screen";
import { SettingsScreen } from "@/screens/settings-screen";
import { Suspense } from "react";

export function ScreenSwitcher() {
	const { activeScreen } = useScreens();

	switch (activeScreen) {
		case "assets":
			return (
				<Suspense fallback={<div>Loading...</div>}>
					<div className="flex-1 h-svh flex items-center justify-center text-center">
						<div className="text-balance mx-20">
							<IconMaintenance className="mx-auto mb-4 scale-75 -left-8 relative dark:invert" />
							<div className="text-3xl font-bold mb-4">Assets</div>
							<strong>In progress...</strong> <br /> You will add your assets to
							keep track of your net worth.
						</div>
					</div>
				</Suspense>
			);
		case "graphs":
			return (
				<Suspense fallback={<div>Loading...</div>}>
					<div className="flex-1 h-svh flex items-center justify-center text-center">
						<div className="text-balance mx-20">
							<IconMaintenance className="mx-auto mb-4 scale-75 -left-8 relative dark:invert" />
							<div className="text-3xl font-bold mb-4">Charts</div>
							<strong>In progress...</strong> <br /> You will see your financial
							health and trends here.
						</div>
					</div>
				</Suspense>
			);
		case "settings":
			return (
				<Suspense fallback={<div>Loading...</div>}>
					<SettingsScreen />
				</Suspense>
			);
		default:
			return (
				<Suspense fallback={<div>Loading...</div>}>
					<CalendarScreen />
				</Suspense>
			);
	}
}
