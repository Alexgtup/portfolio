import fs from "node:fs/promises";
import path from "node:path";

export type ProjectLink = { label: string; href: string };

export type Project = {
  slug: string;
  title: string;
  year?: string;
  role?: string;
  description?: string;
  stack?: string[];
  tags?: string[];
  cover?: string;
  images?: string[];
  links?: ProjectLink[];
  createdAt?: string;
};

const DATA_PATH = path.join(process.cwd(), "data", "projects.json");

function normalizePublicPath(v?: string) {
  if (!v) return undefined;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;

  // поддержка кейсов "public/uploads/..", "uploads/..", "./public/uploads/.."
  let s = v.replace(/^\.?\/*public\//, "/");
  if (!s.startsWith("/")) s = `/${s}`;
  return s;
}

function normalizeProject(p: Project): Project {
  const cover = normalizePublicPath(p.cover);
  const images = (p.images ?? []).map(normalizePublicPath).filter(Boolean) as string[];
  return {
    ...p,
    cover,
    images: images.length ? images : undefined,
  };
}

export async function getProjects(): Promise<Project[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as Project[];
    return (Array.isArray(parsed) ? parsed : []).map(normalizeProject);
  } catch {
    return [];
  }
}

export async function getProject(slug: string): Promise<Project | null> {
  const all = await getProjects();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function saveProjects(projects: Project[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(projects, null, 2), "utf8");
}
