"use server";

import { revalidatePath } from "next/cache";
import { getProjects, saveProjects } from "@/lib/projects";
function safeSlug(input: string) {
  const map: Record<string, string> = {
    а:"a", б:"b", в:"v", г:"g", д:"d", е:"e", ё:"e", ж:"zh", з:"z", и:"i", й:"y",
    к:"k", л:"l", м:"m", н:"n", о:"o", п:"p", р:"r", с:"s", т:"t", у:"u", ф:"f",
    х:"h", ц:"ts", ч:"ch", ш:"sh", щ:"sch", ъ:"", ы:"y", ь:"", э:"e", ю:"yu", я:"ya",
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

export async function createProject(formData: FormData): Promise<void> {
  const title = String(formData.get("title") || "").trim();
  const year = String(formData.get("year") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const slugRaw = String(formData.get("slug") || "").trim();

  const stackRaw = String(formData.get("stack") || "").trim();
  const tagsRaw = String(formData.get("tags") || "").trim();

  if (!title) throw new Error("Нужно название проекта.");

  const slug = safeSlug(slugRaw || title);

  const stack = stackRaw
    ? stackRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const tags = tagsRaw
    ? tagsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const projects = await getProjects();

  // если хочешь запретить дубликаты slug:
  if (projects.some((p) => p.slug === slug)) {
    throw new Error("Такой slug уже существует.");
  }

  // cover (если у тебя уже реализована загрузка файла) - оставь свою текущую логику
  const cover = String(formData.get("cover") || "").trim() || undefined;

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
      createdAt: new Date().toISOString(),
    },
    ...projects,
  ];

  await saveProjects(next);

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin");
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
