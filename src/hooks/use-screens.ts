import { ScreensContext } from "@/contexts/screens";
import type { ScreensContextType } from "@/types";
import { useContext } from "react";

export const useScreens = (): ScreensContextType => {
	const context = useContext(ScreensContext);
	if (!context) {
		throw new Error("useScreens must be used within a ScreensProvider");
	}
	return context;
};
