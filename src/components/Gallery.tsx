"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type Img = { src: string; alt?: string };

export function Gallery({ images }: { images: Img[] }) {
  const list = useMemo(() => images.filter((i) => !!i?.src), [images]);
  const [idx, setIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trackRef.current) return;
    const el = trackRef.current;

    const onScroll = () => {
      const w = el.clientWidth || 1;
      const next = Math.round(el.scrollLeft / w);
      setIdx(Math.min(Math.max(next, 0), list.length - 1));
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [list.length]);

  const go = (next: number) => {
    const el = trackRef.current;
    if (!el) return;
    const w = el.clientWidth || 0;
    el.scrollTo({ left: w * next, behavior: "smooth" });
  };

  if (!list.length) return null;

  return (
    <div className="mt-10">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div
          ref={trackRef}
          className="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {list.map((img, i) => (
            <div
              key={img.src + i}
              className="relative w-full shrink-0 snap-start aspect-[16/9] bg-black/20"
            >
              <Image
                src={img.src}
                alt={img.alt ?? ""}
                fill
                sizes="(max-width: 900px) 100vw, 900px"
                className="object-contain"
                priority={i === 0}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          ))}
        </div>

        <div className="absolute left-3 top-3 rounded-full bg-black/40 border border-white/10 px-3 py-1 text-xs text-white/80">
          {idx + 1}/{list.length}
        </div>

        <div className="absolute right-3 top-3 flex gap-2">
          <button
            onClick={() => go(Math.max(idx - 1, 0))}
            disabled={idx === 0}
            className="h-9 w-9 rounded-full bg-black/40 border border-white/10 text-white/80 hover:text-white disabled:opacity-40 transition"
            aria-label="prev"
          >
            ←
          </button>
          <button
            onClick={() => go(Math.min(idx + 1, list.length - 1))}
            disabled={idx === list.length - 1}
            className="h-9 w-9 rounded-full bg-black/40 border border-white/10 text-white/80 hover:text-white disabled:opacity-40 transition"
            aria-label="next"
          >
            →
          </button>
        </div>
      </div>

      {list.length > 1 ? (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {list.map((img, i) => (
            <button
              key={"thumb-" + img.src + i}
              onClick={() => go(i)}
              className={[
                "relative h-16 w-28 shrink-0 overflow-hidden rounded-xl border transition",
                i === idx ? "border-white/35" : "border-white/10 opacity-70 hover:opacity-100",
              ].join(" ")}
              aria-label={`slide-${i + 1}`}
            >
              <Image src={img.src} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
