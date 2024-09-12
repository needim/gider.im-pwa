import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
} from "@/components/ui/select";
import { currencies } from "@/lib/currencies";
import { SelectTrigger } from "@radix-ui/react-select";
import type React from "react";

export function CurrencySelector({
	children,
	value,
	onValueChange,
}: {
	children: React.ReactElement;
	value: string;
	onValueChange: (value: string) => void;
}): React.ReactElement {
	return (
		<Select value={value} onValueChange={(value) => onValueChange(value)}>
			<SelectTrigger asChild>{children}</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					{currencies.map((currency) => (
						<SelectItem key={currency.iso_code} value={currency.iso_code}>
							{currency.name}
							<span className="text-muted-foreground">
								{" "}
								- {currency.symbol}
							</span>
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
