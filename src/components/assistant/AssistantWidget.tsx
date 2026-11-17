"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { AssistantPanel } from "./AssistantPanel";

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (pathname === "/properties") return null; // the search page has the assistant inline

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="assistant-panel"
        className="fixed bottom-5 right-24 z-[65] flex h-14 items-center gap-2 rounded-full border border-line bg-ink/80 px-5 text-[0.65rem] uppercase tracking-[0.22em] backdrop-blur transition-colors hover:border-gold hover:text-gold"
      >
        <span aria-hidden className="text-gold">✦</span>
        <span className="hidden sm:inline">Property assistant</span>
        <span className="sm:hidden">Ask</span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            id="assistant-panel"
            role="dialog"
            aria-label="Property assistant"
            className="fixed inset-x-3 bottom-24 z-[66] max-h-[75vh] overflow-y-auto border border-line bg-charcoal p-6 shadow-2xl sm:left-auto sm:right-5 sm:w-[440px]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            data-lenis-prevent
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-gold">Property assistant</p>
                <p className="mt-2 text-xs leading-relaxed text-mist">
                  Describe what you are looking for. Results come only from our current listings.
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="text-xl text-mist hover:text-ivory">
                ×
              </button>
            </div>
            <AssistantPanel compact onNavigate={() => setOpen(false)} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
