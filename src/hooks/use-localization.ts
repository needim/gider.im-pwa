import { LocalizationProviderContext } from "@/providers/localization";
import { useContext } from "react";

export const useLocalization = () => {
	const context = useContext(LocalizationProviderContext);

	if (context === undefined)
		throw new Error(
			"useLocalization must be used within a LocalizationProvider",
		);

	return context;
};
