import { z } from "zod";

export const EntryCreateSchema = z
	.object({
		startDate: z.date(),
		type: z.enum(["income", "expense", "assets"]),
		mode: z.enum(["one-time", "infinite", "finite"]),
		recurrence: z.enum(["week", "month", "year"]).optional(), // depends on mode - required if mode is not one-time
		interval: z.number().optional(), // depends on recurrence - required if mode is finite
		every: z.number().optional(), // depends on recurrence - required if mode is not one-time

		/**
		 * examples:
		 * mode       - recurrence   - interval     - every      - name
		 * one-time   -              -              -            - coffee machine
		 * -------------------------------------------------------------------------------------------------------
		 * infinite   - month        -              -            - rent w/o end date (N payments) *
		 * infinite   - month        -              - 6 month    - rent w/o end date every 6 months (N payments) *
		 * -------------------------------------------------------------------------------------------------------
		 * finite     - month        - 12 month     - 1 month    - rent w/ end date (12 payments)
		 * finite     - month        - 12 month     - 6 month    - rent w/ end date every 6 months (2 payments)
		 * finite     - month        - 120 month    - 1 month    - mortgage w/ end date (120 payments)
		 * finite     - year         - 5 year       - 1 year     - insurance w/ end date (5 payments)
		 * finite     - year         - 8 year       - 4 year     - loan w/ end date every 4 years (2 payments)
		 */
		name: z.string().min(1),
		amount: z.string().min(1),
		currency: z.string().min(3).max(3),
		// ---
		group: z.string().optional(),
		tag: z.string().optional(),
	})
	.superRefine((values, ctx) => {
		if (values.mode === "one-time") {
			// we don't need recurrence
			if (values.recurrence) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["recurrence"],
					message: "Must be empty",
				});
			}

			// we don't need interval
			if (values.interval) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["interval"],
					message: "Must be empty",
				});
			}

			// we don't need every
			if (values.every) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["every"],
					message: "Must be empty",
				});
			}
		} else if (values.mode === "infinite") {
			// we need recurrence
			if (!values.recurrence) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["recurrence"],
					message: "Required",
				});
			}

			// we don't need interval
			if (values.interval) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["interval"],
					message: "Must be empty",
				});
			}

			// we need every
			if (values.every && values.every < 1) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["every"],
					message: "Min value is 1",
				});
			}
		} else if (values.mode === "finite") {
			// we need recurrence
			if (!values.recurrence) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["recurrence"],
					message: "Required",
				});
			}

			// we need interval
			if (!values.interval) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["interval"],
					message: "Required",
				});
			}

			// we need every
			if (values.every && values.every < 1) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["every"],
					message: "Min value is 1",
				});
			}
		}
	});
