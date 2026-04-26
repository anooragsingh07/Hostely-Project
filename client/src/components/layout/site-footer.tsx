import Link from "next/link";

const policyLinks = [
  { href: "/terms-and-conditions", label: "Terms" },
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/refund-policy", label: "Refunds" },
  { href: "/pricing-policy", label: "Pricing" },
  { href: "/prohibited-items", label: "Prohibited items" },
] as const;

/**
 * Compact legal footer — use on marketing, auth, and policy pages.
 */
export const SiteFooter = () => (
  <footer className="border-border border-t">
    <div className="text-muted-foreground container flex flex-col gap-3 py-6 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <span>© {new Date().getFullYear()} Hostely</span>
      <nav className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Legal">
        {policyLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-foreground/80 hover:text-foreground underline-offset-4 hover:underline"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  </footer>
);
