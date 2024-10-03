import type { TDecimalMode } from "@/providers/localization";
import type { Theme } from "@/providers/theme";
import type { Mnemonic } from "@evolu/react";
import * as bip39 from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/*
Currency rates are loaded from this great repository by Fawaz Ahmed
https://github.com/fawazahmed0/exchange-api
*/

export async function requestRates(_base: string) {
	const base = _base.toLowerCase();
	const response = await fetchWithFallback([
		`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base}.min.json`,
		`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base}.json`,
		`https://latest.currency-api.pages.dev/v1/currencies/${base}.json`,
	]).then(
		(resp) => resp?.json(),
		(reason) => {
			throw new Error(`Unable to load rates. ${reason}`);
		},
	);
	const rates = response?.[base] as Record<string, number>;
	if (!rates) throw new Error(`No rates found in a response. ${response}`);

	const result: Record<string, number> = {};

	Object.keys(rates).forEach((key) => {
		const code = key.toUpperCase();
		const rate = rates[key];
		switch (code) {
			// convert BTC to µBTC
			case "BTC":
			case "ETH":
				result[code] = round(1 / rate / 1_000_000);
				return;
			default:
				result[code] = round(1 / rate);
				return;
		}
	});
	return result;
}

async function fetchWithFallback(links: string[]) {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let response: any;
	for (const link of links) {
		try {
			response = await fetch(link);
			if (response.ok) return response;
		} catch (e) {}
	}
	return response;
}

function round(amount: number) {
	const p = 1_000_000;
	return Math.round(amount * p) / p;
}

export const DEFAULT_DECIMAL_PLACES = 2;
// ISO 4217 2021-10-01 http://www.currency-iso.org/en/home/tables/table-a1.html
export const defaultCurrencyDecimalPlaces = new Map([
	["AED", 2],
	["AFN", 2],
	["ALL", 2],
	["AMD", 2],
	["ANG", 2],
	["AOA", 2],
	["ARS", 2],
	["AUD", 2],
	["AWG", 2],
	["AZN", 2],
	["BAM", 2],
	["BBD", 2],
	["BDT", 2],
	["BGN", 2],
	["BHD", 3],
	["BIF", 0],
	["BMD", 2],
	["BND", 2],
	["BOB", 2],
	["BOV", 2],
	["BRL", 2],
	["BSD", 2],
	["BTN", 2],
	["BWP", 2],
	["BYN", 2],
	["BYR", 0],
	["BZD", 2],
	["CAD", 2],
	["CDF", 2],
	["CHE", 2],
	["CHF", 2],
	["CHW", 2],
	["CLF", 4],
	["CLP", 0],
	["CNY", 2],
	["COP", 2],
	["COU", 2],
	["CRC", 2],
	["CUC", 2],
	["CUP", 2],
	["CVE", 2],
	["CZK", 2],
	["DJF", 0],
	["DKK", 2],
	["DOP", 2],
	["DZD", 2],
	["EGP", 2],
	["ERN", 2],
	["ETB", 2],
	["EUR", 2],
	["FJD", 2],
	["FKP", 2],
	["GBP", 2],
	["GEL", 2],
	["GHS", 2],
	["GIP", 2],
	["GMD", 2],
	["GNF", 0],
	["GTQ", 2],
	["GYD", 2],
	["HKD", 2],
	["HNL", 2],
	["HRK", 2],
	["HTG", 2],
	["HUF", 2],
	["IDR", 2],
	["ILS", 2],
	["INR", 2],
	["IQD", 3],
	["IRR", 2],
	["ISK", 0],
	["JEP", 2],
	["JMD", 2],
	["JOD", 3],
	["JPY", 0],
	["KES", 2],
	["KGS", 2],
	["KHR", 2],
	["KMF", 0],
	["KPW", 2],
	["KRW", 0],
	["KWD", 3],
	["KYD", 2],
	["KZT", 2],
	["LAK", 2],
	["LBP", 2],
	["LKR", 2],
	["LRD", 2],
	["LSL", 2],
	["LYD", 3],
	["MAD", 2],
	["MDL", 2],
	["MGA", 2],
	["MKD", 2],
	["MMK", 2],
	["MNT", 2],
	["MOP", 2],
	["MRO", 5],
	["MUR", 2],
	["MVR", 2],
	["MWK", 2],
	["MXN", 2],
	["MXV", 2],
	["MYR", 2],
	["MZN", 2],
	["NAD", 2],
	["NGN", 2],
	["NIO", 2],
	["NOK", 2],
	["NPR", 2],
	["NZD", 2],
	["OMR", 3],
	["PAB", 2],
	["PEN", 2],
	["PGK", 2],
	["PHP", 2],
	["PKR", 2],
	["PLN", 2],
	["PYG", 0],
	["QAR", 2],
	["RON", 2],
	["RSD", 2],
	["RUB", 2],
	["RWF", 0],
	["SAR", 2],
	["SBD", 2],
	["SCR", 2],
	["SDG", 2],
	["SEK", 2],
	["SGD", 2],
	["SHP", 2],
	["SLL", 2],
	["SOS", 2],
	["SRD", 2],
	["SSP", 2],
	["STD", 2],
	["STN", 2],
	["SVC", 2],
	["SYP", 2],
	["SZL", 2],
	["THB", 2],
	["TJS", 2],
	["TMT", 2],
	["TND", 3],
	["TOP", 2],
	["TRY", 2],
	["TTD", 2],
	["TWD", 2],
	["TZS", 2],
	["UAH", 2],
	["UGX", 0],
	["USD", 2],
	["USN", 2],
	["UYI", 0],
	["UYU", 2],
	["UYW", 4],
	["UZS", 2],
	["VED", 2],
	["VEF", 2],
	["VES", 2],
	["VND", 0],
	["VUV", 0],
	["WST", 2],
	["XAF", 0],
	["XAG", 0],
	["XAU", 0],
	["XBA", 0],
	["XBB", 0],
	["XBC", 0],
	["XBD", 0],
	["XCD", 2],
	["XDR", 0],
	["XOF", 0],
	["XPD", 0],
	["XPF", 0],
	["XPT", 0],
	["XSU", 0],
	["XTS", 0],
	["XUA", 0],
	["YER", 2],
	["ZAR", 2],
	["ZMW", 2],
	["ZWL", 2],
]);

