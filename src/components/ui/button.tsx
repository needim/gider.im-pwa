import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import { buttonVariants } from "@/components/ui/button.variants";
import { cn } from "@/lib/utils";

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	disableScale?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ className, variant, disableScale, size, asChild = false, ...props },
		ref,
	) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(
					buttonVariants({ variant, size, className }),
					disableScale && "active:scale-100",
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button };
