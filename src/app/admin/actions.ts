"use server";

import { revalidatePath } from "next/cache";
import { getProjects, saveProjects } from "@/lib/projects";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";

export type ActionState =
  | { ok: true; slug: string }
  | { ok: false; error: string }
  | null;

function safeSlug(input: string) {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y",
    к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
    х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };

  const s = (input || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("");

  const slug = s
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-")
    .slice(0, 80);

  return slug || "project";
}

function isFile(v: unknown): v is File {
  return !!v && typeof v === "object" && typeof (v as any).arrayBuffer === "function";
}

async function saveUpload(file: File, base: string): Promise<string> {
  // ВАЖНО: на Vercel filesystem read-only, поэтому загрузки лучше делать локально и коммитить.
  if (process.env.VERCEL) {
    throw new Error("Загрузка файлов доступна только локально (на хостинге файловая система read-only).");
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const extFromName = path.extname(file.name || "").toLowerCase();
  const extFromType = file.type?.includes("/") ? `.${file.type.split("/")[1]}` : "";
  const ext = (extFromName || extFromType || ".jpg").replace(/[^a-z0-9.]/gi, "");

  const stamp = Date.now();
  const rnd = crypto.randomBytes(6).toString("hex");
  const filename = `${safeSlug(base)}-${stamp}-${rnd}${ext}`;

  const bytes = await file.arrayBuffer();
  await fs.writeFile(path.join(uploadsDir, filename), Buffer.from(bytes));

  return `/uploads/${filename}`;
}

async function createProjectImpl(formData: FormData): Promise<string> {
  const title = String(formData.get("title") || "").trim();
  const year = String(formData.get("year") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const slugRaw = String(formData.get("slug") || "").trim();

  const stackRaw = String(formData.get("stack") || "").trim();
  const tagsRaw = String(formData.get("tags") || "").trim();

  if (!title) throw new Error("Нужно название проекта.");

  const slug = safeSlug(slugRaw || title);

  const stack = stackRaw ? stackRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const tags = tagsRaw ? tagsRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const projects = await getProjects();
  if (projects.some((p) => p.slug === slug)) throw new Error("Такой slug уже существует.");

  // multiple images
  const raw = formData.getAll("images");
  const files = raw.filter(isFile).filter((f) => f.size > 0);

  // backward compat (если где-то остался input cover)
  const legacyCover = formData.get("cover");
  if (!files.length && isFile(legacyCover) && legacyCover.size > 0) {
    files.push(legacyCover);
  }

  const linksRaw = String(formData.get("links") || "").trim();

  const links = linksRaw
    ? linksRaw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, href] = line.split("|").map((x) => (x || "").trim());
        if (!label || !href) return null;
        return { label, href };
      })
      .filter(Boolean)
    : [];

  const images = files.length ? await Promise.all(files.map((f) => saveUpload(f, slug))) : [];
  const cover = images[0] || undefined;

  const next = [
    {
      slug,
      title,
      year: year || undefined,
      role: role || undefined,
      description: description || undefined,
      stack,
      tags,
      cover,
      images: images.length ? images : undefined,
      createdAt: new Date().toISOString(),
      links: links.length ? (links as any) : undefined,
    },
    ...projects,
  ];

  await saveProjects(next);

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin");

  return slug;
}

export async function createProject(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const slug = await createProjectImpl(formData);
    return { ok: true, slug };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Ошибка при добавлении проекта" };
  }
}

export async function deleteProject(slug: string, _formData: FormData): Promise<void> {
  const s = String(slug || "").trim();
  if (!s) return;

  const projects = await getProjects();
  const next = projects.filter((p) => p.slug !== s);

  await saveProjects(next);

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin");
}
