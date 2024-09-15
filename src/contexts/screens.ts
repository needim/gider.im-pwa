import type { ScreensContextType } from "@/providers/screens";
import { createContext } from "react";

export const ScreensContext = createContext<ScreensContextType | undefined>(
	undefined,
);
