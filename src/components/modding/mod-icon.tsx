import Image from "next/image";
import { Text } from "@radix-ui/themes";

export function ModIcon({
  iconImageUrl,
  shortName,
}: {
  iconImageUrl: string | null;
  shortName: string;
}) {
  return (
    <div className="relative h-[55px] w-[55px] shrink-0 overflow-hidden border border-gray-6 bg-gradient-to-b from-accent-3">
      <div className="absolute right-0 top-0">
        <Text className="line-clamp-1 text-right text-[11px]">{shortName}</Text>
      </div>
      {iconImageUrl && (
        <Image width={55} height={55} src={iconImageUrl} alt={shortName} />
      )}
    </div>
  );
}
