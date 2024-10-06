import SignIn from "@/components/forms/auth/sign-in";
import { validateRequest } from "@/data/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const { session } = await validateRequest();

  if (session) {
    redirect("/");
  }

  return <SignIn />;
}
