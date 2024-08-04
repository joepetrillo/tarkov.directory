import Image from "next/image";
import { Text } from "@radix-ui/themes";

export function ModIcon({
  iconImageUrl,
  shortName,
  showShortName = true,
}: {
  iconImageUrl: string | null;
  shortName: string;
  showShortName?: boolean;
}) {
  return (
    <div className="relative h-[56px] w-[56px] shrink-0 overflow-hidden border border-gray-6 bg-gradient-to-b from-accent-3 font-bold">
      {showShortName && (
        <div className="absolute right-0 top-0 max-w-full bg-gray-1 px-[1px]">
          <Text className="block truncate text-right text-[11px]">
            {shortName}
          </Text>
        </div>
      )}
      {iconImageUrl && (
        <Image
          width={56}
          height={56}
          src={iconImageUrl}
          alt={shortName}
          unoptimized={true}
        />
      )}
    </div>
  );
}
