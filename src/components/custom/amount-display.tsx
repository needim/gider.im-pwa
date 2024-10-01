import { useLocalization } from "@/hooks/use-localization";
import { useScreens } from "@/hooks/use-screens";
import { format } from "@/lib/utils";
import type { TDecimalMode } from "@/providers/localization";
import type React from "react";
import { twMerge } from "tailwind-merge";

interface IAmountDisplay {
	amount: number | string;
	currencyCode?: string;
	className?: string;
	decimalMode?: TDecimalMode;
	locale?: string;
	showAs?: "minus" | "plus" | undefined;
	type?: "short" | "long";
	color?: "red" | "green";
	testID?: string;
	asString?: boolean;
	useVision?: boolean;
	forceDecimal?: boolean;
}

export const AmountDisplay: React.FC<React.PropsWithChildren<IAmountDisplay>> = ({
	amount,
	currencyCode,
	locale,
	type,
	showAs,
	color,
	testID,
	className,
	decimalMode,
	asString,
	useVision = true,
	forceDecimal = false,
}) => {
	const { calendarVision } = useScreens();

	if (calendarVision === "hidden" && !asString && useVision) {
		return <span className="tracking-[0rem]">*****</span>;
	}
	amount = typeof amount === "string" ? Number.parseFloat(amount) : amount;
	if (Number.isNaN(amount)) {
		amount = 0;
	}

	const includeSign = showAs === "minus" || showAs === "plus";

	if (showAs === "minus") {
		amount = amount < 0 ? amount : amount * -1;
	} else if (showAs === "plus") {
		amount = amount > 0 ? amount : amount * -1;
	}

	const { lang, decimal, tinyDecimal, decimalMode: decimalModePref } = useLocalization();

	const val = format(
		amount,
		currencyCode,
		type,
		forceDecimal ? 2 : decimal,
		includeSign,
		tinyDecimal,
		locale || lang,
		decimalMode ? decimalMode : decimalModePref,
		asString,
	);

	return asString ? (
		val
	) : (
		<span
			data-test-id={testID}
			className={twMerge(
				"tabular-nums font-mono whitespace-nowrap",
				color === "red" && "text-error-700",
				color === "green" && "text-success-700",
				className,
			)}
		>
			{val}
		</span>
	);
};
