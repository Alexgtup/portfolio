"use server";

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { getProjects, saveProjects, type Project } from "@/lib/projects";

type ActionState = { ok: true; slug: string } | { ok: false; error: string } | null;

function safeSlug(input: string) {
  const s = (input || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
  return s || `project-${Date.now()}`;
}

export async function createProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const year = String(formData.get("year") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const stackRaw = String(formData.get("stack") || "").trim();
  const slugRaw = String(formData.get("slug") || "").trim();

  if (!title) return { ok: false, error: "Нужно название проекта." };

  const slug = safeSlug(slugRaw || title);

  const file = formData.get("cover");
  let coverUrl = "";

  if (file instanceof File && file.size > 0) {
    const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
    const hash = crypto.randomBytes(6).toString("hex");
    const filename = `${slug}-${hash}.${ext}`;
    const uploadPath = path.join(process.cwd(), "public", "uploads", filename);

    const buf = Buffer.from(await file.arrayBuffer());
    await fs.mkdir(path.dirname(uploadPath), { recursive: true });
    await fs.writeFile(uploadPath, buf);

    coverUrl = `/uploads/${filename}`;
  }

  const stack = stackRaw ? stackRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const list = await getProjects();

  const next: Project = {
    slug,
    title,
    description,
    year,
    role,
    stack,
    cover: coverUrl || "/uploads/placeholder.png",
    createdAt: new Date().toISOString(),
  };

  await saveProjects([next, ...list.filter((p) => p.slug !== slug)]);
  return { ok: true, slug };
}

export async function deleteProject(slug: string) {
  const list = await getProjects();
  await saveProjects(list.filter((p) => p.slug !== slug));
  return { ok: true };
}
