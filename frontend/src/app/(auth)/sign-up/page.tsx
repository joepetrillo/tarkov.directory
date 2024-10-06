import SignUp from "@/components/forms/auth/sign-up";
import { validateRequest } from "@/data/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const { session } = await validateRequest();

  if (session) {
    redirect("/");
  }

  return <SignUp />;
}
