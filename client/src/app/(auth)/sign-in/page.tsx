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
        <p className="text-center text-sm text-muted-foreground">
          New to Hostely?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
