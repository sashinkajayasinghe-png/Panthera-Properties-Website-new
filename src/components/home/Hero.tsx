"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { RevealLines } from "@/components/motion/Reveal";

export function Hero({ headline, subtext, image, video }: { headline: string; subtext: string; image: string; video?: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [useVideo, setUseVideo] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    // Video only on larger screens with motion allowed and no data-saver; otherwise the static image is used.
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const ok =
      !!video &&
      window.matchMedia("(min-width: 768px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !conn?.saveData;
    setUseVideo(ok);
  }, [video]);

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden bg-ink" aria-label="Introduction">
      <motion.div className="absolute inset-0" style={reduce ? undefined : { scale, y }}>
        <div className={`absolute inset-0 ${reduce ? "" : "animate-kenburns"}`}>
          <Image src={image} alt="Contemporary residence at dusk" fill priority sizes="100vw" className="object-cover" />
          {useVideo && video ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={video}
              poster={image}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
            />
          ) : null}
        </div>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/20 to-ink" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/50 to-transparent" />
      <div className="grain absolute inset-0" />

      <motion.div className="container-x relative flex min-h-[100svh] flex-col justify-end pb-24 pt-32 md:pb-28 md:pt-36" style={reduce ? undefined : { opacity: fade }}>
        <RevealLines
          as="h1"
          immediate
          delay={0.35}
          text={headline.toUpperCase()}
          className="display text-[clamp(2.3rem,8.4vw,9.5rem)] leading-[0.9]"
        />
        <div className="mt-10 flex flex-col gap-8 md:mt-14 md:flex-row md:items-end md:justify-between">
          <motion.p
            className="max-w-md text-base text-ivory/80 md:text-lg"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 1.1 }}
          >
            {subtext}
          </motion.p>
          <motion.div
            className="flex flex-wrap gap-3"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 1.3 }}
          >
            <Link href="/properties" className="btn btn-solid">Explore properties</Link>
            <Link href="/contact?type=sell" className="btn">List your property</Link>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex" aria-hidden>
        <span className="text-[0.6rem] uppercase tracking-[0.4em] text-mist">Scroll</span>
        <span className="relative block h-12 w-px overflow-hidden bg-ivory/15">
          <span className="animate-scrollcue absolute inset-0 bg-gold" />
        </span>
      </div>
    </section>
  );
}
