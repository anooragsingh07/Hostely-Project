import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" aria-label="Hostely home">
            <BrandMark />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 grid place-items-center px-4 py-10">
        <div className="w-full max-w-md animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
