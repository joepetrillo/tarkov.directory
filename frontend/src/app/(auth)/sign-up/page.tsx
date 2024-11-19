import SignUp from "@/components/forms/auth/sign-up";
import { getCurrentSession } from "@/data/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const { session } = await getCurrentSession();

  if (session) {
    redirect("/guns");
  }

  return <SignUp />;
}
