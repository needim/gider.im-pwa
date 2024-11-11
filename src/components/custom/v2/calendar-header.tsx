import { AmountDisplay } from "@/components/custom/amount-display";
import { Filters } from "@/components/custom/filters";
import { CalendarMonthSwitcher } from "@/components/custom/v2/calendar-month-switcher";
import { CalendarTabs } from "@/components/custom/v2/calendar-tabs";
import { CalendarVisionSelect } from "@/components/custom/v2/calendar-vision-select";
import { ConditionalView } from "@/components/custom/v2/conditional-view";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { useLocalization } from "@/hooks/use-localization";
import { useScreens } from "@/hooks/use-screens";
import { getEntries } from "@/lib/utils";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { AutoTextSize } from "auto-text-size";
import dayjs from "dayjs";

export function CalendarHeader() {
	const { activeScreen, calendarType, setCalendarType, calendarVision, CALCULATIONS, viewingIndex } = useScreens();

	const mode = calendarVision === "actual" ? "actual" : "foresight";
	const { lang, m, mainCurrency } = useLocalization();
	dayjs.locale(lang);

	if (activeScreen !== "calendar") {
		return <></>;
	}

	return (
		<div className="pt-5 standalone:pt-0">
			<CalendarMonthSwitcher />

			<div className="px-2 mx-auto w-full mt-1 flex flex-col justify-center">
				<div className="mt-1 flex w-full items-baseline">
					<Popover>
						<PopoverTrigger asChild>
							<div className="text-5xl py-3 font-semibold tracking-tight w-full flex justify-center">
								<AutoTextSize mode="oneline" minFontSizePx={32} maxFontSizePx={40} fontSizePrecisionPx={0.1}>
									<AmountDisplay
										amount={CALCULATIONS[viewingIndex].result.inMainCurrency[mode].total || 0}
										currencyCode={mainCurrency}
										type="short"
									/>
								</AutoTextSize>
							</div>
						</PopoverTrigger>
						<PopoverContent>
							<div className="absolute -top-[8px] left-1/2 -translate-x-[50%] h-[16px] w-[16px] rotate-45 border-t border-l border-muted-foreground/20 bg-background" />
							<div className="-mx-4 -my-2 -mb-4 text-sm">
								<div className="flex text-muted-foreground flex-col divide-y divide-zinc-100 dark:divide-zinc-900">
									<h1 className="pb-1 px-4 text-base text-foreground">
										<span className="text-green-700 dark:text-green-400 font-medium">{m.Income()}</span>
									</h1>
									<div className="py-1 flex px-4 items-start justify-between">
										<span>{m.ExpectedIncome()}</span>
										<div className="flex flex-col text-right">
											{Object.entries(CALCULATIONS[viewingIndex].grouped.income).map(([currencyCode, data]) => (
												<AmountDisplay
													key={`totalExpectedIncomeGroupedByCurrency-${currencyCode}`}
													amount={data.expected.toString() ?? "0.00"}
													type="short"
													currencyCode={currencyCode}
												/>
											))}
										</div>
									</div>
									<div className="py-1 flex px-4 items-start justify-between">
										<span>{m.Received()}</span>
										<div className="flex flex-col text-right">
											{Object.entries(CALCULATIONS[viewingIndex].grouped.income).map(([currencyCode, data]) => (
												<AmountDisplay
													key={`totalReceivedIncomeGroupedByCurrency-${currencyCode}`}
													amount={data.fullfilled.toString() ?? "0"}
													type="short"
													currencyCode={currencyCode}
												/>
											))}
										</div>
									</div>
									<div className="py-1 flex px-4 items-start justify-between">
										<span>{m.Remaining()}</span>
										<div className="flex flex-col text-right">
											{Object.entries(CALCULATIONS[viewingIndex].grouped.income).map(([currencyCode, data]) => (
												<AmountDisplay
													key={`totalRemainingIncomeGroupedByCurrency-${currencyCode}`}
													amount={data.remaining.toString() ?? "0"}
													type="short"
													currencyCode={currencyCode}
												/>
											))}
										</div>
									</div>

									<h1 className="pt-3 pb-1 px-4 text-base text-foreground">
										<span className="text-red-700 dark:text-red-400 font-medium">{m.Expense()}</span>
									</h1>
									<div className="py-1 flex px-4 items-start justify-between">
										<span>{m.ExpectedExpense()}</span>
										<div className="flex flex-col text-right">
											{Object.entries(CALCULATIONS[viewingIndex].grouped.expense).map(([currencyCode, data]) => (
												<AmountDisplay
													key={`totalExpectedExpenseGroupedByCurrency-${currencyCode}`}
													amount={data.expected.toString() ?? "0"}
													type="short"
													showAs="minus"
													currencyCode={currencyCode}
												/>
											))}
										</div>
									</div>
									<div className="py-1 flex px-4 items-start justify-between">
										<span>{m.Paid()}</span>
										<div className="flex flex-col text-right">
											{Object.entries(CALCULATIONS[viewingIndex].grouped.expense).map(([currencyCode, data]) => (
												<AmountDisplay
													key={`totalPaidExpenseGroupedByCurrency-${currencyCode}`}
													amount={data.fullfilled.toString() ?? "0"}
													type="short"
													showAs="minus"
													currencyCode={currencyCode}
												/>
											))}
										</div>
									</div>
									<div className="py-1 flex px-4 items-start justify-between">
										<span>{m.Remaining()}</span>
										<div className="flex flex-col text-right">
											{Object.entries(CALCULATIONS[viewingIndex].grouped.expense).map(([currencyCode, data]) => (
												<AmountDisplay
													key={`totalRemainingExpenseGroupedByCurrency-${currencyCode}`}
													amount={data.remaining.toString() ?? "0"}
													type="short"
													showAs="minus"
													currencyCode={currencyCode}
												/>
											))}
										</div>
									</div>

									<div className="grid grid-cols-2 divide-x divide-zinc-100 dark:divide-zinc-900">
										<div className="pb-2">
											<h1 className="pt-3 pb-1 px-4 text-base text-foreground text-center">
												<span className="font-medium">{m.Actual()}</span>
											</h1>
											<div className="py-1 flex px-4 items-start justify-between">
												<span />
												<div className="flex flex-col text-center text-base w-full">
													{getEntries(CALCULATIONS[viewingIndex].result.actual).map(([currencyCode, total]) => (
														<AmountDisplay
															key={`totalExpectedExpenseGroupedByCurrency-${currencyCode}`}
															amount={total.toString() ?? "0"}
															type="short"
															currencyCode={currencyCode}
														/>
													))}
												</div>
											</div>
										</div>
										<div className="pb-2">
											<h1 className="pt-3 pb-1 px-4 text-base text-foreground text-center">
												<span className="font-medium">{m.Foresight()}</span>
											</h1>
											<div className="py-1 flex px-4 items-start justify-between">
												<span />
												<div className="flex flex-col text-center text-base w-full">
													{getEntries(CALCULATIONS[viewingIndex].result.foresight).map(([currencyCode, total]) => (
														<AmountDisplay
															key={`totalExpectedExpenseGroupedByCurrency-${currencyCode}`}
															amount={total.toString() ?? "0"}
															type="short"
															currencyCode={currencyCode}
														/>
													))}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</PopoverContent>
					</Popover>
				</div>
			</div>
			<div className="mx-2 mt-2 flex justify-center">
				<CalendarVisionSelect />
			</div>
			<div className="px-2 flex items-center gap-2 mt-4">
				<CalendarTabs value={calendarType} onValueChange={(value) => setCalendarType(value)} />
				<ConditionalView condition={activeScreen === "calendar"}>
					<Filters />
				</ConditionalView>
			</div>
		</div>
	);
}
