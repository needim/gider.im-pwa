import { useCallback } from "react";

function useNextValue<T>(values: T[], currentValue: T): T {
	const getNextValue = useCallback((): T => {
		const currentIndex = values.indexOf(currentValue);
		const nextIndex = (currentIndex + 1) % values.length;
		return values[nextIndex] as T;
	}, [values, currentValue]);

	return getNextValue();
}

export default useNextValue;
