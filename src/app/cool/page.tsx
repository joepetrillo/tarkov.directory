import Link from "next/link";

export default function Cool() {
  return (
    <>
      <Link href="/" className="mb-10 inline-block underline">
        Go back home
      </Link>
      <p>You are now on the cool page!</p>
    </>
  );
}
