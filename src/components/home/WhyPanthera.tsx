"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { unsplash } from "@/lib/constants";
import { FadeUp, RevealLines } from "@/components/motion/Reveal";

const PILLARS = [
  {
    title: "Personalised property discovery",
    body: "We begin with how you want to live, not with a list. Your brief shapes a focused shortlist — and we keep refining it as your priorities become clearer.",
    image: unsplash("1600607687939-ce8a6c25118c", 1600),
  },
  {
    title: "Local market knowledge",
    body: "Colombo is a city of micro-markets. We help you understand the nuances between suburbs, buildings and streets — and what they mean for value.",
    image: unsplash("1534237710431-e2fc698436d0", 1600),
  },
  {
    title: "Professional property marketing",
    body: "For sellers, we present homes with care: accurate descriptions, clear pricing and targeted introductions to buyers who are a genuine fit.",
    image: unsplash("1613490493576-7fde63acd811", 1600),
  },
  {
    title: "Discreet client service",
    body: "Many of our clients value privacy. Enquiries, viewings and negotiations are handled quietly, with information shared only as you choose.",
    image: unsplash("1600585154526-990dced4db0d", 1600),
  },
  {
    title: "End-to-end transaction assistance",
    body: "From first viewing to handover, we coordinate the details — documentation, due diligence with your lawyers, and timelines — so nothing is left to chance.",
    image: unsplash("1600573472550-8090b5e0745e", 1600),
  },
];

export function WhyPanthera() {
  const [active, setActive] = useState(0);
  return (
    <section className="relative bg-ivory py-28 text-ink md:py-40" aria-label="Why Panthera Properties">
      <div className="container-x">
        <FadeUp className="mb-8 flex items-center gap-4">
          <span className="eyebrow text-gold">05</span>
          <span className="h-px w-16 bg-ink/15" />
          <span className="eyebrow text-ink/60">Why Panthera</span>
        </FadeUp>
        <RevealLines text={"A quieter,\nmore considered\nway to move"} className="display max-w-5xl text-[clamp(2.4rem,6vw,6rem)]" />

        <div className="mt-20 grid gap-16 lg:mt-28 lg:grid-cols-12">
          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-28 aspect-[4/5] overflow-hidden bg-ink">
              <AnimatePresence initial={false}>
                <motion.div
                  key={active}
                  className="absolute inset-0"
                  initial={{ clipPath: "inset(100% 0 0 0)" }}
                  animate={{ clipPath: "inset(0% 0 0 0)" }}
                  transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
                >
                  <Image src={PILLARS[active].image} alt="" fill sizes="40vw" className="object-cover" />
                </motion.div>
              </AnimatePresence>
              <span className="absolute bottom-6 left-6 font-serif text-[7rem] leading-none text-ivory/90 mix-blend-difference">
                0{active + 1}
              </span>
            </div>
          </div>
          <ol className="lg:col-span-6 lg:col-start-7">
            {PILLARS.map((p, i) => (
              <Pillar key={p.title} index={i} {...p} onActive={() => setActive(i)} active={active === i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Pillar({
  index,
  title,
  body,
  image,
  active,
  onActive,
}: {
  index: number;
  title: string;
  body: string;
  image: string;
  active: boolean;
  onActive: () => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inView) onActive();
  }, [inView, onActive]);
  return (
    <li ref={ref} className="border-t border-ink/15 py-12 lg:min-h-[52vh] lg:py-16">
      <div className="relative mb-8 aspect-[16/10] overflow-hidden lg:hidden">
        <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
      </div>
      <p className={`eyebrow mb-6 transition-colors duration-500 ${active ? "text-gold" : "text-ink/40"}`}>0{index + 1}</p>
      <h3 className={`display text-[clamp(2rem,3.6vw,3.6rem)] transition-opacity duration-700 ${active ? "opacity-100" : "lg:opacity-35"}`}>
        {title}
      </h3>
      <p className={`mt-6 max-w-lg text-base leading-relaxed text-ink/70 transition-opacity duration-700 ${active ? "opacity-100" : "lg:opacity-50"}`}>
        {body}
      </p>
    </li>
  );
}
