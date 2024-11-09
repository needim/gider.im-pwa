import { VerticalScrollView } from "@/components/custom/v2/vertical-scroll-view";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { currencies } from "@/lib/currencies";
import { IconCheck } from "@tabler/icons-react";
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
		<Drawer nested>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent className="pb-0 max-w-md px-4 mx-auto max-h-96">
				<DrawerHeader className="sr-only">
					<DrawerTitle>Select a currency</DrawerTitle>
					<DrawerDescription>Select a currency</DrawerDescription>
				</DrawerHeader>
				<VerticalScrollView className="max-h-72 overflow-x-hidden gap-2 scrollGradient mt-4">
					{currencies.map((currency) => (
						<DrawerClose asChild key={currency.iso_code}>
							<Button
								onClick={() => onValueChange(currency.iso_code)}
								variant={value === currency.iso_code ? "default" : "secondary"}
								className="shrink-0 w-full justify-start"
								size="lg"
								key={currency.iso_code}
							>
								<span>
									{currency.name}
									<span className="text-muted-foreground"> - {currency.symbol}</span>
								</span>
								{value === currency.iso_code && <IconCheck className="ml-auto size-5" />}
							</Button>
						</DrawerClose>
					))}
				</VerticalScrollView>
			</DrawerContent>
		</Drawer>
	);
}