const storagePrefix = "giderim";

export const storageKeys = {
	lang: `${storagePrefix}-lang`,
	theme: `${storagePrefix}-theme`,
	mainCurrency: `${storagePrefix}-main-currency`,
	decimal: `${storagePrefix}-decimal`,
	decimalMode: `${storagePrefix}-decimal-mode`,
	tinyDecimal: `${storagePrefix}-tiny-decimal`,
	monthTabs: `${storagePrefix}-month-tabs`, // @deprecated
	onboarding: `${storagePrefix}-onboarding`,
	firstShowAnimation: `${storagePrefix}-first-show-animation`,
	activeScreen: `${storagePrefix}-active-screen`,
	calendarType: `${storagePrefix}-calendar-type`,
	calendarVision: `${storagePrefix}-calendar-vision`,
	calendarIndex: `${storagePrefix}-calendar-index`,
};

export async function minDelay<T>(promise: Promise<T>, ms: number) {
	const delay = new Promise((resolve) => setTimeout(resolve, ms));
	const [p] = await Promise.all([promise, delay]);
	return p;
}

export const FADE_IN_ANIMATION_SETTINGS = {
	initial: { opacity: 0 },
	animate: { opacity: 1 },
	exit: { opacity: 0 },
	transition: { duration: 0.2 },
};

export const STAGGER_CHILD_VARIANTS = {
	hidden: { opacity: 0, y: 20 },
	show: { opacity: 1, y: 0, transition: { duration: 0.25, type: "spring" } },
};

export const validateMnemonic = (mnemonic: string) => {
	const mnemonicTrimmed = mnemonic.trim();
	return bip39.validateMnemonic(mnemonicTrimmed, wordlist) ? (mnemonicTrimmed as Mnemonic) : null;
};

export function setThemeColor(theme: Theme) {
	const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "#09090B" : "white";
	const themeColor = theme === "system" ? systemTheme : theme === "light" ? "white" : "#09090B";
	document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor);
}

