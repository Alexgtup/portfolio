"use client";

export function OpenCmdKButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("cmdk:open"))}
      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition active:scale-[0.99] bg-white/5 text-white hover:bg-white/10 border border-white/10"
    >
      поиск
      <span className="text-xs text-white/55 border border-white/10 rounded-lg px-2 py-0.5">
        ⌘k
      </span>
    </button>
  );
}
