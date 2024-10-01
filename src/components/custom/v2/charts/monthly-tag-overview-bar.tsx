import { AmountDisplay } from "@/components/custom/amount-display";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useLocalization } from "@/hooks/use-localization";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

export function MonthlyTagOverviewBar() {
	// const {  calendarVision } = useScreens();
	const { mainCurrency } = useLocalization();

	// const chartData: {
	// 	month: string;
	// 	income: number;
	// 	expense: number;
	// 	total: number;
	// }[] = [];

	// const mode = calendarVision === "actual" ? "actual" : "foresight";

	// Object.values(CALCULATIONS).forEach((calculation) => {
	// 	if (
	// 		calculation.month.isBefore(dayjs().startOf("month")) &&
	// 		calculation.income.length === 0 &&
	// 		calculation.expense.length === 0
	// 	) {
	// 		// skip previous months with no data
	// 		return;
	// 	}
	// 	chartData.push({
	// 		month: calculation.month.format("MMM, YYYY"),
	// 		income: calculation.result.inMainCurrency[mode].income,
	// 		expense: Math.abs(calculation.result.inMainCurrency[mode].expense),
	// 		total: calculation.result.inMainCurrency[mode].total,
	// 	});
	// });

	const chartData = [
		{ tag: "Salary", total: 275, fill: "var(--color-Salary)" },
		{ tag: "safari", total: 200, fill: "var(--color-safari)" },
		{ tag: "firefox", total: 187, fill: "var(--color-firefox)" },
		{ tag: "edge", total: 173, fill: "var(--color-edge)" },
		{ tag: "other", total: 90, fill: "var(--color-other)" },
	];

	const chartConfig = {
		total: {
			label: "Total",
		},
		Salary: {
			label: "Salary",
			color: "hsl(var(--chart-income))",
		},
		safari: {
			label: "Safari",
			color: "hsl(var(--chart-expense))",
		},
		firefox: {
			label: "Firefox",
			color: "hsl(var(--chart-3))",
		},
		edge: {
			label: "Edge",
			color: "hsl(var(--chart-4))",
		},
		other: {
			label: "Other",
			color: "hsl(var(--chart-5))",
		},
	} satisfies ChartConfig;

	return (
		<div>
			<div className="flex items-center justify-between px-4">
				<p className="text-md font-semibold text-center">By Tag</p>
				<p className="text-muted-foreground text-xs text-center">Current month</p>
			</div>
			<ChartContainer config={chartConfig} className="min-h-[160px] w-full aspect-auto h-16 px-2 mt-2">
				<BarChart
					accessibilityLayer
					data={chartData}
					layout="vertical"
					margin={{
						left: 10,
					}}
				>
					<YAxis
						dataKey="tag"
						type="category"
						tickLine={false}
						tickMargin={10}
						axisLine={false}
						tickFormatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label}
					/>
					<XAxis dataKey="total" type="number" hide />
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
								indicator="dot"
								valueFormatter={(v: string) => <AmountDisplay amount={v} currencyCode={mainCurrency} type="short" />}
							/>
						}
					/>
					<Bar dataKey="total" layout="vertical" radius={5} />
				</BarChart>
			</ChartContainer>
		</div>
	);
}
