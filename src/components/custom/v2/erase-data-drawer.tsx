import { Button } from "@/components/ui/button";

import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { evolu } from "@/evolu-db";
import { IconTrashXFilled } from "@tabler/icons-react";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface EraseDataDrawerRef {
	openDrawer: () => void;
	closeDrawer: () => void;
}

export const EraseDataDrawer = forwardRef<EraseDataDrawerRef, {}>((_, ref) => {
	const [open, setOpen] = useState(false);
	// const { m } = useLocalization();

	useImperativeHandle(ref, () => ({
		openDrawer: () => {
			setOpen(true);
		},
		closeDrawer: () => {
			setOpen(false);
		},
	}));

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerContent className="pb-6 max-w-md mx-auto">
				<DrawerHeader>
					<IconTrashXFilled className="text-red-500 w-12 h-12 mx-auto mb-2" />
					<DrawerTitle>Are you absolutely sure?</DrawerTitle>
					<DrawerDescription>This action cannot be undone.</DrawerDescription>
				</DrawerHeader>
				<DrawerFooter>
					<Button
						variant="destructive"
						size="lg"
						onClick={async () => {
							await evolu.resetOwner({ reload: false });
							window.localStorage.clear();
							window.location.reload();
						}}
					>
						Erase all data and start over
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
});
