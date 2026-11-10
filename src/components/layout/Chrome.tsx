"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { whatsappLink } from "@/lib/whatsapp";
import { LOGO_FULL } from "./Wordmark";

/** Cursor follower with contextual labels (elements with data-cursor="View"). Pointer devices only. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
      setLabel(el?.dataset.cursor ?? null);
    };
    const loop = () => {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;
  return (
    <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[80] hidden md:block" aria-hidden>
      <div
        className={`-translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500 ease-[var(--ease-out-soft)] flex items-center justify-center ${
          label ? "h-24 w-24 bg-ivory text-ink" : "h-2 w-2 bg-gold"
        }`}
      >
        <span className={`text-[0.6rem] uppercase tracking-[0.25em] transition-opacity ${label ? "opacity-100" : "opacity-0"}`}>
          {label}
        </span>
      </div>
    </div>
  );
}

/** Brief branded intro on the first visit of a session. Never blocks interaction. */
export function IntroLoader() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (sessionStorage.getItem("pp:intro") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      sessionStorage.setItem("pp:intro", "1");
    } catch {
      return;
    }
    setShow(true);
    const t = window.setTimeout(() => setShow(false), 1700);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-ink"
          initial={{ clipPath: "inset(0 0 0 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden
        >
          <motion.div
            className="relative h-44 w-48 md:h-60 md:w-64"
            initial={{ opacity: 0, scale: 0.94, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image src={LOGO_FULL} alt="" fill sizes="256px" priority className="object-contain" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Notice for essential-only storage. The site sets no analytics or advertising cookies. */
export function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem("pp:cookie-notice")) setShow(true);
    } catch {}
  }, []);
  const dismiss = () => {
    try {
      localStorage.setItem("pp:cookie-notice", "1");
    } catch {}
    setShow(false);
  };
  if (!show) return null;
  return (
    <div role="region" aria-label="Cookie notice" className="fixed inset-x-4 bottom-4 z-[70] max-w-md border border-line bg-charcoal/95 p-5 text-sm backdrop-blur md:left-6 md:right-auto">
      <p className="text-mist">
        We use only essential browser storage — to remember your preferences. No advertising or analytics cookies.{" "}
        <Link href="/privacy#cookies" className="text-ivory underline underline-offset-4">Learn more</Link>
      </p>
      <button type="button" onClick={dismiss} className="btn mt-4 min-h-0 px-5 py-2.5">
        Understood
      </button>
    </div>
  );
}

export function WhatsAppFab() {
  return (
    <a
      href={whatsappLink("Hello Panthera Properties, I'd like to know more about your properties.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Panthera Properties on WhatsApp"
      className="fixed bottom-5 right-5 z-[65] flex h-14 w-14 items-center justify-center rounded-full border border-gold/60 bg-ink/80 text-gold backdrop-blur transition-colors hover:bg-gold hover:text-ink"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.5 9.5 0 0 1-4.84-1.32l-.35-.21-3.6.94.96-3.5-.23-.36a9.46 9.46 0 0 1-1.45-5.04c0-5.24 4.27-9.5 9.52-9.5a9.5 9.5 0 0 1 9.5 9.51c0 5.24-4.27 9.5-9.5 9.5m8.08-17.58A11.35 11.35 0 0 0 12.05.5C5.75.5.62 5.63.62 11.93c0 2.01.53 3.98 1.53 5.71L.53 23.5l6-1.57a11.4 11.4 0 0 0 5.46 1.39h.01c6.3 0 11.43-5.13 11.43-11.43 0-3.05-1.19-5.92-3.35-8.08" />
      </svg>
    </a>
  );
}
