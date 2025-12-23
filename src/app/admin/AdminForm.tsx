"use client";

import { useActionState, useEffect, useRef } from "react";
import { ButtonLink } from "@/components/ui";

type ActionState = { ok: true; slug: string } | { ok: false; error: string } | null;

export function AdminForm({
    action,
}: {
    action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
    const [state, formAction, pending] = useActionState(action, null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state?.ok) formRef.current?.reset();
    }, [state]);

    return (
        <form
            ref={formRef}
            action={formAction}
            className="grid sm:grid-cols-2 gap-4"
            encType="multipart/form-data"
        >
            <label className="text-sm text-white/70">
                Название *
                <input
                    name="title"
                    required
                    className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none"
                />
            </label>

            <label className="text-sm text-white/70">
                URL (slug, опционально)
                <input
                    name="slug"
                    placeholder="warehouse-pwa-scanner"
                    className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none"
                />
            </label>

            <label className="text-sm text-white/70">
                Год
                <input name="year" className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none" />
            </label>

            <label className="text-sm text-white/70">
                Роль
                <input name="role" className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none" />
            </label>

            <label className="text-sm text-white/70 sm:col-span-2">
                Описание
                <textarea name="description" rows={4} className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none" />
            </label>

            <label className="text-sm text-white/70 sm:col-span-2">
                Стек (через запятую)
                <input name="stack" placeholder="Next.js, TypeScript, Postgres" className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none" />
            </label>
            <label className="text-sm text-white/70 sm:col-span-2">
                Теги (через запятую)
                <input
                    name="tags"
                    placeholder="PWA, Интеграции, Склад"
                    className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none"
                />
            </label>

            <label className="text-sm text-white/70 sm:col-span-2">
                Обложка (фото/скрин)
                <input name="cover" type="file" accept="image/*" className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none" />
            </label>

            {state?.ok ? (
                <div className="sm:col-span-2 text-sm text-emerald-300">
                    Проект добавлен: /projects/{state.slug}
                </div>
            ) : null}

            {state?.ok === false ? (
                <div className="sm:col-span-2 text-sm text-red-300">
                    {state.error}
                </div>
            ) : null}

            <div className="sm:col-span-2 flex gap-3">
                <ButtonLink href="/projects" variant="ghost">Посмотреть сайт</ButtonLink>
                <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm transition active:scale-[0.99] bg-white text-black hover:bg-white/90 disabled:opacity-50"
                >
                    {pending ? "Добавляю..." : "Добавить проект"}
                </button>
            </div>
        </form>
    );
}
