import { AmountDisplay } from "@/components/custom/amount-display";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useLocalization } from "@/hooks/use-localization";
import { useScreens } from "@/hooks/use-screens";
import dayjs from "dayjs";
import { Area, AreaChart, XAxis } from "recharts";

export function MonthlyIncomeExpenseOverviewArea() {
	const { CALCULATIONS, calendarVision } = useScreens();
	const { mainCurrency, m } = useLocalization();

	const chartData: {
		month: string;
		income: number;
		expense: number;
		net: number;
	}[] = [];

	const mode = calendarVision === "actual" ? "actual" : "foresight";

	Object.values(CALCULATIONS).forEach((calculation) => {
		if (
			calculation.month.isBefore(dayjs().startOf("month")) &&
			calculation.income.length === 0 &&
			calculation.expense.length === 0
		) {
			// skip previous months with no data
			return;
		}
		chartData.push({
			month: calculation.month.format("MMM, YYYY"),
			income: calculation.result.inMainCurrency[mode].income,
			expense: Math.abs(calculation.result.inMainCurrency[mode].expense),
			net: calculation.result.inMainCurrency[mode].total,
		});
	});

	const chartConfig = {
		income: {
			label: m.Income(),
			color: "hsl(var(--chart-income))",
		},
		expense: {
			label: m.Expense(),
			color: "hsl(var(--chart-expense))",
		},
		net: {
			label: "Net",
			color: "hsl(var(--chart-net))",
		},
	} satisfies ChartConfig;

	return (
		<div>
			<div className="flex items-center justify-between px-4">
				<p className="text-md font-semibold text-center">Monthly overview</p>
				<p className="text-muted-foreground text-xs text-center">
					{chartData[0].month} - {chartData[chartData.length - 1]?.month}
				</p>
			</div>
			<ChartContainer config={chartConfig} className="min-h-[160px] w-full aspect-auto h-16 px-2 mt-2">
				<AreaChart
					accessibilityLayer
					data={chartData}
					stackOffset="expand"
					syncId="monthly-income-expense-overview"
					margin={{
						top: 4,
						left: 10,
						right: 10,
					}}
				>
					{/* <CartesianGrid vertical={false} /> */}
					<XAxis
						dataKey="month"
						tickLine={false}
						tickMargin={10}
						axisLine={false}
						interval={0}
						className="text-[11px]"
						visibility="hidden"
						tickFormatter={(value) => value.slice(0, 3)}
					/>
					<ChartTooltip
						cursor={false}
						itemSorter={(item) => {
							if (item.dataKey === "income") {
								return -1;
							}
							return 1;
						}}
						content={
							<ChartTooltipContent
								indicator="line"
								valueFormatter={(v: string) => <AmountDisplay amount={v} currencyCode={mainCurrency} type="short" />}
							/>
						}
					/>

					<defs>
						<linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.8} />
							<stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.1} />
						</linearGradient>
						<linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.8} />
							<stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0.1} />
						</linearGradient>
						<linearGradient id="fillNet" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="var(--color-net)" stopOpacity={0.8} />
							<stop offset="95%" stopColor="var(--color-net)" stopOpacity={0.1} />
						</linearGradient>
					</defs>

					<Area
						dataKey="expense"
						type="monotone"
						fill="url(#fillExpense)"
						fillOpacity={0.4}
						stroke="var(--color-expense)"
					/>
					{/* <Area
						dataKey="net"
						type="natural"
						fill="url(#fillNet)"
						fillOpacity={0.4}
						stroke="var(--color-net)"
					/> */}
					<Area
						dataKey="income"
						type="monotone"
						fill="url(#fillIncome)"
						fillOpacity={0.4}
						stroke="var(--color-income)"
					/>
				</AreaChart>
			</ChartContainer>
		</div>
	);
}
