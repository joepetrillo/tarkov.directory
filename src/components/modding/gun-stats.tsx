import { Card, DataList, Heading } from "@radix-ui/themes";

export default function GunStats({
  recoilVertical,
  recoilHorizontal,
  ergonomics,
}: {
  recoilVertical: number;
  recoilHorizontal: number;
  ergonomics: number;
}) {
  return (
    <Card variant="classic" className="max-w-max" size={"3"}>
      <Heading size="2" mb={"4"} as="h4">
        Gun Stats
      </Heading>
      <DataList.Root>
        <DataList.Item align="center">
          <DataList.Label minWidth="110px">Ergonomics</DataList.Label>
          <DataList.Value className="font-mono">{ergonomics}</DataList.Value>
        </DataList.Item>
        <DataList.Item align="center">
          <DataList.Label minWidth="110px">Vertical Recoil</DataList.Label>
          <DataList.Value className="font-mono">
            {recoilVertical}
          </DataList.Value>
        </DataList.Item>
        <DataList.Item align="center">
          <DataList.Label minWidth="110px">Horizontal Recoil</DataList.Label>
          <DataList.Value className="font-mono">
            {recoilHorizontal}
          </DataList.Value>
        </DataList.Item>
      </DataList.Root>
    </Card>
  );
}
