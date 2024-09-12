import { Button } from "@/components/ui/button";
import {
	IconChevronLeft,
	IconChevronRight,
	IconInfinity,
} from "@tabler/icons-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

type IncrementorProps = {
	min: number;
	max: number;
	defaultValue: number;
	onChange: (value: number) => void;
	zeroInfinitive?: boolean;
};

export function Incrementor({
	defaultValue,
	min,
	max,
	onChange,
	zeroInfinitive = true,
}: IncrementorProps): React.ReactElement {
	const [value, setValue] = useState(defaultValue);

	const incrementIntervalId = useRef<ReturnType<typeof setInterval> | null>(
		null,
	);
	const decrementIntervalId = useRef<ReturnType<typeof setInterval> | null>(
		null,
	);

	const startIncrement = () => {
		if (incrementIntervalId.current) return;
		incrementIntervalId.current = setInterval(() => {
			if (value < max) {
				setValue((prev) => {
					if (prev === max) return prev;
					return prev + 1;
				});
			}
		}, 100);
	};

	const stopIncrement = () => {
		if (incrementIntervalId.current) {
			clearInterval(incrementIntervalId.current);
			incrementIntervalId.current = null;
		}
		onChange(value);
	};

	const startDecrement = () => {
		if (decrementIntervalId.current) return;
		decrementIntervalId.current = setInterval(() => {
			if (value > min) {
				setValue((prev) => {
					if (prev === min) return prev;
					return prev - 1;
				});
			}
		}, 100);
	};

	const stopDecrement = () => {
		if (decrementIntervalId.current) {
			clearInterval(decrementIntervalId.current);
			decrementIntervalId.current = null;
		}
		onChange(value);
	};

	useEffect(() => {
		return () => {
			if (incrementIntervalId.current) {
				clearInterval(incrementIntervalId.current);
			}
			if (decrementIntervalId.current) {
				clearInterval(decrementIntervalId.current);
			}
		};
	}, []);

	return (
		<div className="inline-flex text-center items-center">
			<Button
				size="iconMd"
				variant="outline"
				className="dark:bg-zinc-950 rounded"
				onClick={() => {
					if (value > min) {
						setValue(value - 1);
						onChange(value - 1);
					}
				}}
				disabled={value === min}
				onMouseDown={startDecrement}
				onMouseUp={stopDecrement}
				onMouseLeave={stopDecrement}
				onTouchStart={startDecrement}
				onTouchEnd={stopDecrement}
				onTouchCancel={stopDecrement}
			>
				<IconChevronLeft className="size-4" />
			</Button>
			<span className="tabular-nums font-mono font-semibold inline-flex items-center px-1">
				<span className="w-8">
					{zeroInfinitive && value === 0 ? (
						<IconInfinity className="size-4 mx-auto" />
					) : (
						value
					)}
				</span>
			</span>
			<Button
				size="iconMd"
				variant="outline"
				className="dark:bg-zinc-950 rounded"
				onClick={() => {
					if (value < max) {
						setValue(value + 1);
						onChange(value + 1);
					}
				}}
				disabled={value === max}
				onMouseDown={startIncrement}
				onMouseUp={stopIncrement}
				onMouseLeave={stopIncrement}
				onTouchStart={startIncrement}
				onTouchEnd={stopIncrement}
				onTouchCancel={stopIncrement}
			>
				<IconChevronRight className="size-4" />
			</Button>
		</div>
	);
}
