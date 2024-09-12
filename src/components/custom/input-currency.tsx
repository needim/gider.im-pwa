import { currencies } from "@/lib/currencies";
import { cn } from "@/lib/utils";
import React, { useId } from "react";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLSelectElement> {
	label: string;
	labelExtra?: React.ReactNode;
}

const CurrencyInput = React.forwardRef<HTMLSelectElement, InputProps>(
	({ className, label, labelExtra, ...props }, ref) => {
		const id = useId();
		return (
			<div className="rounded max-w-36 px-3 pb-1.5 pt-2.5 shadow-sm ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 focus-within:ring-2 focus-within:ring-zinc-600 dark:focus-within:ring-zinc-400">
				<label
					htmlFor={id}
					className="text-xs flex items-center justify-between font-medium capitalize text-zinc-900 dark:text-zinc-100"
				>
					<span>{label}</span>
					{labelExtra}
				</label>
				<select
					ref={ref}
					id={id}
					className={cn(
						"block w-full dark:bg-zinc-900 placeholder-zinc-400 border-0 p-0 text-zinc-950 dark:text-zinc-100  bg-transparent focus:ring-0 sm:text-sm sm:leading-6 truncate",
						className,
					)}
					{...props}
				>
					{currencies.map((currency) => (
						<option value={currency.iso_code} key={currency.iso_code}>
							{currency.name} - {currency.symbol}
						</option>
					))}
				</select>
			</div>
		);
	},
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
