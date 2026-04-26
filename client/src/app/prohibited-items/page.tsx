import type { Metadata } from "next";
import { PolicyPage } from "@/components/policies/policy-page";

export const metadata: Metadata = {
  title: "Prohibited Items — Hostely",
  description: "Items and content not allowed on Hostely.",
};

export default function ProhibitedItemsPage() {
  return (
    <PolicyPage title="Prohibited Items Policy">
      <p>
        The following categories of items and content are strictly banned. Violations may result in
        removal of listings, suspension, or termination of your account.
      </p>

      <h2>Illegal and harmful</h2>
      <ul>
        <li>Drugs, narcotics, and related substances</li>
        <li>Weapons, explosives, fireworks, pepper spray, and similar items</li>
      </ul>

      <h2>Regulated substances</h2>
      <ul>
        <li>Alcohol, cigarettes, vapes, tobacco, and related products</li>
      </ul>

      <h2>Fraudulent or illegal goods</h2>
      <ul>
        <li>Counterfeit or stolen goods</li>
        <li>Black-market or illegally obtained products</li>
      </ul>

      <h2>Medical</h2>
      <ul>
        <li>Prescription medicines</li>
        <li>Injections and regulated medical devices (unless legally permitted and compliant)</li>
      </ul>

      <h2>Digital and cyber</h2>
      <ul>
        <li>Hacked, pirated, or unlicensed software</li>
        <li>Sale of social media or game accounts where prohibited by platform terms or law</li>
        <li>Other illegal digital goods or services</li>
      </ul>

      <h2>Sensitive items</h2>
      <ul>
        <li>Government IDs and official documents</li>
        <li>SIM cards, bank accounts, or credentials</li>
        <li>Other personal documents that create identity or fraud risk</li>
      </ul>

      <h2>Other</h2>
      <ul>
        <li>Adult or obscene content</li>
        <li>Wildlife or animal products where restricted or illegal</li>
        <li>Perishable food items (unless clearly allowed by local rules and safe)</li>
        <li>
          Used undergarments or hygiene-sensitive items in a way that violates health or decency
          norms
        </li>
      </ul>

      <p>
        This list is not exhaustive. Hostely may remove any listing we reasonably believe violates
        law, safety, or community standards.
      </p>
    </PolicyPage>
  );
}
