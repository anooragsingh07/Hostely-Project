import type { Metadata } from "next";
import { PolicyPage } from "@/components/policies/policy-page";

export const metadata: Metadata = {
  title: "Privacy Policy — Hostely",
  description: "How Hostely collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage title="Privacy Policy">
      <p>
        This policy describes how Hostely (&quot;we&quot;, &quot;us&quot;) handles personal
        information when you use our campus marketplace.
      </p>

      <h2>1. Data we collect</h2>
      <p>
        We may collect information you provide when you register or use the platform, including:
      </p>
      <ul>
        <li>Name</li>
        <li>Email address (typically your college email)</li>
        <li>Roll number, department, and hostel (for verification and discovery)</li>
        <li>Profile and listing content you choose to submit</li>
        <li>Messages you send through in-app chat (to deliver the service)</li>
      </ul>

      <h2>2. How we use data</h2>
      <p>
        We use this information to operate Hostely: account creation, authentication, showing
        listings, enabling communication between buyers and sellers, safety and moderation, and
        improving the product. We do not sell your personal data to third parties for their
        marketing.
      </p>

      <h2>3. Data security</h2>
      <p>
        We implement reasonable technical and organizational measures to protect your information.
        No method of transmission or storage is 100% secure; we cannot guarantee absolute security.
      </p>

      <h2>4. Data sharing</h2>
      <p>
        We do not sell your personal information. We may share data with service providers who help
        us run the platform (e.g. hosting), subject to confidentiality obligations, or when required
        by law.
      </p>

      <h2>5. Your rights</h2>
      <p>
        Depending on applicable law, you may request access, correction, or deletion of your
        personal data. Contact us through the support channels we provide so we can verify your
        request and respond appropriately.
      </p>

      <h2>6. Changes</h2>
      <p>
        We may update this policy from time to time. Continued use of Hostely after changes means
        you accept the updated policy.
      </p>
    </PolicyPage>
  );
}
