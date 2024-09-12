import type { ScreensContextType } from "@/types";
import { createContext } from "react";

export const ScreensContext = createContext<ScreensContextType | undefined>(
	undefined,
);
