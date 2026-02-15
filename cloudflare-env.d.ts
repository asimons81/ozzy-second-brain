declare global {
  interface D1PreparedStatement {
    bind: (...values: unknown[]) => D1PreparedStatement;
    run: () => Promise<unknown>;
    first: <T = unknown>() => Promise<T | null>;
    all: <T = unknown>() => Promise<{ results: T[] }>;
  }

  interface D1Database {
    prepare: (query: string) => D1PreparedStatement;
  }

  interface CloudflareEnv {
    SECOND_BRAIN_DB?: D1Database;
    SECOND_BRAIN_ADMIN_TOKEN?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    ADMIN_GOOGLE_ALLOWLIST?: string;
    SESSION_TTL_HOURS?: string;
  }
}

export {};
