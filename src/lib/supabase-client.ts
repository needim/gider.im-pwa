const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface SupabaseResponse<T> {
        data: T | null;
        error: Error | null;
}

const createHeaders = () => {
        if (!supabaseUrl || !supabaseAnonKey) {
                console.warn("Supabase environment variables are not configured.");
                return null;
        }

        return {
                apikey: supabaseAnonKey,
                Authorization: `Bearer ${supabaseAnonKey}`,
        } satisfies Record<string, string>;
};

export const supabaseRequest = async <T>(path: string, init: RequestInit = {}): Promise<SupabaseResponse<T>> => {
        const headers = createHeaders();
        if (!supabaseUrl || !headers) {
                return { data: null, error: new Error("Supabase environment variables are not configured.") };
        }

        const requestHeaders = new Headers({
                ...headers,
                "Content-Type": "application/json",
                ...init.headers,
        });

        try {
                const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
                        ...init,
                        headers: requestHeaders,
                });

                if (!response.ok) {
                        const message = await response.text();
                        return { data: null, error: new Error(message || response.statusText) };
                }

                if (response.status === 204) {
                        return { data: null, error: null };
                }

                const data = (await response.json()) as T;
                return { data, error: null };
        } catch (error) {
                return { data: null, error: error as Error };
        }
};
