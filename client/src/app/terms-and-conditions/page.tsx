import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/components/policies/policy-page";

export const metadata: Metadata = {
  title: "Terms & Conditions — Hostely",
  description: "Terms of use for the Hostely campus marketplace.",
};

export default function TermsPage() {
  return (
    <PolicyPage title="Terms & Conditions">
      <p>
        Welcome to Hostely. By creating an account or using our services, you agree to these Terms &
        Conditions and our related policies (including the{" "}
        <Link href="/privacy-policy" className="hover:text-foreground underline underline-offset-4">
          Privacy Policy
        </Link>
        ).
      </p>

      <h2>1. User responsibilities</h2>
      <ul>
        <li>You must provide accurate and truthful information in your profile and listings.</li>
        <li>
          Posting illegal, harmful, or prohibited items is strictly forbidden. See our{" "}
          <Link
            href="/prohibited-items"
            className="hover:text-foreground underline underline-offset-4"
          >
            Prohibited Items Policy
          </Link>
          .
        </li>
        <li>You are responsible for your interactions with other users.</li>
      </ul>

      <h2>2. Platform role</h2>
      <p>
        Hostely acts only as a facilitator between buyers and sellers. We do not guarantee the
        quality, authenticity, safety, or condition of listed items. Transactions are between users;
        Hostely is not a party to any sale.
      </p>

      <h2>3. Fees and charges</h2>
      <p>
        Hostely is free to use for creating an account, posting listings, and browsing. Sellers set
        their own item prices in Indian Rupees; those are agreed between buyers and sellers—Hostely
        does not charge a platform fee for ordinary listing or discovery today. If we ever introduce
        optional or paid features, we will update these terms and our{" "}
        <Link href="/pricing-policy" className="hover:text-foreground underline underline-offset-4">
          Pricing Policy
        </Link>{" "}
        in advance.
      </p>

      <h2>4. Shipping and delivery</h2>
      <p>
        Hostely does not provide shipping services. Buyers and sellers are expected to coordinate
        in-person handoff on campus. Users are responsible for verifying items before completing an
        exchange.
      </p>

      <h2>5. Products and services</h2>
      <p>
        Hostely is a platform for college hostel students to buy and sell second-hand items. We
        offer account access, listings, and in-app messaging. Hostely is not responsible for product
        quality, item condition, or disputes over delivery or exchange between users.
      </p>

      <h2>6. Listing review</h2>
      <ul>
        <li>
          Listings may be reviewed for policy compliance (typical window: within a few hours).
        </li>
        <li>
          Approved listings may be shown on the platform; rejections may not always include a
          detailed notification.
        </li>
        <li>For support, contact us using the channels we publish in the app or on our website.</li>
      </ul>
      <p>Use your college email for official communication where required.</p>

      <h2>7. Termination</h2>
      <p>
        Accounts or listings that violate these terms or our community standards may be removed,
        suspended, or moderated without prior notice, at our discretion.
      </p>

      <h2>8. Governing law</h2>
      <p>These terms are governed by the laws of India.</p>

      <h2>9. Community</h2>
      <p>
        Hostely aims to build a campus-driven ecosystem focused on affordability and sustainability—
        reducing waste, promoting reuse, and helping students save money. Thank you for being part
        of it.
      </p>
    </PolicyPage>
  );
}
