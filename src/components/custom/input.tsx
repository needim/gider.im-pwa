import { cn } from "@/lib/utils";
import React, { useId } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string;
	labelExtra?: React.ReactNode;
	wrapperClassName?: string;
	labelClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	(
		{
			className,
			children,
			wrapperClassName,
			type,
			label,
			labelExtra,
			inputMode,
			placeholder,
			labelClassName,
			...props
		},
		ref,
	) => {
		const id = useId();
		return (
			<div
				className={cn(
					"rounded px-3 pb-1.5 pt-2.5 shadow-sm ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 focus-within:ring-2 focus-within:ring-zinc-600 dark:focus-within:ring-zinc-400 dark:bg-zinc-950 bg-white",
					wrapperClassName,
				)}
			>
				<label
					htmlFor={id}
					className={cn(
						"text-xs flex items-center justify-between font-medium capitalize text-zinc-900 dark:text-zinc-100",
						labelClassName,
					)}
				>
					<span>{label}</span>
					{labelExtra}
				</label>
				<input
					ref={ref}
					type={type}
					inputMode={inputMode}
					data-1p-ignore
					className={cn(
						"block w-full dark:bg-zinc-950 bg-white placeholder-zinc-300 dark:placeholder-zinc-600 border-0 p-0 text-zinc-950 dark:text-zinc-100  bg-transparent focus:ring-0 sm:text-sm sm:leading-6",
						className,
					)}
					placeholder={placeholder}
					{...props}
					id={id}
				/>
				{children}
			</div>
		);
	},
);

Input.displayName = "Input";

export { Input };
