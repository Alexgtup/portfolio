"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
    const [ok, setOk] = useState(false);

    return (
        <button
            onClick={async () => {
                await navigator.clipboard.writeText(text);
                setOk(true);
                setTimeout(() => setOk(false), 900);
            }}
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm transition active:scale-[0.99] bg-white/5 text-white hover:bg-white/10 border border-white/10"
        >
            {ok ? "скопировано" : "копировать"}
        </button>
    );
}
