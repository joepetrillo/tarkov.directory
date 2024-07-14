import Link from "next/link";

export default async function Page() {
  return (
    <div>
      <p>Welcome!</p>
      <Link href="/guns" className="inline-block py-4 underline">
        Go to guns page
      </Link>
    </div>
  );
}
