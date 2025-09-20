import { z } from "zod";

export const NonEmptyString100 = z.string().trim().min(1).max(100);
export type TNonEmptyString100 = z.infer<typeof NonEmptyString100>;

export const CurrencyIsoString = z.string().trim().length(3);
export type TCurrencyIsoString = z.infer<typeof CurrencyIsoString>;

export const AmountString = z
        .string()
        .regex(/^\d+\.\d{8}$/);
export type TAmountString = z.infer<typeof AmountString>;

export type TEntryId = string;
export type TRecurringConfigId = string;
export type TExclusionId = string;
export type TGroupId = string;
export type TTagId = string;

const DateStringSchema = z.union([z.string(), z.date()]).transform((value) =>
        value instanceof Date ? value.toISOString() : new Date(value).toISOString(),
);

const GroupIdSchema = z.string().uuid();
const TagIdSchema = z.string().uuid();
const RecurringConfigIdSchema = z.string().uuid();

export const decodeName = (value: string) => NonEmptyString100.parse(value);
export const decodeCurrency = (value: string) => CurrencyIsoString.parse(value.toUpperCase());
export const decodeAmount = (value: string) => AmountString.parse(value);
export const decodeDate = (value: string | Date) => DateStringSchema.parse(value);
export const decodeGroupId = (value: string) => GroupIdSchema.parse(value);
export const decodeTagId = (value: string) => TagIdSchema.parse(value);
export const decodeRecurringConfigId = (value: string) => RecurringConfigIdSchema.parse(value);

