import { Button } from "@/components/ui/button";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { useLocalization } from "@/hooks/use-localization";
import type { EntryCreateType } from "@/schemas/entry";
import { Select, SelectTrigger } from "@radix-ui/react-select";
import { IconArrowDownRight, IconArrowUpRight } from "@tabler/icons-react";

export function EntryTypeSelect({
	value = "income",
	onValueChange,
}: {
	value: EntryCreateType["type"];
	onValueChange: (value: EntryCreateType["type"]) => void;
}) {
	const { m } = useLocalization();
	const types = [
		{ value: "income", label: m.Income() },
		{ value: "expense", label: m.Expense() },
	];

	return (
		<Select onValueChange={onValueChange} value={value || "no-group"}>
			<SelectTrigger asChild>
				<Button
					variant={value === "income" ? "positive" : "destructive"}
					className="justify-start shrink-0 rounded"
					disableScale
				>
					{value === "income" && <IconArrowUpRight className="-left-1.5 relative size-4 shrink-0" />}
					{value === "expense" && <IconArrowDownRight className="-left-1.5 relative size-4 shrink-0" />}
					<span className="truncate max-w-24">{types.find((t) => t.value === value)?.label}</span>
				</Button>
			</SelectTrigger>
			<SelectContent>
				{types.map((type) => (
					<SelectItem key={type.value} value={type.value}>
						{type.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
