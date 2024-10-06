import VerifyEmail from "@/components/forms/verify-email";
import { validateRequest } from "@/data/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const { session, user } = await validateRequest();

  // need to be logged in to verify email
  if (!session) {
    // TODO - add redirect url query param so users will come back here after sign in
    redirect("/sign-in");
  }

  // already verified
  if (user.emailVerified) {
    redirect("/");
  }

  return <VerifyEmail />;
}
