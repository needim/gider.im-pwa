import type { TGroupId, TTagId } from "@/evolu-db";
import type React from "react";
import { type ReactNode, createContext, useState } from "react";

type FilterId = TGroupId | TTagId | "no-group" | "no-tag";

export interface Filter {
	id: FilterId;
	type: "group" | "tag";
}

export interface FiltersContextType {
	activeFilters: Filter[];
	add: (id: FilterId, type: "group" | "tag") => void;
	remove: (id: FilterId) => void;
	clear: () => void;
}

export const FiltersContext = createContext<FiltersContextType | undefined>(
	undefined,
);

export const FiltersProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [values, setValues] = useState<Filter[]>([]);

	const add = (id: FilterId, type: "group" | "tag") => {
		setValues([...values, { id, type }]);
	};

	const remove = (id: FilterId) => {
		setValues(values.filter((value) => value.id !== id));
	};

	const clear = () => {
		setValues([]);
	};

	return (
		<FiltersContext.Provider
			value={{ activeFilters: values, add, remove, clear }}
		>
			{children}
		</FiltersContext.Provider>
	);
};
