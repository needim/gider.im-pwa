import { Button } from "@/components/ui/button";

function ErrorFallback({
	error,
	resetErrorBoundary,
}: {
	error: Error;
	resetErrorBoundary: (...args: Array<unknown>) => void;
}) {
	return (
		<div className="rounded bg-red-50 p-4">
			<div className="flex">
				<div className="flex-shrink-0">
					<svg
						className="h-5 w-5 text-red-400"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
							clipRule="evenodd"
						/>
					</svg>
				</div>
				<div className="ml-3">
					<h3 className="text-sm font-medium text-red-800">
						Something went wrong:
					</h3>
					<div className="mt-2 text-sm text-red-700">
						<ul className="list-disc space-y-1 pl-4">
							<li>{error.message}</li>
						</ul>
						<Button
							size="sm"
							variant="default"
							className="mt-4"
							onClick={resetErrorBoundary}
						>
							Try again
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ErrorFallback;
