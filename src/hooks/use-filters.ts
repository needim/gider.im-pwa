import { FiltersContext, type FiltersContextType } from "@/providers/filters";
import { useContext } from "react";

export const useFilters = (): FiltersContextType => {
	const context = useContext(FiltersContext);
	if (!context) {
		throw new Error("useFilters must be used within a FiltersProvider");
	}
	return context;
};
