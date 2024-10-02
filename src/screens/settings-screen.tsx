import { AmountDisplay } from "@/components/custom/amount-display";
import { GroupDrawer, type GroupDrawerRef } from "@/components/custom/group-drawer";
import {
	DecimalModeSelector,
	DecimalSelector,
	LanguageSelector,
	MainCurrencySelector,
} from "@/components/custom/settings";
import { TagDrawer, type TagDrawerRef } from "@/components/custom/tag-drawer";
import { ThemeToggle } from "@/components/custom/theme-toggle";
import { EraseDataDrawer, type EraseDataDrawerRef } from "@/components/custom/v2/erase-data-drawer";
import { PrivateKeyDrawer, type PrivateKeyDrawerRef } from "@/components/custom/v2/private-key-drawer";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/hooks/use-localization";
import { cn, storageKeys } from "@/lib/utils";
import {
	IconCashBanknoteFilled,
	IconCategoryFilled,
	IconChevronRight,
	IconCircleKeyFilled,
	IconContrastFilled,
	IconCurrencyCent,
	IconEyeFilled,
	IconHeartFilled,
	IconLanguageHiragana,
	IconNumber123,
	IconTagsFilled,
	IconTrashXFilled,
	type TablerIcon,
} from "@tabler/icons-react";
import type React from "react";
import { useRef } from "react";

