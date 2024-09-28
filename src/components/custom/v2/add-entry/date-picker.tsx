import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({
	children,
	value,
	onValueChange,
}: {
	children: React.ReactElement;
	value: Date;
	onValueChange: (value?: Date) => void;
}) {
	return (
		<Popover>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={value}
					defaultMonth={value}
					onSelect={onValueChange}
					initialFocus
					weekStartsOn={1}
					// locale={}
				/>
			</PopoverContent>
		</Popover>
	);
}
