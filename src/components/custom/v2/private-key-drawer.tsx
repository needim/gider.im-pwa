import { Button } from "@/components/ui/button";

import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import HyperText from "@/components/ui/hyper-text";
import { useLocalization } from "@/hooks/use-localization";
import { useOwner } from "@evolu/react";
import { IconCircleKeyFilled, IconCopyCheckFilled, IconEyeFilled } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface PrivateKeyDrawerRef {
	openDrawer: () => void;
	closeDrawer: () => void;
}

export const PrivateKeyDrawer = forwardRef<PrivateKeyDrawerRef, {}>((_, ref) => {
	const [open, setOpen] = useState(false);
	const [reveal, setReveal] = useState(false);
	const [copy, setCopy] = useState(false);

	const { m } = useLocalization();

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text).then(() => {
			setCopy(true);
			setTimeout(() => {
				setCopy(false);
			}, 2000);
		});
	}

	useImperativeHandle(ref, () => ({
		openDrawer: () => {
			setOpen(true);
		},
		closeDrawer: () => {
			setOpen(false);
		},
	}));

	const owner = useOwner();

	return (
		<Drawer
			open={open}
			onOpenChange={(v) => {
				setOpen(v);
				setReveal(false);
			}}
		>
			<DrawerContent className="pb-6 max-w-md mx-auto">
				<DrawerHeader>
					<IconCircleKeyFilled className="w-12 h-12 mx-auto mb-2" />
					<DrawerTitle>{m.PrivateKey()}</DrawerTitle>
					<DrawerDescription className="text-balance">{m.PrivateKeyDescription()}</DrawerDescription>
				</DrawerHeader>
				<motion.div
					className="mx-4 border rounded bg-input border-input"
					initial={{ height: 0, scale: 0, opacity: 0 }}
					animate={reveal ? { height: "auto", scale: 1, opacity: 1 } : { height: 0, scale: 0, opacity: 0 }}
				>
					<div className="px-4 font-mono text-center">
						<HyperText animateOnLoad={reveal} text={owner?.mnemonic || ""} />
					</div>
				</motion.div>
				<DrawerFooter className="grid grid-cols-2">
					<Button
						variant="secondary"
						size="lg"
						onClick={() => {
							setReveal((prev) => !prev);
						}}
					>
						<IconEyeFilled className="mr-2" />
						{reveal ? m.Hide() : m.Reveal()}
					</Button>
					<Button
						variant="default"
						size="lg"
						onClick={() => {
							copyToClipboard(owner?.mnemonic || "");
						}}
					>
						<IconCopyCheckFilled className="mr-2" />
						{copy ? m.Copied() : m.Copy()}
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
});
