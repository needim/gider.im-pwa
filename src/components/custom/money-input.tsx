import { useLocalization } from "@/hooks/use-localization";
import { cn, getNumberSymbols } from "@/lib/utils";
import * as React from "react";
import { type NumberFormatBaseProps, NumericFormat } from "react-number-format";

type MoneyInputProps = Omit<NumberFormatBaseProps, "onChange"> & {
	currencyIsoCode?: string;
};

const MoneyInput = React.forwardRef<
	React.ElementRef<
		React.ForwardRefExoticComponent<
			MoneyInputProps & Omit<React.RefAttributes<HTMLInputElement>, "onChange">
		>
	>,
	MoneyInputProps
>(({ className, currencyIsoCode, ...props }, ref) => {
	const { lang, decimal, getMainCurrency, getCurrency, decimalMode } =
		useLocalization();
	const symbols = getNumberSymbols(lang);

	//  determine thousand and decimal separator

	if (decimalMode) {
		if (decimalMode === "comma") {
			symbols.decimalSymbol = ",";
			symbols.thousandSymbol = ".";
		}
		if (decimalMode === "dot") {
			symbols.decimalSymbol = ".";
			symbols.thousandSymbol = ",";
		}
		if (decimalMode === "comma-space") {
			symbols.decimalSymbol = ",";
			symbols.thousandSymbol = " ";
		}
		if (decimalMode === "dot-space") {
			symbols.decimalSymbol = ".";
			symbols.thousandSymbol = " ";
		}
	}

	return (
		<NumericFormat
			{...props}
			getInputRef={ref}
			allowNegative={false}
			fixedDecimalScale
			valueIsNumericString
			thousandSeparator={symbols.thousandSymbol}
			decimalSeparator={symbols.decimalSymbol}
			prefix={`${
				currencyIsoCode
					? getCurrency(currencyIsoCode)?.symbol
					: getMainCurrency()?.symbol
			} `}
			decimalScale={decimal}
			className={cn(
				"block w-full dark:bg-zinc-950 bg-zinc-50 font-mono placeholder-zinc-300 dark:placeholder-zinc-600 border-0 p-0 text-zinc-950 dark:text-zinc-100  bg-transparent focus:ring-0 sm:text-sm sm:leading-6 placeholder:font-sans",
				className,
			)}
		/>
	);
});
MoneyInput.displayName = "MoneyInput";

export { MoneyInput };
