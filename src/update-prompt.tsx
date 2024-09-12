import { ToastAction, ToastClose } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

const PERIOD = 30 * 1000; // 30 seconds

function UpdatePrompt() {
	const {
		needRefresh: [needRefresh, setNeedRefresh],
		updateServiceWorker,
	} = useRegisterSW({
		onRegisteredSW: (_swURL, _registration) => {
			_registration &&
				setInterval(() => {
					console.info("Checking for app update...");
					_registration.update();
				}, PERIOD);
		},
		onRegisterError(error) {
			console.error(`SW registration failed: ${error}`);
		},
	});

	const { toast } = useToast();

	const close = () => setNeedRefresh(false);
	const update = () => updateServiceWorker(true);

	// biome-ignore lint/correctness/useExhaustiveDependencies: we don't need to add toast to the dependencies
	useEffect(() => {
		if (needRefresh) {
			toast({
				title: "New version 🎉",
				description: "Reload to update the app.",
				type: "background",
				duration: 10000,
				action: (
					<>
						<ToastAction
							altText="Reload"
							onClick={async () => {
								await update();
								close();
							}}
						>
							Reload
						</ToastAction>
						<ToastClose onClick={() => close()}>Dismiss</ToastClose>
					</>
				),
			});
		}
	}, [needRefresh]);

	return <></>;
}

export default UpdatePrompt;