export const format = (
	value: number,
	currencyIsoCode?: string,
	type: "short" | "long" = "long",
	digits?: number,
	signDisplay = false,
	_smallDigits?: number,
	locale?: string,
	decimalMode?: TDecimalMode,
	asString = false,
) => {
	try {
		// if (!digits && currencyIsoCode) {
		//   digits = (defaultCurrencyDecimalPlaces.get(currencyIsoCode) ||
		//     DEFAULT_DECIMAL_PLACES) as number;
		// }

		const _digits = !digits ? 0 : digits;

		let result = new Intl.NumberFormat(locale || BROWSER_LOCALE, {
			style: "currency",
			currencyDisplay: "narrowSymbol",
			signDisplay: signDisplay ? "always" : "auto",
			currency: currencyIsoCode,
			minimumFractionDigits: _digits,
			maximumFractionDigits: _digits,
		}).format(value);

		// we are adding iso code at the end of the string, so we need to remove it if it's already there
		if (type === "long" && currencyIsoCode) {
			if (result.startsWith(currencyIsoCode)) {
				result = result.replace(currencyIsoCode, "").trim();
			} else if (result.endsWith(currencyIsoCode)) {
				result = result.replace(currencyIsoCode, "").trim();
			}
		}

		// let temp = "";
		let { decimalSymbol, thousandSymbol } = getNumberSymbols(locale);

		if (decimalMode) {
			// let's modify the result and replace decimal and thousand symbols
			// if decimalMode is set to "comma"
			if (decimalMode === "comma" || decimalMode === "comma-space") {
				result = result.replaceAll(thousandSymbol, "#"); // convert all dots to -
				result = result.replace(decimalSymbol, ","); // convert dot to comma
				result = result.replaceAll("#", ".");
				decimalSymbol = ",";
				thousandSymbol = ".";
			}

			if (decimalMode === "dot" || decimalMode === "dot-space") {
				result = result.replaceAll(thousandSymbol, "#");
				result = result.replace(decimalSymbol, ".");
				result = result.replaceAll("#", ",");
				decimalSymbol = ".";
				thousandSymbol = ",";
			}

			if (decimalMode === "dot-space" || decimalMode === "comma-space") {
				result = result.replaceAll(thousandSymbol, " ");
				thousandSymbol = " ";
			}
		}

		if (asString) return result;

		// if (smallDigits) {
		// we need to find all decimal places and wrap small digits in <small> tag
		// for example: digits -> 2 123.4567 -> 123.45<small>67</small>
		const decimalIndex = result.indexOf(decimalSymbol);

		if (decimalIndex !== -1) {
			const dIndex = decimalIndex;
			return (
				<span>
					{result.substring(0, dIndex)}
					<small className="text-muted-foreground">
						{result.substring(dIndex, dIndex + _digits)}
						{result.substring(dIndex + _digits)}
					</small>
					{type === "long" && ` ${currencyIsoCode}`}
				</span>
			);
		}
		// }

		if (type === "long") {
			result = `${result} ${currencyIsoCode}`;
		}

		return result;
	} catch (error) {
		return currencyIsoCode ? `${value} ${currencyIsoCode}` : value;
	}
};

export const formatRate = (value: number, digits: number, smallDigits: number, locale?: string) => {
	const safeDigits = Number.isNaN(digits) ? 2 : digits;
	const result = new Intl.NumberFormat(locale || BROWSER_LOCALE, {
		minimumFractionDigits: safeDigits,
		maximumFractionDigits: safeDigits,
	}).format(value);

	if (smallDigits) {
		// we need to find all decimal places and wrap small digits in <small> tag
		// for example: digits -> 2 123.4567 -> 123.45<small>67</small>
		const { decimalSymbol } = getNumberSymbols(locale);
		const decimalIndex = result.indexOf(decimalSymbol);

		if (decimalIndex !== -1) {
			return (
				<span>
					{result.substring(0, decimalIndex + 1)}
					{result.substring(decimalIndex + 1, decimalIndex + 1 + (safeDigits - smallDigits))}
					<small>{result.substring(decimalIndex + 1 + (safeDigits - smallDigits))}</small>
				</span>
			);
		}
	}

	return result;
};

export const getNumberSymbols = (locale?: string) => {
	const formattedNumber = new Intl.NumberFormat(locale || BROWSER_LOCALE, {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1,
	}).format(123456.7);

	let thousandSymbol: string | undefined;
	let decimalSymbol: string | undefined;
	for (const char of formattedNumber) {
		if (Number.isNaN(Number.parseInt(char, 10))) {
			if (thousandSymbol) decimalSymbol = char;
			else thousandSymbol = char;
		}
	}
	return { thousandSymbol, decimalSymbol } as {
		decimalSymbol: string;
		thousandSymbol: string;
	};
};

export const BROWSER_LOCALE = new Intl.NumberFormat().resolvedOptions().locale;
