"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

// The first page load is server-rendered fully visible (the intro loader handles that moment);
// the curtain only plays on client-side navigations, so content is never hidden waiting for JS.
let hasNavigated = false;

/** Page transition: a short curtain lift and content fade on every client-side navigation. */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const [play] = useState(() => hasNavigated);
  useEffect(() => {
    hasNavigated = true;
  }, []);
  if (reduce || !play) return <>{children}</>;
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[58] bg-charcoal"
        initial={{ clipPath: "inset(0 0 0% 0)" }}
        animate={{ clipPath: "inset(0 0 100% 0)" }}
        transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.15 }}>
        {children}
      </motion.div>
    </>
  );
}
