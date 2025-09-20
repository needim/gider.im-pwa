import { useCallback, useEffect, useState } from "react";

import {
        DataContext,
        type CreateEntryInput,
        type CreateRecurringConfigInput,
        type DataContextValue,
        type EditEntryInput,
        type MutationOptions,
        type TagInput,
} from "@/contexts/data";
import { supabaseRequest } from "@/lib/supabase-client";
import type {
        TEntryRow,
        TExclusionRow,
        TGroupRow,
        TPopulatedEntry,
        TRecurringConfigRow,
        TTagRow,
} from "@/evolu-queries";

import type { ReactNode } from "react";

const TABLES = {
        entry: "entry",
        entryGroup: "entry_group",
        entryTag: "entry_tag",
        recurringConfig: "recurring_config",
        exclusion: "exclusion",
} as const;

type RawGroupRow = {
        id: string;
        name: string | null;
        icon: string | null;
        is_deleted: boolean | null;
};

type RawTagRow = {
        id: string;
        name: string | null;
        color: string | null;
        suggest_id: string | null;
        is_deleted: boolean | null;
};

type RawEntryRow = {
        id: string;
        name: string | null;
        type: string | null;
        currency_code: string | null;
        amount: string | null;
        date: string | null;
        created_at: string;
        updated_at: string | null;
        fullfilled: boolean | null;
        recurring_id: string | null;
        group_id: string | null;
        tag_id: string | null;
        is_deleted: boolean | null;
};

type RawRecurringConfigRow = {
        id: string;
        frequency: string | null;
        interval: number | null;
        every: number | null;
        start_date: string | null;
        end_date: string | null;
        created_at: string;
        is_deleted: boolean | null;
};

type RawExclusionRow = {
        id: string;
        recurring_id: string;
        modified_entry_id: string | null;
        date: string;
        reason: string;
        created_at: string;
        is_deleted: boolean | null;
};

const sanitizePayload = (payload: Record<string, unknown>) =>
        JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;

const shouldRefresh = (options?: MutationOptions) => options?.skipRefresh !== true;

const mapGroupRow = (row: RawGroupRow): TGroupRow | null => {
        if (!row.name || row.is_deleted) return null;
        return {
                id: row.id,
                name: row.name,
                icon: row.icon,
        };
};

const mapTagRow = (row: RawTagRow): TTagRow | null => {
        if (!row.name || row.is_deleted) return null;
        return {
                id: row.id,
                name: row.name,
                color: row.color,
                suggestId: row.suggest_id,
        };
};

const mapEntryRow = (
        row: RawEntryRow,
        groupsMap: Map<string, TGroupRow>,
        tagsMap: Map<string, TTagRow>,
): TEntryRow | null => {
        if (!row.name || !row.type || !row.amount || !row.currency_code || !row.date || row.is_deleted) {
                return null;
        }

        const group = row.group_id ? groupsMap.get(row.group_id) : null;
        const tag = row.tag_id ? tagsMap.get(row.tag_id) : null;

        return {
                entryId: row.id,
                name: row.name,
                type: row.type as TEntryRow["type"],
                currencyCode: row.currency_code,
                amount: row.amount,
                date: row.date,
                createdAt: row.created_at,
                fullfilled: !!row.fullfilled,
                recurringId: row.recurring_id,
                updatedAt: row.updated_at,
                groupId: row.group_id,
                tagId: row.tag_id,
                entryGroup: group ? { groupId: group.id, name: group.name } : null,
                entryTag: tag ? { tagId: tag.id, name: tag.name, color: tag.color } : null,
        };
};

const mapExclusionRow = (
        row: RawExclusionRow,
        entriesById: Map<string, TEntryRow>,
): TExclusionRow | null => {
        if (row.is_deleted) return null;
        const reason = row.reason === "modification" ? "modification" : "deletion";
        return {
                exclusionId: row.id,
                recurringId: row.recurring_id,
                modifiedEntryId: row.modified_entry_id,
                date: row.date,
                reason,
                createdAt: row.created_at,
                modifiedEntry: row.modified_entry_id ? entriesById.get(row.modified_entry_id) ?? null : null,
        };
};

const fetchGroups = async (): Promise<TGroupRow[]> => {
        const { data, error } = await supabaseRequest<RawGroupRow[]>(`${TABLES.entryGroup}?select=*&order=created_at.asc`);
        if (error) {
                console.error("Failed to fetch groups", error);
                return [];
        }

        return (data ?? []).map(mapGroupRow).filter((group): group is TGroupRow => !!group);
};

