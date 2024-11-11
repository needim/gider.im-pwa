import { MoneyInput } from "@/components/custom/money-input";
import { cn } from "@/lib/utils";
import React, { useId } from "react";
import type { NumberFormatBaseProps } from "react-number-format";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
	label: string;
	wrapperClassName?: string;
	currencyIsoCode: string;
	onValueChange?: NumberFormatBaseProps["onValueChange"];
}

const InputAmount = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, label, children, placeholder, currencyIsoCode, wrapperClassName, onValueChange, value }, ref) => {
		const id = useId();
		return (
			<div
				className={cn(
					"relative rounded px-3 pb-1.5 pt-2.5 shadow-sm ring-1 ring-inset dark:bg-zinc-950 bg-white ring-zinc-200 dark:ring-zinc-800 focus-within:ring-2 focus-within:ring-zinc-600 dark:focus-within:ring-zinc-400",
					wrapperClassName,
				)}
			>
				<label
					htmlFor={id}
					className={cn("block capitalize text-xs font-medium text-zinc-900 dark:text-zinc-100", className)}
				>
					{label}
				</label>
				<MoneyInput
					id={id}
					ref={ref}
					currencyIsoCode={currencyIsoCode}
					placeholder={placeholder}
					inputMode="decimal"
					value={value?.toString() || ""}
					onValueChange={(value, source) => {
						onValueChange?.(value, source);
					}}
				/>
				{children}
			</div>
		);
	},
);

InputAmount.displayName = "InputAmount";

export { InputAmount };
