import { cva } from "class-variance-authority";

export const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				positive: "bg-green-700 text-white hover:bg-green-700/90",
				destructive: "bg-orange-700 text-white hover:bg-orange-700/90",
				outline:
					"border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-zinc-200 dark:active:bg-zinc-900",
				ghost: "hover:bg-accent hover:text-accent-foreground",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-10 px-4 py-2",
				xs: "h-8 px-2.5",
				sm: "h-9 px-3",
				lg: "h-11 px-8",
				icon: "size-10",
				iconMd: "size-8",
				iconXs: "size-6",
				iconLarge: "size-12",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);
