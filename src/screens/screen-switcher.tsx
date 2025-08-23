import IconMaintenance from "@/components/custom/v2/icons/maintenance";
import { useLocalization } from "@/hooks/use-localization";
import { useScreens } from "@/hooks/use-screens";
import { CalendarScreen } from "@/screens/calendar-screen";
import { InsightsScreen } from "@/screens/insights-screen";
import { SettingsScreen } from "@/screens/settings-screen";
import { Suspense } from "react";

export function ScreenSwitcher() {
  const { m } = useLocalization();
	const { activeScreen } = useScreens();

	switch (activeScreen) {
		case "assets":
			return (
				<Suspense fallback={<div>Loading...</div>}>
					<div className="flex-1 h-svh flex items-center justify-center text-center">
						<div className="text-balance mx-20">
							<IconMaintenance className="mx-auto mb-4 scale-75 -left-8 relative dark:invert" />
							<div className="text-3xl font-bold mb-4">{m.Assets()}</div>
							<strong>{m.InProgress()}</strong> <br /> {m.AssetsDesc()}
						</div>
					</div>
				</Suspense>
			);
		case "insights":
			return (
				<Suspense fallback={<div>Loading...</div>}>
					<InsightsScreen />
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
