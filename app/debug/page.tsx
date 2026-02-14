import { getAllDocs, getContentSource } from '@/lib/brain';
import { getRuntimeLabel, getStorageRuntimeInfo } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const ENV_KEYS = ['SECOND_BRAIN_STORAGE', 'VERCEL', 'CF_PAGES', 'CF_WORKER', 'NODE_ENV'] as const;

function safeError(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }
  return { message: String(error) };
}

export default function DebugPage() {
  const errors: Array<{ scope: string; error: unknown }> = [];

  const runtimeLabel = getRuntimeLabel();
  const storage = getStorageRuntimeInfo();
  const contentSource = getContentSource();

  let docsFound = 0;
  let firstPaths: string[] = [];
  let firstTags: string[] = [];

  try {
    const docs = getAllDocs();
    docsFound = docs.length;
    firstPaths = docs.slice(0, 10).map((doc) => `${doc.category}/${doc.slug}`);
    const tags = new Set<string>();
    for (const doc of docs) {
      for (const tag of doc.tags ?? []) {
        tags.add(tag);
      }
      if (tags.size >= 10) break;
    }
    firstTags = [...tags].slice(0, 10);
  } catch (error) {
    errors.push({ scope: 'getAllDocs', error });
  }

  const envRows = ENV_KEYS.map((key) => ({
    key,
    value: process.env[key] && process.env[key]?.trim() ? process.env[key] : 'unset',
  }));

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 md:px-10 space-y-6">
      <h1 className="text-3xl font-black tracking-tight">Functional Audit Debug</h1>

      <section className="glass rounded-2xl border-white/10 p-5 space-y-3">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-brand">Runtime</h2>
        <p className="text-sm text-zinc-200">runtime label: {runtimeLabel}</p>
        <p className="text-sm text-zinc-200">content source: {contentSource}</p>
        <p className="text-sm text-zinc-200">storage mode: {storage.mode}</p>
        <p className="text-sm text-zinc-200">writesAllowed: {String(storage.writesAllowed)}</p>
      </section>

      <section className="glass rounded-2xl border-white/10 p-5 space-y-3">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-brand">Allowlisted Env</h2>
        <ul className="space-y-1 text-sm text-zinc-200">
          {envRows.map((row) => (
            <li key={row.key} className="font-mono">{row.key}: {row.value}</li>
          ))}
        </ul>
      </section>

      <section className="glass rounded-2xl border-white/10 p-5 space-y-3">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-brand">Content</h2>
        <p className="text-sm text-zinc-200">docs found: {docsFound}</p>
        <p className="text-xs font-black uppercase tracking-wider text-zinc-500">first 10 paths</p>
        <ul className="list-disc pl-6 text-sm text-zinc-300">
          {firstPaths.map((value) => <li key={value}>{value}</li>)}
        </ul>
        <p className="text-xs font-black uppercase tracking-wider text-zinc-500">first 10 tags</p>
        <ul className="list-disc pl-6 text-sm text-zinc-300">
          {firstTags.map((value) => <li key={value}>{value}</li>)}
        </ul>
      </section>

      <section className="glass rounded-2xl border-white/10 p-5 space-y-3">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-brand">Errors</h2>
        {errors.length === 0 ? (
          <p className="text-sm text-emerald-400">none</p>
        ) : (
          <ul className="space-y-2 text-sm text-red-200">
            {errors.map((entry, index) => (
              <li key={`${entry.scope}-${index}`} className="font-mono">
                {entry.scope}: {JSON.stringify(safeError(entry.error))}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