const fetchTags = async (): Promise<TTagRow[]> => {
        const { data, error } = await supabaseRequest<RawTagRow[]>(`${TABLES.entryTag}?select=*&order=created_at.asc`);
        if (error) {
                console.error("Failed to fetch tags", error);
                return [];
        }

        return (data ?? []).map(mapTagRow).filter((tag): tag is TTagRow => !!tag);
};

const fetchEntries = async (
        groupsMap: Map<string, TGroupRow>,
        tagsMap: Map<string, TTagRow>,
): Promise<TEntryRow[]> => {
        const { data, error } = await supabaseRequest<RawEntryRow[]>(
                `${TABLES.entry}?select=*&recurring_id=is.null&order=date.asc`,
        );

        if (error) {
                console.error("Failed to fetch entries", error);
                return [];
        }

        return (data ?? [])
                .map((row) => mapEntryRow(row as RawEntryRow, groupsMap, tagsMap))
                .filter((entry): entry is TEntryRow => !!entry);
};

const fetchRecurringConfigs = async (
        groupsMap: Map<string, TGroupRow>,
        tagsMap: Map<string, TTagRow>,
): Promise<TRecurringConfigRow[]> => {
        const { data, error } = await supabaseRequest<RawRecurringConfigRow[]>(
                `${TABLES.recurringConfig}?select=*&order=created_at.asc`,
        );

        if (error) {
                console.error("Failed to fetch recurring configs", error);
                return [];
        }

        const configs = (data ?? []).filter((row: RawRecurringConfigRow) => !row.is_deleted);
        if (configs.length === 0) return [];

        const configIds = configs.map((row) => row.id);

        const inQuery = configIds.map((id) => `"${id}"`).join(",");
        const { data: recurringEntriesData, error: recurringEntriesError } = await supabaseRequest<RawEntryRow[]>(
                `${TABLES.entry}?select=*&recurring_id=in.(${inQuery})`,
        );

        if (recurringEntriesError) {
                console.error("Failed to fetch recurring entries", recurringEntriesError);
                return [];
        }

        const recurringEntries = (recurringEntriesData ?? [])
                .map((row) => mapEntryRow(row as RawEntryRow, groupsMap, tagsMap))
                .filter((entry): entry is TEntryRow => !!entry);

        const entriesById = new Map<string, TEntryRow>();
        recurringEntries.forEach((entry) => {
                entriesById.set(entry.entryId, entry);
        });

        const { data: exclusionsData, error: exclusionsError } = await supabaseRequest<RawExclusionRow[]>(
                `${TABLES.exclusion}?select=*&recurring_id=in.(${inQuery})`,
        );

        if (exclusionsError) {
                console.error("Failed to fetch exclusions", exclusionsError);
                return [];
        }

        const exclusions = (exclusionsData ?? [])
                .map((row) => mapExclusionRow(row as RawExclusionRow, entriesById))
                .filter((exclusion): exclusion is TExclusionRow => !!exclusion);

        return configs.map((config: RawRecurringConfigRow) => {
                const relatedEntries = recurringEntries
                        .filter((entry) => entry.recurringId === config.id)
                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

                const entry = relatedEntries[0] ?? null;

                const relatedExclusions = exclusions.filter((exclusion) => exclusion.recurringId === config.id);

                return {
                        recurringConfigId: config.id,
                        frequency: (config.frequency as TRecurringConfigRow["frequency"]) ?? "month",
                        interval: config.interval ?? 0,
                        every: config.every ?? 1,
                        startDate: config.start_date ?? new Date().toISOString(),
                        endDate: config.end_date,
                        createdAt: config.created_at,
                        entry,
                        exclusions: relatedExclusions,
                };
        });
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
        const [loading, setLoading] = useState(true);
        const [groups, setGroups] = useState<TGroupRow[]>([]);
        const [tags, setTags] = useState<TTagRow[]>([]);
        const [entries, setEntries] = useState<TEntryRow[]>([]);
        const [recurringConfigs, setRecurringConfigs] = useState<TRecurringConfigRow[]>([]);

        const refresh = useCallback(async () => {
                setLoading(true);
                try {
                        const fetchedGroups = await fetchGroups();
                        const groupsMap = new Map(fetchedGroups.map((group) => [group.id, group]));

                        const fetchedTags = await fetchTags();
                        const tagsMap = new Map(fetchedTags.map((tag) => [tag.id, tag]));

                        const fetchedEntries = await fetchEntries(groupsMap, tagsMap);
                        const fetchedRecurringConfigs = await fetchRecurringConfigs(groupsMap, tagsMap);

                        setGroups(fetchedGroups);
                        setTags(fetchedTags);
                        setEntries(fetchedEntries);
                        setRecurringConfigs(fetchedRecurringConfigs);
                } catch (error) {
                        console.error("Failed to refresh data", error);
                } finally {
                        setLoading(false);
                }
        }, []);

        useEffect(() => {
                void refresh();
        }, [refresh]);

        const withRefresh = useCallback(
                async (operation: () => Promise<void>) => {
                        await operation();
                        await refresh();
                },
                [refresh],
        );

        const createGroup = useCallback(
                async (name: string) => {
                        await withRefresh(async () => {
                                const { error } = await supabaseRequest(`${TABLES.entryGroup}`, {
                                        method: "POST",
                                        body: JSON.stringify({ name }),
                                });
                                if (error) throw error;
                        });
                },
                [withRefresh],
        );

        const deleteGroup = useCallback(
                async (id: string) => {
                        await withRefresh(async () => {
                                const { error } = await supabaseRequest(`${TABLES.entryGroup}?id=eq.${id}`, {
                                        method: "PATCH",
                                        body: JSON.stringify({ is_deleted: true }),
                                });
                                if (error) throw error;
                        });
                },
                [withRefresh],
        );

        const createTag = useCallback(
                async (input: TagInput) => {
                        await withRefresh(async () => {
                                const { error } = await supabaseRequest(`${TABLES.entryTag}`, {
                                        method: "POST",
                                        body: JSON.stringify({
                                                name: input.name,
                                                color: input.color,
                                                suggest_id: input.suggestId,
                                        }),
                                });
                                if (error) throw error;
                        });
                },
                [withRefresh],
        );

        const updateTagColor = useCallback(
                async (id: string, color: string | null) => {
                        await withRefresh(async () => {
                                const { error } = await supabaseRequest(`${TABLES.entryTag}?id=eq.${id}`, {
                                        method: "PATCH",
                                        body: JSON.stringify({ color }),
                                });
                                if (error) throw error;
                        });
                },
                [withRefresh],
        );

        const deleteTag = useCallback(
                async (id: string) => {
                        await withRefresh(async () => {
                                const { error } = await supabaseRequest(`${TABLES.entryTag}?id=eq.${id}`, {
                                        method: "PATCH",
                                        body: JSON.stringify({ is_deleted: true }),
                                });
                                if (error) throw error;
                        });
                },
                [withRefresh],
        );

        const createEntry = useCallback(
                async (input: CreateEntryInput, options?: MutationOptions) => {
                        const { data, error } = await supabaseRequest<{ id: string }[]>(`${TABLES.entry}`, {
                                method: "POST",
                                body: JSON.stringify({
                                        name: input.name,
                                        amount: input.amount,
                                        currency_code: input.currencyCode,
                                        date: input.date,
                                        type: input.type,
                                        group_id: input.groupId,
                                        tag_id: input.tagId,
                                        fullfilled: input.fullfilled,
                                        recurring_id: input.recurringId,
                                }),
                                headers: { Prefer: "return=representation" },
                        });

                        if (error) {
                                console.error("Failed to create entry", error);
                                return null;
                        }

                        if (shouldRefresh(options)) {
                                await refresh();
                        }
                        return data?.[0]?.id ?? null;
                },
                [refresh],
        );

        const createRecurringConfig = useCallback(
                async (input: CreateRecurringConfigInput, options?: MutationOptions) => {
                        const { data, error } = await supabaseRequest<{ id: string }[]>(`${TABLES.recurringConfig}`, {
                                method: "POST",
                                body: JSON.stringify({
                                        frequency: input.frequency,
                                        interval: input.interval,
                                        every: input.every,
                                        start_date: input.startDate,
                                        end_date: input.endDate,
                                }),
                                headers: { Prefer: "return=representation" },
                        });

                        if (error) {
                                console.error("Failed to create recurring config", error);
                                return null;
                        }

                        if (shouldRefresh(options)) {
                                await refresh();
                        }
                        return data?.[0]?.id ?? null;
                },
                [refresh],
        );

        const createExclusion = useCallback(
                async (input: {
                        recurringId: string;
                        date: string;
                        reason: "deletion" | "modification";
                        modifiedEntryId: string | null;
                }, options?: MutationOptions) => {
                        const { data, error } = await supabaseRequest<{ id: string }[]>(`${TABLES.exclusion}`, {
                                method: "POST",
                                body: JSON.stringify({
                                        recurring_id: input.recurringId,
                                        date: input.date,
                                        reason: input.reason,
                                        modified_entry_id: input.modifiedEntryId,
                                }),
                                headers: { Prefer: "return=representation" },
                        });

                        if (error) {
                                console.error("Failed to create exclusion", error);
                                return null;
                        }

                        if (shouldRefresh(options)) {
                                await refresh();
                        }
                        return data?.[0]?.id ?? null;
                },
                [refresh],
        );

        const updateEntry = useCallback(
                async (
                        id: string,
                        values: Partial<Omit<CreateEntryInput, "recurringId" | "date"> & { date?: string; recurringId?: string | null }>,
                        options?: MutationOptions,
                ) => {
                        const payload = sanitizePayload({
                                name: values.name,
                                amount: values.amount,
                                currency_code: values.currencyCode,
                                date: values.date,
                                type: values.type,
                                group_id: values.groupId,
                                tag_id: values.tagId,
                                fullfilled: values.fullfilled,
                                recurring_id: values.recurringId,
                        });

                        const { error } = await supabaseRequest(`${TABLES.entry}?id=eq.${id}`, {
                                method: "PATCH",
                                body: JSON.stringify(payload),
                        });

                        if (error) {
                                console.error("Failed to update entry", error);
                                return;
                        }

                        if (shouldRefresh(options)) {
                                await refresh();
                        }
                },
                [refresh],
        );

        const updateRecurringConfig = useCallback(
                async (
                        id: string,
                        values: Partial<{
                                interval: number | null;
                                every: number | null;
                                endDate: string | null;
                                isDeleted: boolean;
                        }>,
                        options?: MutationOptions,
                ) => {
                        const payload = sanitizePayload({
                                interval: values.interval ?? undefined,
                                every: values.every ?? undefined,
                                end_date: values.endDate ?? undefined,
                                is_deleted: values.isDeleted ?? undefined,
                        });

                        const { error } = await supabaseRequest(`${TABLES.recurringConfig}?id=eq.${id}`, {
                                method: "PATCH",
                                body: JSON.stringify(payload),
                        });

                        if (error) {
                                console.error("Failed to update recurring config", error);
                                return;
                        }

                        if (shouldRefresh(options)) {
                                await refresh();
                        }
                },
                [refresh],
        );

        const updateExclusion = useCallback(
                async (
                        id: string,
                        values: Partial<{ reason: "deletion" | "modification" | null; isDeleted: boolean }>,
                        options?: MutationOptions,
                ) => {
                        const payload = sanitizePayload({
                                reason: values.reason ?? undefined,
                                is_deleted: values.isDeleted ?? undefined,
                        });

                        const { error } = await supabaseRequest(`${TABLES.exclusion}?id=eq.${id}`, {
                                method: "PATCH",
                                body: JSON.stringify(payload),
                        });

                        if (error) {
                                console.error("Failed to update exclusion", error);
                                return;
                        }

                        if (shouldRefresh(options)) {
                                await refresh();
                        }
                },
                [refresh],
        );

        const toggleEntryFullfilled = useCallback(
                async (entry: TPopulatedEntry) => {
                        if (entry.exclusionId && entry.details.entryId) {
                                await updateEntry(
                                        entry.details.entryId,
                                        {
                                                fullfilled: !entry.details.fullfilled,
                                        },
                                        { skipRefresh: true },
                                );
                                await refresh();
                                return;
                        }

                        if (entry.id && !entry.recurringConfigId) {
                                await updateEntry(
                                        entry.id,
                                        {
                                                fullfilled: !entry.details.fullfilled,
                                        },
                                        { skipRefresh: true },
                                );
                                await refresh();
                                return;
                        }

                        if (entry.recurringConfigId) {
                                const newEntryId = await createEntry(
                                        {
                                                name: entry.details.name,
                                                amount: entry.details.amount,
                                                currencyCode: entry.details.currencyCode,
                                                date: entry.date.toISOString(),
                                                type: entry.details.type,
                                                groupId: entry.details.groupId,
                                                tagId: entry.details.tagId,
                                                fullfilled: !entry.details.fullfilled,
                                                recurringId: entry.recurringConfigId,
                                        },
                                        { skipRefresh: true },
                                );

                                if (newEntryId) {
                                        await createExclusion(
                                                {
                                                        recurringId: entry.recurringConfigId,
                                                        date: entry.date.toISOString(),
                                                        reason: "modification",
                                                        modifiedEntryId: newEntryId,
                                                },
                                                { skipRefresh: true },
                                        );
                                }

                                await refresh();
                        }
                },
                [createEntry, createExclusion, refresh, updateEntry],
        );

        const deleteEntry = useCallback(
                async (entry: TPopulatedEntry, withSubsequents = false) => {
                        if (entry.exclusionId) {
                                await supabaseRequest(`${TABLES.exclusion}?id=eq.${entry.exclusionId}`, {
                                        method: "PATCH",
                                        body: JSON.stringify({ reason: "deletion" }),
                                });
                        } else if (entry.id && !entry.recurringConfigId) {
                                await supabaseRequest(`${TABLES.entry}?id=eq.${entry.id}`, {
                                        method: "PATCH",
                                        body: JSON.stringify({ is_deleted: true }),
                                });
                        } else if (entry.recurringConfigId) {
                                await supabaseRequest(`${TABLES.exclusion}`, {
                                        method: "POST",
                                        body: JSON.stringify({
                                                recurring_id: entry.recurringConfigId,
                                                date: entry.date.toISOString(),
                                                reason: "deletion",
                                                modified_entry_id: null,
                                        }),
                                        headers: { Prefer: "return=representation" },
                                });
                        }

                        if (withSubsequents && entry.recurringConfigId) {
                                const { data: exclusionsData } = await supabaseRequest<RawExclusionRow[]>(
                                        `${TABLES.exclusion}?select=*&recurring_id=eq.${entry.recurringConfigId}&is_deleted=is.false`,
                                );

                                const exclusions = (exclusionsData ?? []).map((row) => row as RawExclusionRow);

                                if (entry.index <= 1) {
                                        await supabaseRequest(`${TABLES.recurringConfig}?id=eq.${entry.recurringConfigId}`, {
                                                method: "PATCH",
                                                body: JSON.stringify({ is_deleted: true }),
                                        });
                                        await Promise.all(
                                                exclusions.map(async (exclusion) => {
                                                        await supabaseRequest(`${TABLES.exclusion}?id=eq.${exclusion.id}`, {
                                                                method: "PATCH",
                                                                body: JSON.stringify({ is_deleted: true }),
                                                        });
                                                }),
                                        );
                                } else {
                                        const entryDate = entry.date.getTime();
                                        await Promise.all(
                                                exclusions
                                                        .filter((exclusion) => new Date(exclusion.date).getTime() > entryDate)
                                                        .map(async (exclusion) => {
                                                                await supabaseRequest(`${TABLES.exclusion}?id=eq.${exclusion.id}`, {
                                                                        method: "PATCH",
                                                                        body: JSON.stringify({ is_deleted: true }),
                                                                });
                                                        }),
                                        );

                                        await supabaseRequest(`${TABLES.recurringConfig}?id=eq.${entry.recurringConfigId}`, {
                                                method: "PATCH",
                                                body: JSON.stringify({
                                                        end_date: entry.date.toISOString(),
                                                        interval: entry.index - 1,
                                                }),
                                        });
                                }
                        }

                        await refresh();
                },
                [refresh],
        );

        const editEntry = useCallback(
                async ({
                        entry,
                        newName,
                        newAmount,
                        newGroup,
                        newTag,
                        applyToSubsequents = false,
                        onComplete,
                }: EditEntryInput) => {
                        if (!newName || !newAmount) return;

                        const values = {
                                name: newName,
                                amount: newAmount,
                                groupId: newGroup,
                                tagId: newTag,
                        } as const;

                        if (entry.exclusionId && entry.details.entryId) {
                                await updateEntry(entry.details.entryId, values, { skipRefresh: true });
                        } else if (entry.id && !entry.recurringConfigId) {
                                await updateEntry(entry.id, values, { skipRefresh: true });
                        } else if (entry.recurringConfigId && !entry.exclusionId) {
                                const newEntryId = await createEntry(
                                        {
                                                name: entry.details.name,
                                                amount: values.amount,
                                                currencyCode: entry.details.currencyCode,
                                                date: entry.date.toISOString(),
                                                type: entry.details.type,
                                                groupId: values.groupId,
                                                tagId: values.tagId,
                                                fullfilled: false,
                                                recurringId: entry.recurringConfigId,
                                        },
                                        { skipRefresh: true },
                                );

                                if (newEntryId) {
                                        await createExclusion(
                                                {
                                                        recurringId: entry.recurringConfigId,
                                                        date: entry.date.toISOString(),
                                                        reason: "modification",
                                                        modifiedEntryId: newEntryId,
                                                },
                                                { skipRefresh: true },
                                        );
                                }
                        }

                        if (applyToSubsequents && entry.recurringConfigId && entry.config) {
                                const { data: exclusionsData, error: exclusionsError } =
                                        await supabaseRequest<RawExclusionRow[]>(
                                                `${TABLES.exclusion}?select=*&recurring_id=eq.${entry.recurringConfigId}&is_deleted=is.false`,
                                        );

                                if (exclusionsError) {
                                        console.error("Failed to fetch exclusions for edit", exclusionsError);
                                }

                                const exclusions = (exclusionsData ?? []).map((row) => row as RawExclusionRow);

                                await Promise.all(
                                        exclusions
                                                .filter((exclusion) => new Date(exclusion.date).getTime() > entry.date.getTime())
                                                .map(async (exclusion) => {
                                                        const { error } = await supabaseRequest(
                                                                `${TABLES.exclusion}?id=eq.${exclusion.id}`,
                                                                {
                                                                        method: "PATCH",
                                                                        body: JSON.stringify({ reason: "deletion" }),
                                                                },
                                                        );

                                                        if (error) {
                                                                console.error(`Failed to update exclusion ${exclusion.id}`, error);
                                                        }
                                                }),
                                );

                                await createExclusion(
                                        {
                                                recurringId: entry.recurringConfigId,
                                                date: entry.date.toISOString(),
                                                reason: "deletion",
                                                modifiedEntryId: null,
                                        },
                                        { skipRefresh: true },
                                );

                                await updateRecurringConfig(
                                        entry.recurringConfigId,
                                        {
                                                endDate: entry.date.toISOString(),
                                                interval: entry.index - 1,
                                                every: entry.config.every || 1,
                                        },
                                        { skipRefresh: true },
                                );

                                const newRecurringId = await createRecurringConfig(
                                        {
                                                frequency: entry.config.frequency,
                                                interval: entry.config.interval ? entry.config.interval - entry.index + 1 : 0,
                                                every: entry.config.every || 1,
                                                startDate: entry.date.toISOString(),
                                                endDate: entry.config.endDate,
                                        },
                                        { skipRefresh: true },
                                );

                                if (newRecurringId) {
                                        const newEntryId = await createEntry(
                                                {
                                                        name: values.name,
                                                        amount: values.amount,
                                                        currencyCode: entry.details.currencyCode,
                                                        date: entry.date.toISOString(),
                                                        type: entry.details.type,
                                                        groupId: values.groupId,
                                                        tagId: values.tagId,
                                                        fullfilled: !!entry.details.fullfilled,
                                                        recurringId: newRecurringId,
                                                },
                                                { skipRefresh: true },
                                        );

                                        if (newEntryId) {
                                                await createExclusion(
                                                        {
                                                                recurringId: newRecurringId,
                                                                date: entry.date.toISOString(),
                                                                reason: "modification",
                                                                modifiedEntryId: newEntryId,
                                                        },
                                                        { skipRefresh: true },
                                                );
                                        }
                                }
                        }

                        await refresh();
                        onComplete?.();
                },
                [createEntry, createExclusion, createRecurringConfig, refresh, updateEntry, updateRecurringConfig],
        );

        const eraseAllData = useCallback(async () => {
                const tables = [
                        TABLES.exclusion,
                        TABLES.entry,
                        TABLES.recurringConfig,
                        TABLES.entryGroup,
                        TABLES.entryTag,
                ];

                for (const table of tables) {
                        const { error } = await supabaseRequest(`${table}?id=neq.00000000-0000-0000-0000-000000000000`, {
                                method: "DELETE",
                        });
                        if (error) {
                                console.error(`Failed to erase data from ${table}`, error);
                        }
                }

                await refresh();
        }, [refresh]);

        const value: DataContextValue = {
                loading,
                groups,
                tags,
                entries,
                recurringConfigs,
                refresh,
                createGroup,
                deleteGroup,
                createTag,
                updateTagColor,
                deleteTag,
                createEntry,
                createRecurringConfig,
                createExclusion,
                updateEntry,
                updateRecurringConfig,
                updateExclusion,
                toggleEntryFullfilled,
                deleteEntry,
                editEntry,
                eraseAllData,
        };

        return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
