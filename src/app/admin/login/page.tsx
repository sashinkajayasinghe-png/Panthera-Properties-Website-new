import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink px-5">
      <div className="w-full max-w-sm">
        <div className="relative mx-auto h-36 w-40">
          <Image src="/brand/logo-full.png" alt="Panthera Properties" fill sizes="160px" className="object-contain" priority />
        </div>
        <p className="mb-12 mt-6 text-center text-[0.55rem] tracking-[0.6em] text-mist">ADMINISTRATION</p>
        <LoginForm />
      </div>
    </div>
  );
}
