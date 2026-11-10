import Link from "next/link";
import { FadeUp, MaskReveal, RevealLines } from "@/components/motion/Reveal";
import { ParallaxImage } from "@/components/motion/Parallax";
import { ScrollText } from "@/components/motion/ScrollText";

export function Intro({ headline, body, image }: { headline: string; body: string; image: string }) {
  return (
    <section className="relative bg-ink py-28 md:py-44" aria-label="Our philosophy">
      <div className="container-x">
        <FadeUp className="mb-10 flex items-center gap-4 md:mb-16">
          <span className="eyebrow text-gold">01</span>
          <span className="h-px w-16 bg-line" />
          <span className="eyebrow">Our philosophy</span>
        </FadeUp>
        <RevealLines as="h2" text={headline.toUpperCase()} className="display text-[clamp(2.4rem,7vw,7.5rem)]" />

        <div className="mt-20 grid gap-16 md:mt-32 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5 md:col-start-1">
            <MaskReveal>
              <ParallaxImage src={image} alt="A calm, light-filled living space" className="aspect-[4/5] w-full" sizes="(min-width: 768px) 40vw, 100vw" />
            </MaskReveal>
          </div>
          <div className="flex flex-col justify-between gap-12 md:col-span-6 md:col-start-7">
            <ScrollText text={body} className="font-serif text-[clamp(1.5rem,2.4vw,2.35rem)] font-light leading-[1.3]" />
            <FadeUp className="grid gap-8 border-t border-line pt-10 sm:grid-cols-2">
              <div>
                <p className="eyebrow mb-3 text-gold">For buyers</p>
                <p className="text-sm leading-relaxed text-mist">
                  A shortlist shaped around your brief — location, light, privacy, schools, commute and long-term value.
                </p>
              </div>
              <div>
                <p className="eyebrow mb-3 text-gold">For sellers</p>
                <p className="text-sm leading-relaxed text-mist">
                  Considered presentation, accurate positioning and introductions to qualified, serious buyers.
                </p>
              </div>
              <Link href="/about" className="link-underline text-xs uppercase tracking-[0.28em] sm:col-span-2">
                About Panthera →
              </Link>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
