import ErrorFallback from "@/components/custom/error-fallback";
import type React from "react";
import type { ReactNode } from "react";
import { ErrorBoundary as MainErrorBoundary } from "react-error-boundary";

export function ErrorBoundary({
	children,
}: {
	children: ReactNode;
}): React.ReactElement {
	return (
		<MainErrorBoundary FallbackComponent={ErrorFallback}>
			{children}
		</MainErrorBoundary>
	);
}
