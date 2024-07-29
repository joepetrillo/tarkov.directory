import Image from "next/image";
import { Text } from "@radix-ui/themes";

export default function ModItemIcon({
  iconImageUrl,
  shortName,
}: {
  iconImageUrl: string | null;
  shortName: string;
}) {
  return (
    <div className="from-stone-900 relative h-[50px] w-[50px] border border-eft-white/30 bg-gradient-to-b">
      <div className="absolute right-0 top-0">
        <Text className="line-clamp-1 text-right text-[11px]">{shortName}</Text>
      </div>
      {iconImageUrl && (
        <Image width={50} height={50} src={iconImageUrl} alt={shortName} />
      )}
    </div>
  );
}
