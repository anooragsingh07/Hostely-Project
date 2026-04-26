import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border border-b">
        <div className="container flex h-14 items-center justify-between">
          <BrandMark />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild size="sm">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-24 md:py-32">
          <div className="max-w-2xl">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-[0.18em]">
              Campus marketplace
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              The hostel marketplace, done properly.
            </h1>
            <p className="text-muted-foreground mt-4 text-base md:text-lg">
              Buy, sell, and swap within your own hostel. Verified by roll number, scoped to your
              department, kept tidy by design.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Button asChild size="lg">
                <Link href="/sign-up">
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
