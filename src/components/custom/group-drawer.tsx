import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { type TEvoluDB, decodeName } from "@/evolu-db";
import { groupsQuery } from "@/evolu-queries";
import { useLocalization } from "@/hooks/use-localization";
import { deleteGroup } from "@/lib/delete";
import { useEvolu, useQuery } from "@evolu/react";
import { IconFolderOpen, IconPlus, IconTrash } from "@tabler/icons-react";
import React, { forwardRef, useImperativeHandle } from "react";

type GroupDrawerProps = {};

export interface GroupDrawerRef {
	openDrawer: () => void;
	closeDrawer: () => void;
}

export const GroupDrawer = forwardRef<GroupDrawerRef, GroupDrawerProps>((_, ref) => {
	const { m } = useLocalization();
	const { create } = useEvolu<TEvoluDB>();
	const groups = useQuery(groupsQuery);
	const [open, setOpen] = React.useState(false);
	const [newGroupName, setNewGroupName] = React.useState<string>("");

	useImperativeHandle(ref, () => ({
		openDrawer: () => {
			setOpen(true);
		},
		closeDrawer: () => {
			setOpen(false);
		},
	}));

	return (
		<>
			<Sheet
				open={open}
				onOpenChange={(isOpen) => {
					setOpen(isOpen);
				}}
			>
				<SheetContent side="right" className="overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
					<div className="px-1">
						<div className="text-lg flex items-center capitalize font-medium leading-none tracking-tight h-11">
							{m.Groups()}
						</div>

						{groups.rows.length === 0 && (
							<div className="pb-6 py-4 flex flex-col gap-2 text-muted-foreground text-center text-balance mt-4">
								<IconFolderOpen className="size-12 stroke-1 mx-auto mb-3 text-zinc-400 dark:text-zinc-600" />
								{m.GroupsEmptyDesc()}
							</div>
						)}
						<div className="flex items-center gap-2 mb-4">
							<Input
								value={newGroupName}
								onChange={(e) => setNewGroupName(e.target.value)}
								placeholder={m.GroupPlaceholder()}
							/>
							<Button
								variant="default"
								size="icon"
								className="shrink-0"
								onClick={() => {
									create("entryGroup", {
										name: decodeName(newGroupName),
									});
									setNewGroupName("");
								}}
							>
								<IconPlus className="size-5" />
							</Button>
						</div>
						{groups.rows.length > 0 && (
							<div className="grid grid-cols-1 gap-0.5 mt-4">
								{groups.rows.map((group) => (
									<div
										key={group.id}
										className="flex items-center justify-between p-3 py-2 pl-5 rounded bg-zinc-100 dark:bg-zinc-900"
									>
										<div className="text-base font-medium">{group.name}</div>
										<Button
											size="icon"
											variant="outline"
											onClick={() => {
												deleteGroup(group.id);
											}}
										>
											<IconTrash className="size-5" />
										</Button>
									</div>
								))}
							</div>
						)}
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
});
