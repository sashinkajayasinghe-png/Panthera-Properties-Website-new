"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

export const LOGO_MARK = "/brand/logo-mark.png";
export const LOGO_FULL = "/brand/logo-full.png";

/** Header lock-up: the PP monogram plus an animated PANTHERA / PROPERTIES wordmark. */
export function Wordmark({ logoUrl, animate = true, className = "" }: { logoUrl?: string; animate?: boolean; className?: string }) {
  const reduce = useReducedMotion();
  const run = animate && !reduce;
  const letters = "PANTHERA".split("");
  return (
    <span className={`inline-flex items-center gap-3 ${className}`} aria-label="Panthera Properties">
      <motion.span
        className="relative block h-10 w-[50px] shrink-0 md:h-12 md:w-[60px]"
        initial={run ? { opacity: 0, scale: 0.9 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image src={logoUrl || LOGO_MARK} alt="" fill sizes="60px" priority className="object-contain object-left" />
      </motion.span>
      <span className="hidden flex-col leading-none sm:inline-flex" aria-hidden>
        <span className="flex font-serif text-[1.3rem] font-normal tracking-[0.32em] text-gold-soft">
          {letters.map((l, i) => (
            <span key={i} className="inline-block overflow-hidden">
              <motion.span
                className="inline-block"
                initial={run ? { y: "100%" } : false}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.15 + i * 0.05, ease: [0.76, 0, 0.24, 1] }}
              >
                {l}
              </motion.span>
            </span>
          ))}
        </span>
        <motion.span
          className="mt-1 text-[0.5rem] tracking-[0.62em] text-gold"
          initial={run ? { opacity: 0, letterSpacing: "0.2em" } : false}
          animate={{ opacity: 1, letterSpacing: "0.62em" }}
          transition={{ duration: 1.4, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          PROPERTIES
        </motion.span>
      </span>
    </span>
  );
}