function SettingsRow({
	title,
	Icon,
	iconBackground,
	children,
}: { title: string; Icon: TablerIcon; iconBackground: string; children: React.ReactNode }) {
	return (
		<div className="flex items-center justify-between min-h-9 text-sm">
			<h1 className="flex items-center text-base font-medium gap-2">
				<div className={cn("size-6 bg-zinc-400 rounded-xs flex items-center justify-center", iconBackground)}>
					<Icon className={cn("size-4 text-white")} />
				</div>
				{title}
			</h1>
			<div>{children}</div>
		</div>
	);
}
export function SettingsScreen() {
	const { mainCurrency, m, decimalMode } = useLocalization();
	const groupDrawerRef = useRef<GroupDrawerRef>(null);
	const tagDrawerRef = useRef<TagDrawerRef>(null);
	const eraseDataDrawerRef = useRef<EraseDataDrawerRef>(null);
	const privateKeyDrawerRef = useRef<PrivateKeyDrawerRef>(null);
	const sponsorsEnabled = false;
	return (
		<>
			<div className="flex-1 h-svh overflow-y-auto py-4 relative">
				<div className="px-4">
					<div className="text-3xl font-bold mb-4">Settings</div>

					<div className="flex flex-col gap-6 mb-4">
						<div>
							<h1 className="text-xs text-zinc-400 dark:text-zinc-600 uppercase font-bold mb-1">{m.General()}</h1>
							<div className="rounded px-2 -mx-2 text-sm flex flex-col gap-1">
								<SettingsRow Icon={IconContrastFilled} iconBackground="bg-sky-500" title={m.Theme()}>
									<ThemeToggle />
								</SettingsRow>
								<SettingsRow Icon={IconLanguageHiragana} iconBackground="bg-orange-500" title={m.Localization()}>
									<LanguageSelector />
								</SettingsRow>
							</div>
						</div>

						<div>
							<h1 className="text-xs text-zinc-400 dark:text-zinc-600 uppercase font-bold mb-1">{m.Currency()}</h1>
							<div className=" rounded px-2 -mx-2 text-sm flex flex-col gap-1">
								<SettingsRow Icon={IconCashBanknoteFilled} iconBackground="bg-green-500" title={m.MainCurrency()}>
									<MainCurrencySelector />
								</SettingsRow>
								<SettingsRow Icon={IconCurrencyCent} iconBackground="bg-teal-500" title={m.DecimalLength()}>
									<DecimalSelector />
								</SettingsRow>
								<SettingsRow Icon={IconNumber123} iconBackground="bg-cyan-600" title={m.NumberFormat()}>
									<DecimalModeSelector />
								</SettingsRow>
								<SettingsRow Icon={IconEyeFilled} iconBackground="bg-zinc-500" title={m.Preview()}>
									<AmountDisplay
										amount={"12345678"}
										currencyCode={mainCurrency}
										type="short"
										decimalMode={decimalMode}
										useVision={false}
									/>
								</SettingsRow>
							</div>
						</div>

						<div>
							<h1 className="text-xs text-zinc-400 dark:text-zinc-600 uppercase font-bold mb-1">{m.GroupsAndTags()}</h1>
							<div className="px-2 -mx-2 text-sm flex flex-col gap-1">
								<SettingsRow Icon={IconCategoryFilled} iconBackground="bg-fuchsia-500" title={m.Groups()}>
									<Button
										size="sm"
										variant="outline"
										className="rounded"
										onClick={() => {
											groupDrawerRef.current?.openDrawer();
										}}
									>
										{m.Manage()} <IconChevronRight className="size-4 ml-1  relative -mr-1" />
									</Button>
								</SettingsRow>
								<SettingsRow Icon={IconTagsFilled} iconBackground="bg-indigo-500" title={m.Tags()}>
									<Button
										size="sm"
										variant="outline"
										className="rounded"
										onClick={() => {
											tagDrawerRef.current?.openDrawer();
										}}
									>
										{m.Manage()} <IconChevronRight className="size-4 ml-1 relative -mr-1" />
									</Button>
								</SettingsRow>
							</div>
						</div>

						<div>
							<h1 className="text-xs text-zinc-400 dark:text-zinc-600 uppercase font-bold mb-1">Data</h1>
							<div className="px-2 -mx-2 text-sm flex flex-col gap-1">
								{/* <SettingsRow Icon={IconSquareArrowDownFilled} iconBackground="bg-lime-500" title="Import data">
									<Button
										size="sm"
										variant="outline"
										className="rounded"
										onClick={() => {
											// tagDrawerRef.current?.openDrawer();
										}}
									>
										Import <IconChevronRight className="size-4 ml-1  relative -mr-1" />
									</Button>
								</SettingsRow>
								<SettingsRow Icon={IconSquareArrowUpFilled} iconBackground="bg-pink-500" title="Export data">
									<Button
										size="sm"
										variant="outline"
										className="rounded"
										onClick={() => {
											// tagDrawerRef.current?.openDrawer();
										}}
									>
										Export <IconChevronRight className="size-4 ml-1  relative -mr-1" />
									</Button>
								</SettingsRow> */}
								<SettingsRow Icon={IconCircleKeyFilled} iconBackground="bg-pink-500" title={m.ViewPrivateKey()}>
									<Button
										size="sm"
										variant="outline"
										className="rounded"
										onClick={() => {
											privateKeyDrawerRef.current?.openDrawer();
										}}
									>
										{m.View()} <IconChevronRight className="size-4 ml-1  relative -mr-1" />
									</Button>
								</SettingsRow>
								<SettingsRow Icon={IconTrashXFilled} iconBackground="bg-red-500" title={m.EraseData()}>
									<Button
										size="sm"
										variant="outline"
										className="rounded"
										onClick={() => {
											eraseDataDrawerRef.current?.openDrawer();
										}}
									>
										{m.Erase()} <IconChevronRight className="size-4 ml-1  relative -mr-1" />
									</Button>
								</SettingsRow>
							</div>
						</div>
					</div>

					{sponsorsEnabled && (
						<>
							<div className="flex items-center -mx-4 justify-between px-6 bg-zinc-50 dark:bg-zinc-950">
								<h1 className="py-2 text-left font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
									<IconHeartFilled className="size-6 inline-block text-rose-600 dark:text-rose-400" />
									{m.SponsoredBy()}
								</h1>
								<a
									href="https://github.com/sponsors/needim"
									target="_blank"
									rel="noopener noreferrer"
									className="font-semibold text-sm"
								>
									{m.BecomeASponsor()}
								</a>
							</div>

							<div className="-mx-4 border-white dark:border-zinc-900/75 border-y-2">
								<div className="mx-auto">
									<div className="grid grid-cols-4 gap-0.5 overflow-hidden">
										<div className="bg-zinc-100/75 dark:bg-zinc-900/50 p-4 px-6 flex items-center col-span-2">
											<a
												href="https://birdefter.com?utm_source=giderim"
												target="_blank"
												rel="noopener noreferrer"
												className="w-full"
											>
												<svg
													width="3.78em"
													height="1.7em"
													viewBox="0 0 1665 440"
													fill="none"
													key="logo"
													className="max-h-12 w-full object-contain filter grayscale transition-all dark:invert duration-300"
													xmlns="http://www.w3.org/2000/svg"
												>
													<rect width={440} height={440} rx={96} fill="#1E293B" />
													<path
														d="M226 100c0-13.255 10.745-24 24-24h56c13.255 0 24 10.745 24 24v104H226V100z"
														fill="url(#prefix__paint0_linear_1_2)"
													/>
													<path
														fillRule="evenodd"
														clipRule="evenodd"
														d="M330 116v208c0 22.091-17.909 40-40 40H150c-22.091 0-40-17.909-40-40v-80c0-22.091 17.909-40 40-40h60c32.5 0 86.069-6.245 120-88z"
														fill="#fff"
													/>
													<path
														d="M631.726 98.175c28.77 0 54.009 5.598 75.718 16.792 21.969 11.194 38.839 27.205 50.609 48.031 12.031 20.566 18.046 44.517 18.046 71.852 0 27.334-6.015 51.285-18.046 71.851-11.77 20.306-28.64 36.056-50.609 47.25-21.709 11.195-46.948 16.792-75.718 16.792H536V98.176h95.726zm-1.962 226.099c28.77 0 51.002-7.81 66.695-23.43 15.692-15.62 23.539-37.618 23.539-65.994 0-28.377-7.847-50.505-23.539-66.385-15.693-16.141-37.925-24.211-66.695-24.211h-38.839v180.02h38.839zM1007.57 254.889c0 7.81-.52 14.839-1.57 21.087H847.113c1.308 15.62 6.801 27.855 16.478 36.707 9.677 8.851 21.577 13.277 35.701 13.277 20.4 0 34.916-8.722 43.547-26.164h59.241c-6.278 20.827-18.309 38.009-36.094 51.546-17.785 13.277-39.624 19.915-65.517 19.915-20.924 0-39.755-4.556-56.494-13.667-16.478-9.372-29.424-22.519-38.84-39.44-9.154-16.922-13.731-36.447-13.731-58.575 0-22.389 4.577-42.044 13.731-58.965 9.154-16.922 21.97-29.938 38.447-39.05 16.478-9.112 35.44-13.667 56.887-13.667 20.662 0 39.101 4.425 55.317 13.277 16.477 8.851 29.162 21.477 38.055 37.878 9.149 16.14 13.729 34.754 13.729 55.841zm-56.884-15.62c-.262-14.058-5.362-25.252-15.301-33.583-9.939-8.591-22.1-12.886-36.485-12.886-13.601 0-25.109 4.165-34.525 12.496-9.154 8.07-14.777 19.394-16.869 33.973h103.18zM1139.52 200.314h-38.05v171.429h-55.71V200.314h-24.72v-44.907h24.72v-10.934c0-26.554 7.58-46.079 22.75-58.575 15.17-12.495 38.06-18.353 68.66-17.572v46.079c-13.34-.26-22.63 1.952-27.86 6.638s-7.84 13.147-7.84 25.383v8.981h38.05v44.907zM1239.06 199.314v104.654c0 7.289 1.7 12.626 5.1 16.01 3.66 3.124 9.68 4.686 18.05 4.686h25.5v46.079h-34.52c-46.3 0-69.44-22.389-69.44-67.166V199.314h-25.9v-44.907h25.9v-53.498h55.31v53.498h48.65v44.907h-48.65zM1517.57 254.889c0 7.81-.52 14.839-1.57 21.087h-158.89c1.31 15.62 6.81 27.855 16.48 36.707 9.68 8.851 21.58 13.277 35.7 13.277 20.4 0 34.92-8.722 43.55-26.164h59.24c-6.28 20.827-18.31 38.009-36.09 51.546-17.79 13.277-39.63 19.915-65.52 19.915-20.92 0-39.75-4.556-56.49-13.667-16.48-9.372-29.43-22.519-38.84-39.44-9.16-16.922-13.73-36.447-13.73-58.575 0-22.389 4.57-42.044 13.73-58.965 9.15-16.922 21.97-29.938 38.44-39.05 16.48-9.112 35.44-13.667 56.89-13.667 20.66 0 39.1 4.425 55.32 13.277 16.47 8.851 29.16 21.477 38.05 37.878 9.16 16.14 13.73 34.754 13.73 55.841zm-56.88-15.62c-.26-14.058-5.36-25.252-15.3-33.583-9.94-8.591-22.1-12.886-36.49-12.886-13.6 0-25.11 4.165-34.52 12.496-9.16 8.07-14.78 19.394-16.87 33.973h103.18zM1598.31 187.99c7.06-11.455 16.21-20.436 27.46-26.944 11.51-6.509 24.58-9.763 39.23-9.763v57.403h-14.52c-17.26 0-30.34 4.035-39.23 12.106-8.63 8.07-12.94 22.128-12.94 42.173v107.778h-54.93V154.407h54.93v33.583z"
														fill="#1E293B"
													/>
													<defs>
														<linearGradient
															id="prefix__paint0_linear_1_2"
															x1={127}
															y1={1}
															x2={359}
															y2={233}
															gradientUnits="userSpaceOnUse"
														>
															<stop stopColor="#fff" stopOpacity={0.8} />
															<stop offset={0} stopColor="#fff" />
															<stop offset={0.867} stopColor="#fff" stopOpacity={0} />
														</linearGradient>
													</defs>
												</svg>
											</a>
										</div>

										<div className="bg-zinc-100/75 dark:bg-zinc-900/50 p-4 px-6 flex items-center col-span-2">
											<a
												href="https://github.com/sponsors/needim"
												target="_blank"
												rel="noopener noreferrer"
												className="w-full"
											>
												<img
													className="max-h-12 w-full object-contain filter grayscale transition-all dark:invert duration-300 ease-in-out"
													src="Platinum.svg"
													alt="Reform"
													width={158}
													height={48}
												/>
											</a>
										</div>

										<div className="bg-zinc-100/75 dark:bg-zinc-900/50 p-4 px-6 flex items-center col-span-2">
											<a
												href="https://github.com/sponsors/needim"
												target="_blank"
												rel="noopener noreferrer"
												className="w-full"
											>
												<img
													className="max-h-12 w-full object-contain filter grayscale transition-all dark:invert duration-300 ease-in-out"
													src="Gold.svg"
													alt="Reform"
													width={158}
													height={48}
												/>
											</a>
										</div>
										<div className="bg-zinc-100/75 dark:bg-zinc-900/50 p-4 px-6 flex items-center col-span-2">
											<a
												href="https://github.com/sponsors/needim"
												target="_blank"
												rel="noopener noreferrer"
												className="w-full"
											>
												<img
													className="max-h-12 w-full object-contain filter grayscale transition-all dark:invert duration-300 ease-in-out"
													src="Gold.svg"
													alt="Tuple"
													width={158}
													height={48}
												/>
											</a>
										</div>
										<div className="bg-zinc-100/75 dark:bg-zinc-900/50 p-6 flex items-center col-span-1">
											<a
												href="https://github.com/sponsors/needim"
												target="_blank"
												rel="noopener noreferrer"
												className="w-full"
											>
												<img
													className="max-h-12 w-full object-contain filter grayscale transition-all dark:invert duration-300 ease-in-out"
													src="Silver.svg"
													alt="Laravel"
													width={158}
													height={48}
												/>
											</a>
										</div>
										<div className="bg-zinc-100/75 dark:bg-zinc-900/50 p-6 flex items-center col-span-1">
											<a
												href="https://github.com/sponsors/needim"
												target="_blank"
												rel="noopener noreferrer"
												className="w-full"
											>
												<img
													className="max-h-12 w-full object-contain filter grayscale transition-all dark:invert duration-300 ease-in-out"
													src="Silver.svg"
													alt="SavvyCal"
													width={158}
													height={48}
												/>
											</a>
										</div>
										<div className="bg-zinc-100/75 dark:bg-zinc-900/50 p-6 flex items-center col-span-1">
											<a
												href="https://github.com/sponsors/needim"
												target="_blank"
												rel="noopener noreferrer"
												className="w-full"
											>
												<img
													className="max-h-12 w-full object-contain filter grayscale transition-all dark:invert duration-300 ease-in-out"
													src="Silver.svg"
													alt="SavvyCal"
													width={158}
													height={48}
												/>
											</a>
										</div>
										<div className="bg-zinc-100/75 dark:bg-zinc-900/50 p-6 flex items-center col-span-1">
											<a
												href="https://github.com/sponsors/needim"
												target="_blank"
												rel="noopener noreferrer"
												className="w-full"
											>
												<img
													className="max-h-12 w-full object-contain filter grayscale transition-all dark:invert duration-300 ease-in-out"
													src="Silver.svg"
													alt="SavvyCal"
													width={158}
													height={48}
												/>
											</a>
										</div>
									</div>
								</div>
							</div>
						</>
					)}

					<div className="text-muted-foreground text-xs mt-8 flex items-center gap-2 justify-center">
						<span>gider.im v{__APP_VERSION__}</span>
						<span>•</span>
						<p>
							Made by{" "}
							<a
								href="https://x.com/needim"
								target="_blank"
								rel="noopener noreferrer"
								className="underline text-foreground"
							>
								Nedim
							</a>
						</p>
					</div>
					<div className="text-muted-foreground text-xs mt-1 flex items-center gap-2 justify-center">
						<button
							onClick={() => {
								localStorage.removeItem(storageKeys.onboarding);
								localStorage.removeItem(storageKeys.firstShowAnimation);
								localStorage.removeItem(storageKeys.activeScreen);
								window.location.reload();
							}}
							className="underline"
						>
							{m.RestartOnboarding()}
						</button>
						<span>•</span>
						<button
							onClick={() => {
								window.location.reload();
							}}
							className="underline"
						>
							Reload
						</button>
					</div>
				</div>
			</div>
			<GroupDrawer ref={groupDrawerRef} />
			<TagDrawer ref={tagDrawerRef} />
			<EraseDataDrawer ref={eraseDataDrawerRef} />
			<PrivateKeyDrawer ref={privateKeyDrawerRef} />
		</>
	);
}
