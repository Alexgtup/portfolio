import fs from "node:fs/promises";
import path from "node:path";

export type Project = {
  slug: string;
  title: string;
  year?: string;
  role?: string;
  description?: string;
  stack?: string[];
  tags?: string[];      // ✅ добавили
  cover?: string;
  links?: { label: string; href: string }[];
  createdAt?: string;
};


const FILE = path.join(process.cwd(), "data", "projects.json");

export async function getProjects(): Promise<Project[]> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    const list = JSON.parse(raw) as Project[];
    return list.sort((a, b) => (b.year ?? "").localeCompare(a.year ?? ""));
  } catch {
    return [];
  }
}

export async function saveProjects(list: Project[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(list, null, 2), "utf-8");
}

export async function getProject(slug: string) {
  const list = await getProjects();
  return list.find((p) => p.slug === slug) ?? null;
}
