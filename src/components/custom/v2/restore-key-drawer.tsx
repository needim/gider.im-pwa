import { Button } from "@/components/ui/button";

import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { useToast } from "@/components/ui/use-toast";
import { useLocalization } from "@/hooks/use-localization";
import { storageKeys, validateMnemonic } from "@/lib/utils";
import { IconCloudDownload } from "@tabler/icons-react";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface RestoreKeyDrawerRef {
	openDrawer: () => void;
	closeDrawer: () => void;
}

export const RestoreKeyDrawer = forwardRef<RestoreKeyDrawerRef, {}>((_, ref) => {
	const [open, setOpen] = useState(false);
	const [restoreKey, setRestoreKey] = useState("");
	const [restoring, setRestoring] = useState(false);

	const { m } = useLocalization();

	useImperativeHandle(ref, () => ({
		openDrawer: () => {
			setOpen(true);
		},
		closeDrawer: () => {
			setOpen(false);
		},
	}));

	const { toast } = useToast();

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerContent className="pb-6 max-w-md mx-auto">
				<DrawerHeader>
					<IconCloudDownload className="w-12 h-12 mx-auto mb-2" />
					<DrawerTitle>{m.RestoreWithPrivateKey()}</DrawerTitle>
					<DrawerDescription className="text-balance">{m.RestoreWithPrivateKeyDesc()}</DrawerDescription>
				</DrawerHeader>
				<div className="mx-4">
					<textarea
						value={restoreKey}
						onChange={(e) => setRestoreKey(e.target.value)}
						placeholder={m.PasteYourPrivateKeyHere()}
						className="font-mono flex h-10 w-full rounded border border-border bg-background min-h-24 text-center ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 focus:border-transparent"
					/>
				</div>
				<DrawerFooter className="grid grid-cols-1">
					<Button
						variant="default"
						size="lg"
						disabled={!restoreKey || restoring}
						onClick={() => {
							const validKey = validateMnemonic(restoreKey);
							if (!validKey) {
								toast({
									title: m.InvalidPrivateKey(),
									description: m.PleaseEnterValidPrivateKey(),
									type: "foreground",
									duration: 3000,
								});
								return;
							}
                                                        setRestoring(true);
                                                        localStorage.setItem(storageKeys.privateKey, validKey);
                                                        setRestoring(false);
                                                        setOpen(false);
                                                        setRestoreKey("");
                                                        toast({
                                                                title: m.PrivateKey(),
                                                                description: m.RestoreWithPrivateKeyDesc(),
                                                                type: "foreground",
                                                                duration: 3000,
                                                        });
                                                }}
                                        >
                                                {restoring ? m.Restoring() : m.Restore()}
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
});
