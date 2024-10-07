import { validateRequest } from "@/data/auth";
import { IdCardIcon } from "@radix-ui/react-icons";
import { Callout } from "@radix-ui/themes";
import Link from "next/link";

export default async function VerifyEmailAlertAsync() {
  const { user } = await validateRequest();

  if (!user || user.emailVerified) {
    return null;
  }

  return (
    <Callout.Root variant="surface" color="blue" size={"1"} className="mt-5">
      <Callout.Icon>
        <IdCardIcon />
      </Callout.Icon>
      <Callout.Text>
        Please verify your email address to access all features.{" "}
        <Link href="/verify-email" className="text-nowrap underline">
          Verify Email
        </Link>
      </Callout.Text>
    </Callout.Root>
  );
}
