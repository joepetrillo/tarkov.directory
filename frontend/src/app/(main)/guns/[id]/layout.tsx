import { getGun } from "@/data/guns";
import { toTitleCase } from "@/lib/utils";
import { Heading } from "@radix-ui/themes";

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { gun } = await getGun(params.id);

  return (
    <div>
      <Heading as="h3" size="5" mb="4" className="text-balance">
        {toTitleCase(gun.name)}
      </Heading>
      {props.children}
    </div>
  );
}
