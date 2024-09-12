import { Tag } from "@/components/custom/tag";
import {
	type TagColor,
	TagColorPicker,
} from "@/components/custom/tag-color-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { type TEvoluDB, decodeName } from "@/evolu-db";
import { deleteTag, tagsQuery } from "@/evolu-queries";
import { useLocalization } from "@/hooks/use-localization";
import { useEvolu, useQuery } from "@evolu/react";
import { IconPlus, IconTags, IconTrash } from "@tabler/icons-react";
import React, { forwardRef, useImperativeHandle } from "react";

type TagDrawerProps = {};

export interface TagDrawerRef {
	openDrawer: () => void;
	closeDrawer: () => void;
}

export const TagDrawer = forwardRef<TagDrawerRef, TagDrawerProps>((_, ref) => {
	const { create, update } = useEvolu<TEvoluDB>();
	const tags = useQuery(tagsQuery);
	const [open, setOpen] = React.useState(false);
	const [newTagName, setNewTagName] = React.useState<string>("");
	const [newTagColor, setNewTagColor] = React.useState<string>("zinc");
	const { m } = useLocalization();
	useImperativeHandle(ref, () => ({
		openDrawer: () => {
			setOpen(true);
		},
		closeDrawer: () => {
			setOpen(false);
		},
	}));

	const suggestedTags = [
		{ suggestId: "salary", name: m.Salary(), color: "green" },
		{ suggestId: "loan", name: m.Loan(), color: "red" },
		{ suggestId: "credit-card", name: m.CreditCard(), color: "purple" },
		{ suggestId: "rent", name: m.Rent(), color: "lime" },
		{ suggestId: "maintenance", name: m.Maintenence(), color: "orange" },
		{ suggestId: "bill", name: m.Bill(), color: "blue" },
	];

	const availableSuggestedTags = suggestedTags.filter(
		(suggestedTag) =>
			!tags.rows.some((tag) => tag.suggestId === suggestedTag.suggestId),
	);

	return (
		<>
			<Sheet
				open={open}
				onOpenChange={(isOpen) => {
					setOpen(isOpen);
				}}
			>
				<SheetContent
					side="right"
					className="overflow-y-auto"
					onOpenAutoFocus={(e) => e.preventDefault()}
				>
					<div className="px-1">
						<div className="text-lg text-left flex justify-between items-center capitalize font-medium leading-none tracking-tight h-11">
							{m.Tags()}
						</div>
						{tags.rows.length === 0 && (
							<div className="pb-6 py-4 flex flex-col gap-2 text-muted-foreground text-center text-balance mt-4">
								<IconTags className="size-12 mb-3 mx-auto stroke-1 text-zinc-400 dark:text-zinc-600" />
								{m.TagsEmptyDesc()}
							</div>
						)}
						<div className="flex items-center gap-2 mb-4">
							<div className="flex items-center grow">
								<TagColorPicker
									defaultValue={newTagColor}
									className="shrink-0 min-w-12 border border-r-0 h-10 rounded-l-md"
									align="start"
									onChange={(color) => {
										setNewTagColor(color);
									}}
								/>
								<Input
									value={newTagName}
									onChange={(e) => setNewTagName(e.target.value)}
									placeholder={m.TagPlaceholder()}
									className="rounded-l-none"
								/>
							</div>
							<Button
								variant="default"
								size="icon"
								className="shrink-0"
								onClick={() => {
									create("entryTag", {
										name: decodeName(newTagName),
										color: newTagColor,
									});
									setNewTagColor("zinc");
									setNewTagName("");
								}}
							>
								<IconPlus className="size-5" />
							</Button>
						</div>
						{tags.rows.length > 0 && (
							<div className="grid grid-cols-1 gap-0.5 mt-4">
								{tags.rows.map((tag) => (
									<div
										key={tag.id}
										className="flex items-center justify-between p-3 py-2 rounded bg-zinc-100 dark:bg-zinc-900"
									>
										<div className="inline-flex items-center gap-2">
											<Tag
												className="text-base font-medium"
												dotClassName="size-4 mr-1"
												allowColorChange
												onColorChange={(color) => {
													update("entryTag", { id: tag.id, color });
												}}
												name={tag.name}
												color={tag.color as TagColor}
											/>
										</div>
										<Button
											size="icon"
											variant="outline"
											onClick={() => {
												deleteTag(tag.id);
											}}
										>
											<IconTrash className="size-5" />
										</Button>
									</div>
								))}
							</div>
						)}
						{availableSuggestedTags.length > 0 && (
							<div className="mt-4">
								<div className="text-lg text-left flex items-center gap-2 capitalize font-medium leading-none tracking-tight h-11">
									{m.SuggestedTags()}
								</div>
								<div className="grid grid-cols-1 gap-0.5 mt-2">
									{availableSuggestedTags.map((tag) => (
										<div
											key={tag.suggestId}
											className="flex items-center justify-between p-3 py-2 rounded bg-zinc-100 dark:bg-zinc-900"
										>
											<div className="inline-flex items-center gap-2">
												<Tag
													className="text-base font-medium"
													dotClassName="size-2 mr-1"
													name={tag.name}
													color={tag.color as TagColor}
												/>
											</div>
											<Button
												size="icon"
												variant="outline"
												onClick={() => {
													create("entryTag", {
														name: decodeName(tag.name),
														color: tag.color,
														suggestId: tag.suggestId,
													});
												}}
											>
												<IconPlus className="size-5" />
											</Button>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
});
