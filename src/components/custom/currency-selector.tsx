import { currencies } from "@/lib/currencies";
import { cn } from "@/lib/utils";
import React, { useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLSelectElement> {}

const CurrencySelector = React.forwardRef<HTMLSelectElement, InputProps>(
	({ ...props }, ref) => {
		const id = useId();

		return (
			<select
				ref={ref}
				className={cn(
					"absolute right-0 top-0 max-w-36 border-0 py-1.5 pl-3 pr-7 ring-0 bg-transparent h-14 ring-border ring-inset focus:ring-2 focus:ring-transparent sm:text-sm sm:leading-6 truncate",
					props.className,
				)}
				{...props}
				id={id}
				// disabled
			>
				{currencies.map((currency) => (
					<option value={currency.iso_code} key={currency.iso_code}>
						{currency.iso_code}
					</option>
				))}
			</select>
		);
	},
);

CurrencySelector.displayName = "CurrencySelector";

export { CurrencySelector };
