function embedUrl(url: string): { kind: "iframe" | "video"; src: string } | null {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return null;
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").pop();
      return id ? { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}` } : null;
    }
    if (host === "youtu.be") return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed${u.pathname}` };
    if (host === "vimeo.com") return { kind: "iframe", src: `https://player.vimeo.com/video${u.pathname}` };
    if (/\.(mp4|webm)$/i.test(u.pathname)) return { kind: "video", src: url };
    // Virtual-tour providers (Matterport, Kuula, etc.) are embedded as given.
    return { kind: "iframe", src: url };
  } catch {
    return null;
  }
}

export function MediaEmbed({ url, title }: { url: string; title: string }) {
  const e = embedUrl(url);
  if (!e) return null;
  return (
    <div className="relative aspect-video w-full overflow-hidden border border-line bg-charcoal">
      {e.kind === "video" ? (
        <video src={e.src} controls preload="metadata" className="h-full w-full" />
      ) : (
        <iframe
          src={e.src}
          title={title}
          loading="lazy"
          allow="fullscreen; xr-spatial-tracking; accelerometer; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          className="h-full w-full"
        />
      )}
    </div>
  );
}
