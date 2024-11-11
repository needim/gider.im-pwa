import { Tag } from "@/components/custom/tag";
import type { TagColor } from "@/components/custom/tag-color-picker";
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
import type { TTagId } from "@/evolu-db";
import { tagsQuery } from "@/evolu-queries";
import { useLocalization } from "@/hooks/use-localization";
import { useQuery } from "@evolu/react";
import { IconCheck, IconTag } from "@tabler/icons-react";

export function TagSelect({
	value,
	onValueChange,
}: {
	value: string | undefined;
	onValueChange: (value: TTagId | "no-tag") => void;
}) {
	const tags = useQuery(tagsQuery);
	const { m } = useLocalization();
	const selectedTag = tags.rows.find((t) => t.id === value);

	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button size="sm" variant="secondary">
					<IconTag className="-left-1.5 relative text-muted-foreground size-5 shrink-0" />
					<span className="truncate max-w-24">
						{selectedTag ? (
							<Tag
								className="ml-0"
								name={selectedTag.name}
								allowColorChange={false}
								displayColor={false}
								color={selectedTag.color as TagColor}
							/>
						) : (
							<span className="text-muted-foreground">{m.Tag()}</span>
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
							onClick={() => onValueChange("no-tag")}
						>
							{m.Untagged()}
							{!value && <IconCheck className="ml-auto size-5" />}
						</Button>
					</DrawerClose>
					{tags.rows.map((tag) => (
						<DrawerClose asChild key={tag.id}>
							<Button
								onClick={() => onValueChange(tag.id)}
								className="shrink-0 w-full justify-start"
								variant={value === tag.id ? "default" : "secondary"}
							>
								<Tag className="ml-0" name={tag.name} color={tag.color as TagColor} />
								{value === tag.id && <IconCheck className="ml-auto size-5" />}
							</Button>
						</DrawerClose>
					))}
				</VerticalScrollView>
			</DrawerContent>
		</Drawer>
		// <Select onValueChange={onValueChange} value={value || "no-tag"}>
		// 	<SelectTrigger asChild>
		// 		<Button
		// 			variant="outline"
		// 			className="justify-start shrink-0 rounded"
		// 			disableScale
		// 		>
		// 			<IconTag className="-left-1.5 relative text-muted-foreground size-5 shrink-0" />
		// 			<span className="truncate max-w-24">
		// 				{selectedTag ? (
		// 					<Tag
		// 						className="ml-0"
		// 						name={selectedTag.name}
		// 						allowColorChange={false}
		// 						displayColor={false}
		// 						color={selectedTag.color as TagColor}
		// 					/>
		// 				) : (
		// 					<span className="text-muted-foreground">{m.Tag()}</span>
		// 				)}
		// 			</span>
		// 		</Button>
		// 	</SelectTrigger>
		// 	<SelectContent>
		// 		<SelectItem value="no-tag">{m.Tag()}</SelectItem>
		// 		{tags.rows.map((tag) => (
		// 			<SelectItem key={tag.id} value={tag.id}>
		// 				<Tag
		// 					className="ml-0"
		// 					name={tag.name}
		// 					color={tag.color as TagColor}
		// 				/>
		// 			</SelectItem>
		// 		))}
		// 	</SelectContent>
		// </Select>
	);
}
