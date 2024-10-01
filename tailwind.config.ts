import tailwindforms from "@tailwindcss/forms";
import type { Config } from "tailwindcss";
import tailwindanimate from "tailwindcss-animate";
import displayModes from "tailwindcss-displaymodes";
import * as defaultTheme from "tailwindcss/defaultTheme";

const config = {
	darkMode: ["class"],
	content: ["./src/**/*.{ts,tsx}"],
	prefix: "",
	future: {
		hoverOnlyWhenSupported: true,
	},
	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter Variable", ...defaultTheme.fontFamily.sans],
				mono: ["Roboto Mono Variable", ...defaultTheme.fontFamily.mono],
			},
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
			},
			borderRadius: {
				xxs: "calc(var(--radius) - 6px)",
				xs: "calc(var(--radius) - 4px)",
				sm: "calc(var(--radius) - 2px)",
				DEFAULT: "var(--radius)",
				md: "calc(var(--radius) + 2px)",
				lg: "calc(var(--radius) + 4px)",
				xl: "calc(var(--radius) + 6px)",
				"2xl": "calc(var(--radius) + 8px)",
				"3xl": "calc(var(--radius) + 10px)",
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				shake: {
					"10%, 90%": {
						transform: "translate3d(-1px, 0, 0)",
					},
					"20%, 80%": {
						transform: "translate3d(2px, 0, 0)",
					},
					"30%, 50%, 70%": {
						transform: "translate3d(-4px, 0, 0)",
					},
					"40%, 60%": {
						transform: "translate3d(4px, 0, 0)",
					},
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				shake: "shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)",
			},
		},
	},
	plugins: [tailwindanimate, tailwindforms, displayModes],
} satisfies Config;

export default config;
