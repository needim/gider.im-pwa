import { AmountDisplay } from "@/components/custom/amount-display";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/hooks/use-localization";
import { useTheme } from "@/hooks/use-theme";
import { currencies } from "@/lib/currencies";
import type { Theme } from "@/providers/theme";

import { cn } from "@/lib/utils";
import { DECIMAL_MODES, type TDecimalMode } from "@/providers/localization";
import { IconMinus, IconPlus } from "@tabler/icons-react";

export function LanguageSelector(): React.ReactElement {
	const { lang, setLang, languageTagNames, availableLanguageTags } =
		useLocalization();
	return (
		<select
			id="language"
			name="language"
			className="block w-full rounded border-0 py-2 pl-3 pr-8 ring-1 ring-border ring-inset bg-card focus:ring-2 focus:ring-primary text-sm sm:leading-6"
			defaultValue={lang}
			onChange={(e) => {
				setLang(e.target.value as (typeof availableLanguageTags)[number]);
			}}
		>
			{availableLanguageTags.map((tag) => (
				<option value={tag} key={tag}>
					{languageTagNames[tag]}
				</option>
			))}
		</select>
	);
}

export function ThemeSelector(): React.ReactElement {
	const { theme, setTheme } = useTheme();
	const { m } = useLocalization();
	return (
		<select
			id="theme"
			name="theme"
			className="block w-full rounded border-0 py-2 pl-3 pr-8 ring-1 ring-border ring-inset bg-card focus:ring-2 focus:ring-primary text-sm sm:leading-6"
			defaultValue={theme}
			onChange={(e) => {
				setTheme(e.target.value as Theme);
			}}
		>
			<option value="system">{m.ThemeSystem()}</option>
			<option value="light">{m.ThemeLight()}</option>
			<option value="dark">{m.ThemeDark()}</option>
		</select>
	);
}

type TPeriod = "week" | "month" | "year";

export function PeriodSelector({
	className,
	onChange,
	value,
}: {
	value: TPeriod;
	className?: string;
	onChange?: (period: TPeriod) => void;
}): React.ReactElement {
	const { m } = useLocalization();

	const periods = [
		{ name: m.Month(), value: "month" },
		{ name: m.Year(), value: "year" },
	];

	return (
		<select
			id="period"
			name="period"
			className={cn(
				"block w-full max-w-40 rounded border-0 py-2 pl-3 pr-8 ring-1 ring-border ring-inset bg-card focus:ring-2 focus:ring-primary text-sm sm:leading-6 truncate",
				className,
			)}
			value={value}
			onChange={(e) => {
				onChange?.(e.target.value as TPeriod);
			}}
		>
			{periods.map((period) => (
				<option value={period.value} key={period.value}>
					{period.name}
				</option>
			))}
		</select>
	);
}

export function MainCurrencySelector({
	className,
}: {
	className?: string;
}): React.ReactElement {
	const { mainCurrency, setMainCurrency } = useLocalization();

	return (
		<select
			id="mainCurrency"
			name="mainCurrency"
			className={cn(
				"block w-full max-w-40 rounded border-0 py-2 pl-3 pr-8 ring-1 ring-border ring-inset bg-card focus:ring-2 focus:ring-primary text-sm sm:leading-6 truncate",
				className,
			)}
			defaultValue={mainCurrency}
			onChange={(e) => {
				setMainCurrency(e.target.value);
			}}
		>
			{currencies.map((currency) => (
				<option value={currency.iso_code} key={currency.iso_code}>
					{currency.name} - {currency.symbol}
				</option>
			))}
		</select>
	);
}

export function DecimalModeSelector({
	className,
}: {
	className?: string;
}): React.ReactElement {
	const { decimalMode, setDecimalMode, mainCurrency } = useLocalization();

	return (
		<select
			id="decimalMode"
			name="decimalMode"
			className={cn(
				"block w-full max-w-40 rounded border-0 py-2 pl-3 pr-8 ring-1 ring-border ring-inset bg-card focus:ring-2 focus:ring-primary text-sm sm:leading-6 truncate",
				className,
			)}
			defaultValue={decimalMode}
			onChange={(e) => {
				setDecimalMode(e.target.value as TDecimalMode);
			}}
		>
			{Object.keys(DECIMAL_MODES).map((mode) => (
				<option value={mode} key={mode}>
					<AmountDisplay
						amount={"1234567"}
						currencyCode={mainCurrency}
						type="short"
						asString
						useVision={false}
						decimalMode={mode as TDecimalMode}
						forceDecimal
					/>
				</option>
			))}
		</select>
	);
}

export function DecimalSelector(): React.ReactElement {
	const { decimal, setDecimal, tinyDecimal, setTinyDecimal } =
		useLocalization();

	return (
		<div className="flex items-center gap-4">
			<Button
				size="icon"
				variant="outline"
				className="size-6 rounded dark:bg-zinc-950"
				onClick={() => {
					// min decimal is 0
					if (decimal === 0) return;
					setDecimal(decimal - 1);
					if (decimal - 1 < tinyDecimal) {
						setTinyDecimal(decimal - 1);
					}
				}}
			>
				<IconMinus className="size-4" />
			</Button>
			<span className="font-mono">{decimal}</span>
			<Button
				size="icon"
				variant="outline"
				className="size-6 rounded dark:bg-zinc-950"
				onClick={() => {
					// max decimal is 8
					if (decimal === 8) return;
					setDecimal(decimal + 1);
				}}
			>
				<IconPlus className="size-4" />
			</Button>
		</div>
	);
}

// tiny decimals can't be less than decimal state
export function TinyDecimalSelector(): React.ReactElement {
	const { tinyDecimal, setTinyDecimal, decimal } = useLocalization();

	return (
		<div className="flex items-center gap-4">
			<Button
				size="icon"
				variant="outline"
				className="size-6 rounded dark:bg-zinc-950"
				onClick={() => {
					// min tinyDecimal is 0
					if (tinyDecimal === 0) return;
					setTinyDecimal(tinyDecimal - 1);
				}}
			>
				<IconMinus className="size-4" />
			</Button>
			<span className="font-mono">{tinyDecimal}</span>
			<Button
				size="icon"
				variant="outline"
				className="size-6 rounded dark:bg-zinc-950"
				onClick={() => {
					// max tinyDecimal is decimal
					if (tinyDecimal === decimal) return;
					setTinyDecimal(tinyDecimal + 1);
				}}
			>
				<IconPlus className="size-4" />
			</Button>
		</div>
	);
}
