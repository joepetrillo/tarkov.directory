import Link from "@/components/ui/link";

// This page will probably be dynamic in the future and will need to fetch user specific data.
export default async function Page({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-4">
      <Link href="/">Go Home</Link>
      <Link href={`/guns/${params.id}/modding`}>Start Modding</Link>
    </div>
  );
}
