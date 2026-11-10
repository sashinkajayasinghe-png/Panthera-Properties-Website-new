"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

type Img = { id: string; url: string; alt: string | null };

/** Full-width cinematic gallery with thumbnails, swipe and a keyboard-accessible lightbox. Photos are shown unaltered. */
export function Gallery({ images, title }: { images: Img[]; title: string }) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [lightbox, setLightbox] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = images.length;

  const go = useCallback(
    (d: number) => {
      setDir(d);
      setIdx((i) => (i + d + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (!lightbox) return;
    window.__lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.__lenis?.start();
    };
  }, [lightbox, go]);

  if (!count) return <div className="h-[60svh] bg-charcoal" />;
  const current = images[idx];

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => (touchX.current = e.touches[0].clientX),
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchX.current == null) return;
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      touchX.current = null;
    },
  };

  return (
    <section aria-label={`Photo gallery — ${title}`} aria-roledescription="carousel">
      <div className="relative h-[70svh] overflow-hidden bg-ink md:h-[92svh]" {...swipe}>
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={current.id}
            className="absolute inset-0"
            custom={dir}
            initial={{ clipPath: dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)", scale: 1.08 }}
            animate={{ clipPath: "inset(0 0 0 0%)", scale: 1 }}
            exit={{ opacity: 0.6 }}
            transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
          >
            <Image src={current.url} alt={current.alt || `${title} — photo ${idx + 1}`} fill priority={idx === 0} sizes="100vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/50" />
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute inset-0 cursor-zoom-in"
          aria-label="Open full-screen gallery"
          data-cursor="Expand"
        />
        {count > 1 ? (
          <div className="absolute bottom-6 right-5 flex items-center gap-4 md:right-[4vw]">
            <span className="text-xs tracking-[0.2em] text-ivory/80" aria-live="polite">
              {String(idx + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <button type="button" onClick={() => go(-1)} className="flex h-12 w-12 items-center justify-center rounded-full border border-ivory/40 bg-ink/40 backdrop-blur hover:border-gold hover:text-gold" aria-label="Previous photo">←</button>
            <button type="button" onClick={() => go(1)} className="flex h-12 w-12 items-center justify-center rounded-full border border-ivory/40 bg-ink/40 backdrop-blur hover:border-gold hover:text-gold" aria-label="Next photo">→</button>
          </div>
        ) : null}
      </div>

      {count > 1 ? (
        <div className="container-x no-scrollbar mt-3 flex gap-2 overflow-x-auto" data-lenis-prevent>
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => {
                setDir(i > idx ? 1 : -1);
                setIdx(i);
              }}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === idx}
              className={`relative h-16 w-24 shrink-0 overflow-hidden transition-opacity md:h-20 md:w-32 ${i === idx ? "opacity-100 ring-1 ring-gold" : "opacity-50 hover:opacity-100"}`}
            >
              <Image src={img.url} alt="" fill sizes="128px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      <AnimatePresence>
        {lightbox ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Full-screen gallery"
            className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/97"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...swipe}
          >
            <div className="relative h-[85vh] w-[94vw]">
              <Image src={current.url} alt={current.alt || `${title} — photo ${idx + 1}`} fill sizes="94vw" className="object-contain" />
            </div>
            <button type="button" autoFocus onClick={() => setLightbox(false)} className="absolute right-5 top-5 text-xs uppercase tracking-[0.24em] hover:text-gold">
              Close ×
            </button>
            {count > 1 ? (
              <>
                <button type="button" onClick={() => go(-1)} className="absolute left-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full border border-ivory/30 hover:border-gold" aria-label="Previous photo">←</button>
                <button type="button" onClick={() => go(1)} className="absolute right-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full border border-ivory/30 hover:border-gold" aria-label="Next photo">→</button>
              </>
            ) : null}
            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs tracking-[0.2em] text-mist">{idx + 1} / {count}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
