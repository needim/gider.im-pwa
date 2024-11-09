import { Calendar } from "@/components/ui/calendar";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

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
		<Drawer>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent className="max-w">
				<Calendar
					mode="single"
					className="max-w-screen-sm mx-auto"
					selected={value}
					defaultMonth={value}
					onSelect={onValueChange}
					initialFocus
					weekStartsOn={1}
				/>
			</DrawerContent>
		</Drawer>
	);
}
