import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export const metadata = {
  title: "Sign in — Hostely",
};

export default function SignInPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Verify with your email, roll number, department, and hostel.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SignInForm />
        <p className="text-muted-foreground text-center text-xs">
          <Link href="/terms-and-conditions" className="underline-offset-4 hover:underline">
            Terms
          </Link>
          {" · "}
          <Link href="/privacy-policy" className="underline-offset-4 hover:underline">
            Privacy
          </Link>
        </p>
        <p className="text-muted-foreground text-center text-sm">
          New to Hostely?{" "}
          <Link
            href="/sign-up"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
