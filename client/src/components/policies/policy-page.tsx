import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";
import { SiteFooter } from "@/components/layout/site-footer";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface PolicyPageProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Standalone shell for legal pages (outside dashboard).
 */
export const PolicyPage = ({ title, children }: PolicyPageProps) => (
  <div className="flex min-h-screen flex-col">
    <header className="border-border border-b">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" aria-label="Hostely home">
          <BrandMark />
        </Link>
        <ThemeToggle />
      </div>
    </header>
    <main className="flex-1">
      <article className="container max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">{title}</h1>
        <div className="policy-prose text-muted-foreground mt-8 space-y-5 text-sm leading-relaxed">
          {children}
        </div>
      </article>
    </main>
    <SiteFooter />
  </div>
);
