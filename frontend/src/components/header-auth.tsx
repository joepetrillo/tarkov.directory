import { Button } from "@radix-ui/themes";
import Link from "next/link";

export default function HeaderAuth() {
  return (
    <Button variant="soft" asChild>
      <Link href="/sign-in">Sign In</Link>
    </Button>
  );
}

// if (!isSignedIn) {
//   return (
//     <Button variant="soft" asChild>
//       <Link href="/sign-in">Sign In</Link>
//     </Button>
//   );
// }

// return (
//   <div className="h-10 w-10">
//     <UserButton
//       appearance={{
//         elements: {
//           avatarBox: { height: "40px", width: "40px" },
//         },
//       }}
//     />
//   </div>
// );
