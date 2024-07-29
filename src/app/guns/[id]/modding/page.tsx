import ModItemIcon from "@/components/modding/mod-item-icon";
import { getFullGunData } from "@/lib/data-layer";
import { FullSlot } from "@/types";
import {
  Dialog,
  Flex,
  Table,
  ScrollArea,
  Inset,
  Button,
  Heading,
} from "@radix-ui/themes";

export default async function Page({ params }: { params: { id: string } }) {
  const fullGunData = await getFullGunData(params.id);

  return (
    <div>
      <Heading size={"4"}>{fullGunData.name}</Heading>
      <Flex wrap="wrap" gap="4" mt={"4"}>
        {fullGunData.slots.map((slot) => (
          <SlotBox key={slot.id} slot={slot} />
        ))}
      </Flex>
    </div>
  );
}

function SlotBox({ slot }: { slot: FullSlot }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <div className="rounded hover:bg-gray-100 w-64 cursor-pointer border p-4">
          <h3 className="font-semibold">{slot.name}</h3>
          <p>Required: {slot.required ? "Yes" : "No"}</p>
          <p>Mods available: {slot.allowedMods.length}</p>
        </div>
      </Dialog.Trigger>

      <Dialog.Content size={"3"} className="max-w-screen-lg">
        <Dialog.Title>{slot.name}</Dialog.Title>
        <Inset side="x">
          <ScrollArea
            style={{ height: "max(calc(100dvh - 300px), 250px)" }}
            size={"2"}
          >
            <Table.Root variant="surface" size={"2"}>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Icon</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    Recoil Modifier
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    Ergonomics Modifier
                  </Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {slot.allowedMods.map((mod) => (
                  <Table.Row key={mod.id}>
                    <Table.Cell>
                      <ModItemIcon
                        shortName={mod.shortName}
                        iconImageUrl={mod.iconImageUrl}
                      />
                    </Table.Cell>
                    <Table.Cell>{mod.name}</Table.Cell>
                    <Table.Cell>{mod.recoilModifier}</Table.Cell>
                    <Table.Cell>{mod.ergonomicsModifier}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </ScrollArea>
        </Inset>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="classic">Close</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
