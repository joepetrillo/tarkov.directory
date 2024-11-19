import VerifyEmail from "@/components/forms/auth/verify-email";
import { getCurrentSession } from "@/data/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const { session, user } = await getCurrentSession();

  // need to be logged in to verify email
  if (!session) {
    redirect("/sign-in");
  }

  // already verified
  if (user.emailVerified) {
    redirect("/guns");
  }

  return <VerifyEmail />;
}
