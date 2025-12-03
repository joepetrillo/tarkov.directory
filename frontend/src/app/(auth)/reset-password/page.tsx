import SendResetPassword from "@/components/forms/auth/send-reset-password";
import { getCurrentSession } from "@/data/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const { session } = await getCurrentSession();

  // the reset password flow is for users that are not signed in
  if (session) {
    redirect("/guns");
  }

  return <SendResetPassword />;
}
