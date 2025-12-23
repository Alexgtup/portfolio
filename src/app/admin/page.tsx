import { Section, H1, Lead, Card, Pill } from "@/components/ui";
import { getProjects } from "@/lib/projects";
import { createProject, deleteProject } from "./actions";
import { AdminForm } from "./AdminForm";

export const runtime = "nodejs";

export default async function AdminPage() {
  const projects = await getProjects();

  return (
    <Section className="pt-10 sm:pt-14">
      <div className="max-w-4xl">
        <H1>Admin<span className="text-white/50">.</span></H1>
        <Lead>Добавление проектов: название, описание, стек, обложка.</Lead>

        <Card className="mt-10">
          <AdminForm action={createProject} />
        </Card>

        <div className="mt-10 grid gap-4">
          {projects.map((p) => (
            <Card key={p.slug}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">{p.title}</div>
                  <div className="mt-1 text-sm text-white/55">/{p.slug}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(p.stack ?? []).slice(0, 8).map((s) => <Pill key={s}>{s}</Pill>)}
                  </div>
                </div>

                <form action={deleteProject.bind(null, p.slug)}>
                  <button className="text-sm text-white/70 hover:text-white transition">
                    Удалить
                  </button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
