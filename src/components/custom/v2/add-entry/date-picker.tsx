import { Calendar } from "@/components/ui/calendar";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

export function DatePicker({
	children,
	value,
	mode = "free",
	onValueChange,
}: {
	children: React.ReactElement;
	value: Date;
	mode?: "day-change" | "free";
	onValueChange: (value?: Date) => void;
}) {
	return (
		<Drawer>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent className="max-w-md mx-auto">
				<Calendar
					mode="single"
					className="max-w-screen-sm mx-auto"
					selected={value}
					defaultMonth={value}
					onSelect={onValueChange}
					disableNavigation={mode === "day-change"}
					showOutsideDays={false}
					initialFocus
					weekStartsOn={1}
				/>
			</DrawerContent>
		</Drawer>
	);
}
