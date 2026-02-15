import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import matter from "gray-matter";
import { isAuthorizedWriteRequest } from "@/lib/admin-auth";
import { getStorageAdapter } from "@/lib/storage";
import { getCategoryByKey } from "@/lib/categories";

export const dynamic = "force-dynamic";

const MAX_BODY_LENGTH = 200_000;

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function safeRevalidate(pathname: string) {
  try {
    revalidatePath(pathname);
  } catch {
    // Revalidation context is only present during Next request execution.
  }
}

function revalidateNotePaths(category: string, slug: string) {
  safeRevalidate("/");
  safeRevalidate("/docs");
  safeRevalidate(`/docs/${category}`);
  safeRevalidate(`/docs/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`);
  safeRevalidate("/tags");
  safeRevalidate("/activity");
}

function validateCategoryAndSlug(category: string, slug: string) {
  if (!getCategoryByKey(category)) throw new Error("Unknown category");

  const normalized = slug.trim();
  if (!normalized || normalized.includes("/") || normalized.includes("\\") || normalized.includes("..")) {
    throw new Error("Invalid slug");
  }
  return normalized;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ category: string; slug: string }> }
) {
  const { category, slug } = await params;

  let normalizedSlug = "";
  try {
    normalizedSlug = validateCategoryAndSlug(category, decodeURIComponent(slug));
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Invalid request");
  }

  const storage = await getStorageAdapter();

  try {
    const md = await storage.readNote(category, normalizedSlug);
    return NextResponse.json({ category, slug: normalizedSlug, markdown: md });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ category: string; slug: string }> }
) {
  if (!(await isAuthorizedWriteRequest(req))) return unauthorized();

  const { category, slug } = await params;

  let normalizedSlug = "";
  try {
    normalizedSlug = validateCategoryAndSlug(category, decodeURIComponent(slug));
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Invalid request");
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return badRequest("Body must be valid JSON");
  }
  if (!payload || typeof payload !== "object") return badRequest("Body must be a JSON object");

  const record = payload as Record<string, unknown>;
  const content =
    typeof record.content === "string"
      ? record.content
      : typeof record.body === "string"
      ? record.body
      : "";

  if (!content.trim()) return badRequest("content is required");
  if (content.length > MAX_BODY_LENGTH) return badRequest(`content exceeds ${MAX_BODY_LENGTH} characters`);

  const parseTags = (value: unknown) => {
    const raw =
      typeof value === "string"
        ? value.split(",")
        : Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string")
        : [];
    const seen = new Set<string>();
    return raw
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
      .filter((tag) => {
        if (seen.has(tag)) return false;
        seen.add(tag);
        return true;
      });
  };

  const storage = await getStorageAdapter();
  let existingData: Record<string, unknown> = {};
  try {
    existingData = matter(await storage.readNote(category, normalizedSlug)).data;
  } catch {
    existingData = {};
  }

  const now = new Date().toISOString();
  const title =
    typeof record.title === "string" && record.title.trim()
      ? record.title.trim()
      : typeof existingData.title === "string" && existingData.title.trim()
      ? existingData.title.trim()
      : normalizedSlug;

  const nextData: Record<string, unknown> = {
    ...existingData,
    title,
    date: typeof existingData.date === "string" && existingData.date ? existingData.date : now,
    modified: now,
    tags: parseTags(record.tags ?? existingData.tags),
  };

  if (record.author === "user" || record.author === "agent") {
    nextData.author = record.author;
  }

  if (record.requestReview === true) {
    nextData.review_status = "pending";
  }

  const markdown = matter.stringify(content, nextData);
  await storage.writeNote(category, normalizedSlug, markdown);
  revalidateNotePaths(category, normalizedSlug);

  return NextResponse.json({ ok: true, href: `/docs/${category}/${normalizedSlug}` });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ category: string; slug: string }> }
) {
  if (!(await isAuthorizedWriteRequest(req))) return unauthorized();

  const { category, slug } = await params;

  let normalizedSlug = "";
  try {
    normalizedSlug = validateCategoryAndSlug(category, decodeURIComponent(slug));
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Invalid request");
  }

  const storage = await getStorageAdapter();
  await storage.deleteNote(category, normalizedSlug);
  revalidateNotePaths(category, normalizedSlug);

  return NextResponse.json({ ok: true });
}
