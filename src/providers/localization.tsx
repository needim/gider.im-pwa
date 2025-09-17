import { type TCurrency, currencies } from "@/lib/currencies";
import { getNumberSymbols, storageKeys } from "@/lib/utils";
import * as m from "@/paraglide/messages";
import {
	type AvailableLanguageTag,
	availableLanguageTags,
	setLanguageTag,
	sourceLanguageTag,
} from "@/paraglide/runtime";
import dayjs from "dayjs";
import { createContext, useEffect, useMemo, useState } from "react";

type LocalizationProviderProps = {
	children: React.ReactNode;
	defaultLang?: AvailableLanguageTag;
	defaultMainCurrency?: string;
	defaultDecimalMode?: TDecimalMode;
	defaultDecimal?: number;
	defaultTinyDecimal?: number;
};

type LocalizationProviderState = {
	decimal: number;
	setDecimal: (decimal: number) => void;
	// -------------------
	decimalMode: TDecimalMode;
	setDecimalMode: (mode: TDecimalMode) => void;
	// -------------------
	tinyDecimal: number;
	setTinyDecimal: (count: number) => void;
	// -------------------
	mainCurrency: string;
	setMainCurrency: (iso: string) => void;
	// -------------------
	getCurrency: (iso: string) => TCurrency | undefined;
	getMainCurrency: () => TCurrency | undefined;
	// -------------------
	lang: AvailableLanguageTag;
	setLang: (lang: AvailableLanguageTag) => void;
	m: typeof m;
	availableLanguageTags: typeof availableLanguageTags;
	languageTagNames: Record<AvailableLanguageTag, string>;
};

const languageNames = {
	tr: "Türkçe",
	en: "English",
};

const initialState: LocalizationProviderState = {
	tinyDecimal: 2,
	setTinyDecimal: () => null,
	// -------------------
	decimal: 2,
	setDecimal: () => null,
	// -------------------
	decimalMode: "comma",
	setDecimalMode: () => null,
	// -------------------
	mainCurrency: "TRY",
	setMainCurrency: () => null,
	// -------------------
	getCurrency: () => undefined,
	getMainCurrency: () => undefined,
	// -------------------
	lang: sourceLanguageTag,
	setLang: () => null,
	availableLanguageTags,
	m,
	languageTagNames: languageNames,
};

export const DECIMAL_MODES = {
	comma: {
		decimal: ",",
		thousands: ".",
	},
	dot: {
		decimal: ".",
		thousands: ",",
	},
	"comma-space": {
		decimal: ",",
		thousands: " ",
	},
	"dot-space": {
		decimal: ".",
		thousands: " ",
	},
};

export const findDecimalModeBySymbol = (symbol: string) => {
	return Object.keys(DECIMAL_MODES).find(
		(key) => DECIMAL_MODES[key as TDecimalMode].decimal === symbol,
	) as TDecimalMode;
};

export type TDecimalMode = keyof typeof DECIMAL_MODES;

export const LocalizationProviderContext =
	createContext<LocalizationProviderState>(initialState);

export function LocalizationProvider({
	children,
	defaultLang = sourceLanguageTag,
	defaultMainCurrency = "TRY",
	defaultDecimal = 2,
	defaultTinyDecimal = 2,
	...props
}: LocalizationProviderProps) {
	const localStorageData = {
		lang: localStorage.getItem(storageKeys.lang) as AvailableLanguageTag,
		mainCurrency: localStorage.getItem(storageKeys.mainCurrency),
		decimal: Number(localStorage.getItem(storageKeys.decimal)),
		decimalMode: localStorage.getItem(storageKeys.decimalMode) as TDecimalMode,
		tinyDecimal: Number(localStorage.getItem(storageKeys.tinyDecimal)),
	};

	const [lang, setLang] = useState<AvailableLanguageTag>(
		() => localStorageData.lang || defaultLang,
	);

	useEffect(() => {
    document.documentElement.lang = lang;
		dayjs.locale(lang);
	}, [lang]);

	const [mainCurrency, setMainCurrency] = useState<string>(
		localStorageData.mainCurrency || defaultMainCurrency,
	);

	const ns = getNumberSymbols(lang);

	const [decimalMode, setDecimalMode] = useState<TDecimalMode>(
		localStorageData.decimalMode || findDecimalModeBySymbol(ns.decimalSymbol),
	);
	const [decimal, setDecimal] = useState<number>(
		localStorageData.decimal || defaultDecimal,
	);
	const [tinyDecimal, setTinyDecimal] = useState<number>(
		localStorageData.tinyDecimal || defaultTinyDecimal,
	);

	const getCurrency = (iso: string) => {
		return currencies.find((curr) => curr.iso_code === iso);
	};

	const getMainCurrency = useMemo(
		() => () => {
			return currencies.find((curr) => curr.iso_code === mainCurrency);
		},
		[mainCurrency],
	);

	const value: LocalizationProviderState = {
		decimal,
		setDecimal: (decimal: number) => {
			localStorage.setItem(storageKeys.decimal, decimal.toString());
			setDecimal(decimal);
		},
		// -------------------
		decimalMode,
		setDecimalMode: (mode: TDecimalMode) => {
			localStorage.setItem(storageKeys.decimalMode, mode);
			setDecimalMode(mode);
		},
		// -------------------
		tinyDecimal,
		setTinyDecimal: (amount: number) => {
			localStorage.setItem(storageKeys.tinyDecimal, amount.toString());
			setTinyDecimal(amount);
		},
		// -------------------
		mainCurrency,
		setMainCurrency: (iso: string) => {
			localStorage.setItem(storageKeys.mainCurrency, iso);
			setMainCurrency(iso);
		},

		// -------------------
		getCurrency,
		getMainCurrency,
		// -------------------
		availableLanguageTags,
		languageTagNames: languageNames,
		lang,
		setLang: (lang: AvailableLanguageTag) => {
			localStorage.setItem(storageKeys.lang, lang);
			setLanguageTag(lang);
			setLang(lang);
			dayjs.locale(lang);
		},
		m,
	};

	return (
		<LocalizationProviderContext.Provider {...props} value={value}>
			{children}
		</LocalizationProviderContext.Provider>
	);
}
