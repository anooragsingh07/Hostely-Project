import type { Metadata } from "next";
import { PolicyPage } from "@/components/policies/policy-page";

export const metadata: Metadata = {
  title: "Pricing Policy — Hostely",
  description: "How pricing works on Hostely — free listings and item prices in INR.",
};

export default function PricingPolicyPage() {
  return (
    <PolicyPage title="Pricing Policy">
      <h2>Using Hostely</h2>
      <p>
        Creating an account, posting listings, and browsing the marketplace are free. Hostely does
        not charge a per-listing or subscription fee for these core features at this time.
      </p>

      <h2>Currency and item prices</h2>
      <p>
        Sellers set their own asking prices, shown in Indian Rupees (₹). Those amounts are for
        private sales between users; they are not fees paid to Hostely. Hostely does not guarantee
        listing prices and is not responsible for how buyers and sellers settle payment between
        themselves.
      </p>

      <h2>Future paid features</h2>
      <p>
        We may introduce optional paid features later. If we do, we will publish clear pricing and
        any applicable taxes with those features before they apply.
      </p>
    </PolicyPage>
  );
}
