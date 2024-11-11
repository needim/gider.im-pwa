import { Tag } from "@/components/custom/tag";
import type { TagColor } from "@/components/custom/tag-color-picker";
import { VerticalScrollView } from "@/components/custom/v2/vertical-scroll-view";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { groupsQuery, tagsQuery } from "@/evolu-queries";
import { useFilters } from "@/hooks/use-filters";
import { useLocalization } from "@/hooks/use-localization";
import { cn } from "@/lib/utils";
import { useQuery } from "@evolu/react";
import { IconCheck } from "@tabler/icons-react";

export function Filters() {
	const groups = useQuery(groupsQuery).rows;
	const tags = useQuery(tagsQuery).rows;
	const { m } = useLocalization();

	const { activeFilters: values, add, remove, clear } = useFilters();

	return (
		<Drawer>
			<DrawerTrigger asChild className={cn(groups.length + tags.length === 0 && "hidden")}>
				<Button variant="secondary" size="iconLarge" className="relative text-muted-foreground dark:opacity-60">
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className={cn("size-5")}
					>
						<path
							d="M6 12H18M3 6H21M9 18H15"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					{values?.length > 0 && (
						<span className="size-1.5 rounded-full bg-destructive dark:bg-red-500 top-3.5 absolute" />
					)}
				</Button>
			</DrawerTrigger>
			<DrawerContent className={cn("max-w-md mx-auto standalone:pb-8")}>
				<VerticalScrollView className="max-h-96 overflow-x-hidden gap-2 scrollGradient mt-4">
					<Command className={cn("bg-transparent h-full")}>
						<CommandList
							className={cn("[&>div]:grid [&>div]:grid-cols-1", groups.length && tags.length && "[&>div]:grid-cols-2")}
						>
							<CommandGroup heading={m.Groups()} className={cn(groups.length === 0 && "hidden")}>
								<CommandItem
									onSelect={() => {
										if (values.find((v) => v.id === "no-group" && v.type === "group")) {
											remove("no-group");
										} else {
											add("no-group", "group");
										}
									}}
								>
									<div
										className={cn(
											"mr-2 flex h-4 w-4 items-center justify-center rounded-xs border border-primary",
											values.find((v) => v.id === "no-group" && v.type === "group")
												? "bg-primary text-primary-foreground"
												: "opacity-50 [&_svg]:invisible",
										)}
									>
										<IconCheck className={cn("h-4 w-4")} />
									</div>
									<span>{m.Ungrouped()}</span>
								</CommandItem>
								{groups.map((group) => {
									const isSelected = values.find((v) => v.id === group.id && v.type === "group");
									return (
										<CommandItem
											key={group.id}
											onSelect={() => {
												if (isSelected) {
													remove(group.id);
												} else {
													add(group.id, "group");
												}
											}}
										>
											<div
												className={cn(
													"mr-2 flex h-4 w-4 items-center justify-center rounded-xs border border-primary",
													isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible",
												)}
											>
												<IconCheck className={cn("h-4 w-4")} />
											</div>
											<span>{group.name}</span>
										</CommandItem>
									);
								})}
							</CommandGroup>
							<CommandGroup heading={m.Tags()} className={cn(tags.length === 0 && "hidden")}>
								<CommandItem
									onSelect={() => {
										if (values.find((v) => v.id === "no-tag" && v.type === "tag")) {
											remove("no-tag");
										} else {
											add("no-tag", "tag");
										}
									}}
								>
									<div
										className={cn(
											"mr-2 flex h-4 w-4 items-center justify-center rounded-xs border border-primary",
											values.find((v) => v.id === "no-tag" && v.type === "tag")
												? "bg-primary text-primary-foreground"
												: "opacity-50 [&_svg]:invisible",
										)}
									>
										<IconCheck className={cn("h-4 w-4")} />
									</div>
									<span>{m.Untagged()}</span>
								</CommandItem>
								{tags.map((tag) => {
									const isSelected = values.find((v) => v.id === tag.id && v.type === "tag");
									return (
										<CommandItem
											key={tag.id}
											onSelect={() => {
												if (isSelected) {
													remove(tag.id);
												} else {
													add(tag.id, "tag");
												}
											}}
										>
											<div
												className={cn(
													"mr-2 flex h-4 w-4 items-center justify-center rounded-xs border border-primary",
													isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible",
												)}
											>
												<IconCheck className={cn("h-4 w-4")} />
											</div>
											<Tag className="ml-0" name={tag.name} color={tag.color as TagColor} />
										</CommandItem>
									);
								})}
							</CommandGroup>
						</CommandList>
					</Command>
				</VerticalScrollView>
				<DrawerClose className="w-full px-4 pb-2">
					<Button
						onClick={() => {
							clear();
						}}
						variant="secondary"
						className="justify-center text-center w-full"
					>
						{m.ClearFilters()}
					</Button>
				</DrawerClose>
			</DrawerContent>
		</Drawer>
	);
}
