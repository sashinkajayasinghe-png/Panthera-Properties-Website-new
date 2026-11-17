import type { Metadata } from "next";
import Link from "next/link";
import { unsplash } from "@/lib/constants";
import { PageHero } from "@/components/layout/PageHero";
import { FadeUp, MaskReveal, RevealLines } from "@/components/motion/Reveal";
import { ParallaxImage } from "@/components/motion/Parallax";
import { WhyPanthera } from "@/components/home/WhyPanthera";

export const metadata: Metadata = {
  title: "About Panthera Properties",
  description: "Panthera Properties is a Colombo-based luxury real estate firm connecting discerning clients with exceptional homes, land and investment properties.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  ["Listen first", "Every search starts with a conversation about how you live — not a list of what is available."],
  ["Transparent representation", "Accurate descriptions and clear pricing. If something is not right for you, we will say so."],
  ["Protect your privacy", "Your details, your budget and your plans are shared only with your permission."],
  ["See it through", "We stay involved until the keys change hands — coordinating with lawyers, surveyors and banks as needed."],
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={"More than\nproperty"}
        intro="A Colombo real estate firm built around a simple idea — finding the right home should feel as considered as the home itself."
        image={unsplash("1600607687644-c7171b42498f", 2400)}
      />
      <section className="container-x grid gap-16 py-28 md:grid-cols-12 md:py-40">
        <div className="md:col-span-5">
          <MaskReveal>
            <ParallaxImage src={unsplash("1613545325278-f24b0cae1224", 1600)} alt="" className="aspect-[4/5]" sizes="(min-width: 768px) 40vw, 100vw" />
          </MaskReveal>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <p className="eyebrow mb-8 text-gold">Who we are</p>
          <RevealLines text={"A distinctive\nway of living"} className="display text-[clamp(2.4rem,5vw,5rem)]" />
          <FadeUp className="mt-10 space-y-6 text-base leading-[1.85] text-ivory/80">
            <p>
              Panthera Properties is a luxury real estate firm based in Colombo, Sri Lanka. We represent the sale of apartments, penthouses,
              houses, villas, residential land and investment properties across the city and its surrounding suburbs.
            </p>
            <p>
              We work with a deliberately focused portfolio, so that every property receives proper attention and every client receives a
              personal service — from the first private conversation to the final signature.
            </p>
            <p>
              Whether you are buying your first home in the city, relocating to Sri Lanka, investing, or preparing to sell a family residence,
              our role is the same: to understand what matters to you, and to handle everything else with care and discretion.
            </p>
          </FadeUp>
        </div>
      </section>

      <section className="border-y border-line bg-charcoal py-28 md:py-36">
        <div className="container-x">
          <p className="eyebrow mb-12">How we work</p>
          <ol className="grid gap-px bg-line md:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map(([t, b], i) => (
              <FadeUp as="li" key={t} delay={i * 0.08} className="bg-charcoal p-8">
                <span className="text-xs tracking-[0.2em] text-gold">0{i + 1}</span>
                <h3 className="display mt-8 text-3xl">{t}</h3>
                <p className="mt-4 text-sm leading-relaxed text-mist">{b}</p>
              </FadeUp>
            ))}
          </ol>
        </div>
      </section>

      <WhyPanthera />

      <section className="container-x py-28 text-center md:py-40">
        <RevealLines text={"Let's begin with\na conversation"} className="display mx-auto text-[clamp(2.4rem,6vw,6rem)]" />
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link href="/contact" className="btn btn-solid">Private consultation</Link>
          <Link href="/properties" className="btn">Explore properties</Link>
        </div>
      </section>
    </>
  );
}
