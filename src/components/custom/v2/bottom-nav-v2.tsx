import {
	EntryDrawer,
	type EntryDrawerRef,
} from "@/components/custom/v2/entry-drawer";
import { buttonVariants } from "@/components/ui/button.variants";
import { useScreens } from "@/hooks/use-screens";
import { cn } from "@/lib/utils";
import type { TScreenId } from "@/types";
import {
	IconHexagonPlusFilled,
	IconSettings,
	IconSettingsFilled,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useRef } from "react";

export function BottomNavV2() {
	const { activeScreen, setScreen, calendarIndex, calendarType } = useScreens();

	const nav = [
		{
			title: "Calendar",
			key: "calendar",
			presentation: "screen",
			icon: (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="size-7 mb-6"
				>
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M16 1C16.5523 1 17 1.44772 17 2V3.00163C17.4755 3.00489 17.891 3.01472 18.2518 3.04419C18.8139 3.09012 19.3306 3.18868 19.816 3.43597C20.5686 3.81947 21.1805 4.43139 21.564 5.18404C21.8113 5.66937 21.9099 6.18608 21.9558 6.74817C22 7.28936 22 7.95372 22 8.75868V17.2413C22 18.0463 22 18.7106 21.9558 19.2518C21.9099 19.8139 21.8113 20.3306 21.564 20.816C21.1805 21.5686 20.5686 22.1805 19.816 22.564C19.3306 22.8113 18.8139 22.9099 18.2518 22.9558C17.7106 23 17.0463 23 16.2413 23H7.75868C6.95372 23 6.28937 23 5.74818 22.9558C5.18608 22.9099 4.66937 22.8113 4.18404 22.564C3.43139 22.1805 2.81947 21.5686 2.43598 20.816C2.18868 20.3306 2.09012 19.8139 2.04419 19.2518C1.99998 18.7106 1.99999 18.0463 2 17.2413V8.7587C1.99999 7.95374 1.99998 7.28937 2.04419 6.74817C2.09012 6.18608 2.18868 5.66937 2.43598 5.18404C2.81947 4.43139 3.43139 3.81947 4.18404 3.43597C4.66937 3.18868 5.18608 3.09012 5.74818 3.04419C6.10898 3.01472 6.52454 3.00489 7 3.00163V2C7 1.44772 7.44772 1 8 1C8.55229 1 9 1.44772 9 2V3H15V2C15 1.44772 15.4477 1 16 1ZM7 5.00176V6C7 6.55228 7.44772 7 8 7C8.55229 7 9 6.55228 9 6V5H15V6C15 6.55228 15.4477 7 16 7C16.5523 7 17 6.55228 17 6V5.00176C17.4455 5.00489 17.7954 5.01357 18.089 5.03755C18.5274 5.07337 18.7516 5.1383 18.908 5.21799C19.2843 5.40973 19.5903 5.7157 19.782 6.09202C19.8617 6.24842 19.9266 6.47262 19.9624 6.91104C19.9992 7.36113 20 7.94342 20 8.8V9H4V8.8C4 7.94342 4.00078 7.36113 4.03755 6.91104C4.07337 6.47262 4.1383 6.24842 4.21799 6.09202C4.40973 5.7157 4.7157 5.40973 5.09202 5.21799C5.24842 5.1383 5.47262 5.07337 5.91104 5.03755C6.20463 5.01357 6.55447 5.00489 7 5.00176Z"
						fill="currentColor"
					/>
				</svg>
			),
			passiveIcon: (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="size-7 mb-6"
				>
					<path
						d="M21 10H3M16 2V6M8 2V6M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			),
		},
		{
			title: "Graphs",
			key: "graphs",
			presentation: "screen",
			icon: (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="size-7 mb-6"
				>
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M1 3C1 2.44772 1.44772 2 2 2H22C22.5523 2 23 2.44772 23 3C23 3.55228 22.5523 4 22 4V11.2413C22 12.0463 22 12.7106 21.9558 13.2518C21.9099 13.8139 21.8113 14.3306 21.564 14.816C21.1805 15.5686 20.5686 16.1805 19.816 16.564C19.3306 16.8113 18.8139 16.9099 18.2518 16.9558C17.7106 17 17.0463 17 16.2413 17H14.7621L18.6402 20.2318C19.0645 20.5853 19.1218 21.2159 18.7682 21.6402C18.4147 22.0645 17.7841 22.1218 17.3598 21.7682L13 18.135V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V18.1351L6.64021 21.7682C6.21593 22.1218 5.58537 22.0645 5.2318 21.6402C4.87824 21.2159 4.93556 20.5853 5.35984 20.2318L9.23798 17H7.75873C6.95374 17 6.28938 17 5.74818 16.9558C5.18608 16.9099 4.66937 16.8113 4.18404 16.564C3.43139 16.1805 2.81947 15.5686 2.43598 14.816C2.18868 14.3306 2.09012 13.8139 2.04419 13.2518C1.99998 12.7106 1.99999 12.0463 2 11.2413L2 4C1.44772 4 1 3.55228 1 3ZM12 6C12.5523 6 13 6.44772 13 7V12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12V7C11 6.44772 11.4477 6 12 6ZM8 8C8.55228 8 9 8.44772 9 9V12C9 12.5523 8.55228 13 8 13C7.44772 13 7 12.5523 7 12V9C7 8.44772 7.44772 8 8 8ZM17 11C17 10.4477 16.5523 10 16 10C15.4477 10 15 10.4477 15 11V12C15 12.5523 15.4477 13 16 13C16.5523 13 17 12.5523 17 12V11Z"
						fill="currentColor"
					/>
				</svg>
			),
			passiveIcon: (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="size-7 mb-6"
				>
					<path
						d="M12 16V21M12 16L18 21M12 16L6 21M21 3V11.2C21 12.8802 21 13.7202 20.673 14.362C20.3854 14.9265 19.9265 15.3854 19.362 15.673C18.7202 16 17.8802 16 16.2 16H7.8C6.11984 16 5.27976 16 4.63803 15.673C4.07354 15.3854 3.6146 14.9265 3.32698 14.362C3 13.7202 3 12.8802 3 11.2V3M8 9V12M12 7V12M16 11V12M22 3H2"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			),
		},
		{
			title: "Add entry",
			key: "add-entry",
			presentation: "drawer",
			icon: <></>, // never goes to active state, so no need for icon
			passiveIcon: (
				<div
					className={cn(
						buttonVariants({ size: "iconLarge" }),
						"relative -top-3 rounded-2xl size-11",
					)}
				>
					<IconHexagonPlusFilled className="size-7" />
				</div>
			),
		},
		{
			title: "Assets",
			key: "assets",
			presentation: "screen",
			icon: (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="size-7 mb-6"
				>
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M5 4C4.44772 4 4 4.44772 4 5C4 5.55228 4.44772 6 5 6L19 6C20.6569 6 22 7.34315 22 9V19C22 20.6569 20.6569 22 19 22H5C3.34315 22 2 20.6569 2 19V5C2 3.34315 3.34315 2 5 2H17C17.5523 2 18 2.44772 18 3C18 3.55228 17.5523 4 17 4H5ZM16.5 12.5C15.6716 12.5 15 13.1716 15 14C15 14.8284 15.6716 15.5 16.5 15.5C17.3284 15.5 18 14.8284 18 14C18 13.1716 17.3284 12.5 16.5 12.5Z"
						fill="currentColor"
					/>
				</svg>
			),
			passiveIcon: (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="size-7 mb-6"
				>
					<path
						d="M16.5 14H16.51M3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V9C21 7.89543 20.1046 7 19 7L5 7C3.89543 7 3 6.10457 3 5ZM3 5C3 3.89543 3.89543 3 5 3H17M17 14C17 14.2761 16.7761 14.5 16.5 14.5C16.2239 14.5 16 14.2761 16 14C16 13.7239 16.2239 13.5 16.5 13.5C16.7761 13.5 17 13.7239 17 14Z"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			),
		},
		{
			title: "Settings",
			key: "settings",
			presentation: "screen",
			icon: <IconSettingsFilled className="size-7 mb-6" />,
			passiveIcon: <IconSettings className="size-7 mb-6" />,
		},
	] satisfies Array<{
		title: string;
		key: TScreenId;
		presentation: "screen" | "drawer";
		icon: JSX.Element;
		passiveIcon: JSX.Element;
	}>;

	const addTransactionRef = useRef<EntryDrawerRef>(null);

	return (
		<>
			<div className="flex flex-col gap-4">
				<div className="z-40 w-full h-16 standalone:h-20 bg-white border-t border-zinc-200 dark:bg-zinc-900/30 dark:border-zinc-900">
					<div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
						{nav.map((item) => (
							<button
								key={item.key}
								type="button"
								className={cn(
									"inline-flex flex-col items-center justify-center px-5 hover:bg-zinc-50 dark:hover:bg-zinc-800 group pb-2 text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-500 standalone:mt-1 pt-4",
									activeScreen === item.key &&
										"text-zinc-900 dark:text-zinc-300",
								)}
								onClick={() => {
									if (item.presentation === "screen") {
										setScreen(item.key);
									} else {
										addTransactionRef.current?.openDrawer(
											dayjs().isSame(calendarIndex, "month")
												? dayjs()
												: dayjs(calendarIndex),
											calendarType,
										);
									}
								}}
							>
								{activeScreen === item.key ? item.icon : item.passiveIcon}
							</button>
						))}
					</div>
				</div>
			</div>
			<EntryDrawer ref={addTransactionRef} />
		</>
	);
}
