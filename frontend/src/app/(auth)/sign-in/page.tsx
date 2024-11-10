import SignIn from "@/components/forms/auth/sign-in";
import { getCurrentSession } from "@/data/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const { session } = await getCurrentSession();

  if (session) {
    redirect("/");
  }

  return <SignIn />;
}
