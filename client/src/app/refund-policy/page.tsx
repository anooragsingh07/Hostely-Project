import type { Metadata } from "next";
import { PolicyPage } from "@/components/policies/policy-page";

export const metadata: Metadata = {
  title: "Refunds & Cancellation — Hostely",
  description: "Refund and cancellation information for Hostely.",
};

export default function RefundPolicyPage() {
  return (
    <PolicyPage title="Refunds and Cancellation Policy">
      <h2>Platform fees</h2>
      <p>
        Hostely does not charge listing or account fees for standard use. There is nothing to refund
        to Hostely for posting or browsing listings under the current free service.
      </p>

      <h2>User-to-user disputes</h2>
      <p>
        Hostely is a platform only. We do not process refunds for disagreements between buyers and
        sellers regarding items, payments between users, or meetups. Users are responsible for
        agreeing on terms between themselves.
      </p>

      <h2>Listings and cancellations</h2>
      <p>
        You may edit or remove your listings at any time. Because there is no platform posting fee
        today, removing a listing does not trigger a refund from Hostely.
      </p>
    </PolicyPage>
  );
}
