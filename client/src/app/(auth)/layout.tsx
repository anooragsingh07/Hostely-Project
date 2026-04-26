import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";
import { SiteFooter } from "@/components/layout/site-footer";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border border-b">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" aria-label="Hostely home">
            <BrandMark />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="grid flex-1 place-items-center px-4 py-10">
        <div className="animate-fade-in w-full max-w-md">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
