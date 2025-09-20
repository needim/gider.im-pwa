import { createContext, useContext } from "react";

import type {
        TEntryRow,
        TPopulatedEntry,
        TRecurringConfigRow,
        TTagRow,
        TGroupRow,
} from "@/evolu-queries";

export interface TagInput {
        name: string;
        color?: string | null;
        suggestId?: string | null;
}

export interface CreateEntryInput {
        name: string;
        amount: string;
        currencyCode: string;
        date: string;
        type: "income" | "expense" | "assets";
        groupId: string | null;
        tagId: string | null;
        fullfilled: boolean;
        recurringId: string | null;
}

export interface CreateRecurringConfigInput {
        frequency: "week" | "month" | "year";
        interval: number;
        every: number;
        startDate: string;
        endDate: string | null;
}

export interface MutationOptions {
        skipRefresh?: boolean;
}

export interface EditEntryInput {
        entry: TPopulatedEntry;
        newName: string;
        newAmount: string;
        newGroup: string | null;
        newTag: string | null;
        applyToSubsequents?: boolean;
        onComplete?: () => void;
}

export interface DataContextValue {
        loading: boolean;
        groups: TGroupRow[];
        tags: TTagRow[];
        entries: TEntryRow[];
        recurringConfigs: TRecurringConfigRow[];
        refresh: () => Promise<void>;
        createGroup: (name: string) => Promise<void>;
        deleteGroup: (id: string) => Promise<void>;
        createTag: (input: TagInput) => Promise<void>;
        updateTagColor: (id: string, color: string | null) => Promise<void>;
        deleteTag: (id: string) => Promise<void>;
        createEntry: (input: CreateEntryInput, options?: MutationOptions) => Promise<string | null>;
        createRecurringConfig: (
                input: CreateRecurringConfigInput,
                options?: MutationOptions,
        ) => Promise<string | null>;
        createExclusion: (input: {
                recurringId: string;
                date: string;
                reason: "deletion" | "modification";
                modifiedEntryId: string | null;
        }, options?: MutationOptions) => Promise<string | null>;
        updateEntry: (
                id: string,
                values: Partial<
                        Omit<CreateEntryInput, "recurringId" | "date"> & { date?: string; recurringId?: string | null }
                >,
                options?: MutationOptions,
        ) => Promise<void>;
        updateRecurringConfig: (
                id: string,
                values: Partial<{
                        interval: number | null;
                        every: number | null;
                        endDate: string | null;
                        isDeleted: boolean;
                }>,
                options?: MutationOptions,
        ) => Promise<void>;
        updateExclusion: (
                id: string,
                values: Partial<{ reason: "deletion" | "modification" | null; isDeleted: boolean }>,
                options?: MutationOptions,
        ) => Promise<void>;
        toggleEntryFullfilled: (entry: TPopulatedEntry) => Promise<void>;
        deleteEntry: (entry: TPopulatedEntry, withSubsequents?: boolean) => Promise<void>;
        editEntry: (input: EditEntryInput) => Promise<void>;
        eraseAllData: () => Promise<void>;
}

export const DataContext = createContext<DataContextValue | undefined>(undefined);

export const useData = () => {
        const context = useContext(DataContext);
        if (!context) {
                throw new Error("useData must be used within a DataProvider");
        }
        return context;
};

export const useGroups = () => useData().groups;
export const useTags = () => useData().tags;
export const useEntries = () => useData().entries;
export const useRecurringConfigs = () => useData().recurringConfigs;

export const useEntryActions = () => {
        const { toggleEntryFullfilled, deleteEntry, editEntry } = useData();
        return { toggleEntryFullfilled, deleteEntry, editEntry };
};

// Option A — destructure + tip bildirimi
const updateEntry = ({
  id,
  values,
}: {
  id: string;
  values: Partial<{ reason: "deletion" | "modification" | null; isDeleted: boolean }>;
}) => {
  // Example usage to avoid unused variable error
  console.log("Updating entry", id, values);
};

// Option B — tek parametre olarak tipli obje
const updateEntry2 = (payload: {
  id: string;
  values: Partial<{ reason: "deletion" | "modification" | null; isDeleted: boolean }>;
}) => {
  // ...existing code...
};
