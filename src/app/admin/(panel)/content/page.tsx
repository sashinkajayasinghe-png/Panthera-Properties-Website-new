import type { Metadata } from "next";
import { getHomepageContent } from "@/lib/content";
import { ContentEditor } from "@/components/admin/ContentEditor";

export const metadata: Metadata = { title: "Homepage & brand" };

export default async function ContentPage() {
  const content = await getHomepageContent();
  return (
    <div>
      <p className="eyebrow">Website</p>
      <h1 className="display mb-10 mt-2 text-5xl">Homepage & brand</h1>
      <ContentEditor initial={content} />
    </div>
  );
}
