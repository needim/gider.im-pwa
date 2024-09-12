import { cn } from "@/lib/utils";
import type { TablerIcon } from "@tabler/icons-react";
import * as React from "react";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	startIcon?: TablerIcon;
	startIconClassName?: string;
	endIcon?: TablerIcon;
	parentClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	(
		{
			className,
			parentClassName,
			type,
			startIcon,
			startIconClassName,
			endIcon,
			...props
		},
		ref,
	) => {
		const StartIcon = startIcon;
		const EndIcon = endIcon;

		return (
			<div className={cn("w-full relative", parentClassName)}>
				{StartIcon && (
					<div className="absolute left-2 top-1/2 transform -translate-y-1/2">
						<StartIcon
							className={cn("size-5 text-muted-foreground", startIconClassName)}
						/>
					</div>
				)}
				<input
					data-1p-ignore
					type={type}
					className={cn(
						"flex h-10 w-full rounded border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 focus:border-transparent",
						startIcon ? "pl-8" : "",
						endIcon ? "pr-8" : "",
						className,
					)}
					ref={ref}
					{...props}
				/>
				{EndIcon && (
					<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
						<EndIcon className="text-muted-foreground" size={18} />
					</div>
				)}
			</div>
		);
	},
);
Input.displayName = "Input";

export { Input };
