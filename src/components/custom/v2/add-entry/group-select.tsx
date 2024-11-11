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
import type { TGroupId } from "@/evolu-db";
import { groupsQuery } from "@/evolu-queries";
import { useLocalization } from "@/hooks/use-localization";
import { useQuery } from "@evolu/react";
import { IconCategory2, IconCheck } from "@tabler/icons-react";

export function GroupSelect({
	value,
	onValueChange,
}: {
	value: string | undefined;
	onValueChange: (value: TGroupId | "no-group") => void;
}) {
	const groups = useQuery(groupsQuery);
	const { m } = useLocalization();
	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button size="sm" variant="secondary">
					<IconCategory2 className="-left-1.5 relative text-muted-foreground size-5 shrink-0" />
					<span className="truncate max-w-24">
						{groups.rows.find((g) => g.id === value)?.name || (
							<span className="text-muted-foreground">{m.Group()}</span>
						)}
					</span>
				</Button>
			</DrawerTrigger>
			<DrawerContent className="pb-4 max-w-md px-4 mx-auto max-h-96">
				<DrawerHeader className="sr-only">
					<DrawerTitle>Group selector</DrawerTitle>
					<DrawerDescription>
						Select the group you want to add this entry to, or select "No group" to add it to the default group
					</DrawerDescription>
				</DrawerHeader>

				<VerticalScrollView className="max-h-72 overflow-x-hidden gap-2 scrollGradient mt-4">
					<DrawerClose asChild>
						<Button
							variant={!value ? "default" : "secondary"}
							className="shrink-0 w-full justify-start"
							size="lg"
							onClick={() => onValueChange("no-group")}
						>
							{m.Ungrouped()}
							{!value && <IconCheck className="ml-auto size-5" />}
						</Button>
					</DrawerClose>
					{groups.rows.map((group) => (
						<DrawerClose asChild key={group.id}>
							<Button
								onClick={() => onValueChange(group.id)}
								variant={value === group.id ? "default" : "secondary"}
								className="shrink-0 w-full justify-start"
								size="lg"
							>
								{group.name}
								{value === group.id && <IconCheck className="ml-auto size-5" />}
							</Button>
						</DrawerClose>
					))}
				</VerticalScrollView>
			</DrawerContent>
		</Drawer>
	);
}
