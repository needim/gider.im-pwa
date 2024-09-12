import { Toaster } from "@/components/ui/toaster";
import { evolu } from "@/evolu-db.ts";
import { setThemeColor, storageKeys } from "@/lib/utils.tsx";

import {
	type AvailableLanguageTag,
	setLanguageTag,
	sourceLanguageTag,
} from "@/paraglide/runtime.js";
import { FiltersProvider } from "@/providers/filters.tsx";
import { LocalizationProvider } from "@/providers/localization.tsx";
import { type Theme, ThemeProvider } from "@/providers/theme.tsx";
import UpdatePrompt from "@/update-prompt.tsx";
import { EvoluProvider } from "@evolu/react";
import "dayjs/locale/en";
import "dayjs/locale/tr";
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "unfonts.css";
import App from "./App.tsx";
import "./index.css";

const localTheme =
	(localStorage.getItem(storageKeys.theme) as Theme) || "system";
const localLang =
	(localStorage.getItem(storageKeys.lang) as AvailableLanguageTag) ||
	sourceLanguageTag;
setLanguageTag(localLang);
setThemeColor(localTheme);

window.oncontextmenu = () => false;

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<EvoluProvider value={evolu}>
			<FiltersProvider>
				<ThemeProvider defaultTheme={localTheme}>
					<LocalizationProvider defaultLang={localLang}>
						<App />
						<Toaster />
						<Suspense>
							<UpdatePrompt />
						</Suspense>
					</LocalizationProvider>
				</ThemeProvider>
			</FiltersProvider>
		</EvoluProvider>
	</React.StrictMode>,
);
