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
import { useLocalization } from "@/hooks/use-localization";
import type { EntryCreateType } from "@/schemas/entry";
import { IconArrowDownRight, IconArrowUpRight, IconCheck, type TablerIcon } from "@tabler/icons-react";

export function EntryTypeSelect({
	value = "income",
	onValueChange,
}: {
	value: EntryCreateType["type"];
	onValueChange: (value: EntryCreateType["type"]) => void;
}) {
	const { m } = useLocalization();
	const types: { value: EntryCreateType["type"]; label: string; icon: TablerIcon }[] = [
		{ value: "income", label: m.Income(), icon: IconArrowUpRight },
		{ value: "expense", label: m.Expense(), icon: IconArrowDownRight },
	];

	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button size="sm" variant={value === "income" ? "positive" : "destructive"}>
					{value === "income" && <IconArrowUpRight className="-left-1.5 relative size-4 shrink-0" />}
					{value === "expense" && <IconArrowDownRight className="-left-1.5 relative size-4 shrink-0" />}
					<span className="truncate max-w-24">{types.find((t) => t.value === value)?.label}</span>
				</Button>
			</DrawerTrigger>
			<DrawerContent className="pb-4 max-w-md px-4 mx-auto max-h-96">
				<DrawerHeader className="sr-only">
					<DrawerTitle>Entry type selector</DrawerTitle>
					<DrawerDescription>Select the type of entry you want to create</DrawerDescription>
				</DrawerHeader>
				<VerticalScrollView className="max-h-72 overflow-x-hidden gap-2 scrollGradient mt-4">
					{types.map((type) => (
						<DrawerClose asChild key={type.value}>
							<Button
								onClick={() => onValueChange(type.value)}
								variant={value === type.value ? "default" : "secondary"}
								className="shrink-0 w-full justify-start"
								size="lg"
								key={type.value}
							>
								<span className="flex items-center">
									<type.icon className="-left-1.5 relative size-4 shrink-0" /> {type.label}
								</span>
								{value === type.value && <IconCheck className="ml-auto size-5" />}
							</Button>
						</DrawerClose>
					))}
				</VerticalScrollView>
			</DrawerContent>
		</Drawer>
	);
}
