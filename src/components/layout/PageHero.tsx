import { ParallaxImage } from "@/components/motion/Parallax";
import { FadeUp, RevealLines } from "@/components/motion/Reveal";

export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  imageNote,
  compact,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  image?: string | null;
  imageNote?: string;
  compact?: boolean;
  children?: React.ReactNode;
}) {
  if (!image) {
    return (
      <section className="container-x pb-12 pt-36 md:pb-16 md:pt-48">
        {eyebrow ? <FadeUp className="eyebrow mb-6">{eyebrow}</FadeUp> : null}
        <RevealLines as="h1" immediate text={title} className="display text-[clamp(2.8rem,8vw,8rem)]" />
        {intro ? <FadeUp className="mt-8 max-w-xl text-base text-mist md:text-lg">{intro}</FadeUp> : null}
        {children}
      </section>
    );
  }
  return (
    <section className={`relative isolate flex items-end overflow-hidden ${compact ? "min-h-[70svh]" : "min-h-[88svh]"}`}>
      <ParallaxImage src={image} alt="" priority className="!absolute inset-0 -z-10" strength={8} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/60 via-ink/30 to-ink" />
      {imageNote ? <p className="absolute right-4 top-24 text-[0.55rem] uppercase tracking-[0.2em] text-ivory/60 md:top-28">{imageNote}</p> : null}
      <div className="container-x pb-14 pt-40 md:pb-20">
        {eyebrow ? <FadeUp className="eyebrow mb-6 text-ivory/80">{eyebrow}</FadeUp> : null}
        <RevealLines as="h1" immediate text={title} className="display text-[clamp(2.8rem,8vw,8.5rem)]" />
        {intro ? <FadeUp className="mt-8 max-w-xl text-base text-ivory/80 md:text-lg">{intro}</FadeUp> : null}
        {children}
      </div>
    </section>
  );
}
