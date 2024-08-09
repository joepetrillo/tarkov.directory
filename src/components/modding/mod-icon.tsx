import Image from "next/image";
import { Text } from "@radix-ui/themes";

export function ModIcon({
  iconImageUrl,
  shortName,
  showShortName = true,
  size = 60,
}: {
  iconImageUrl: string | null;
  shortName: string;
  showShortName?: boolean;
  size?: number;
}) {
  return (
    <div
      className="relative shrink-0 overflow-hidden border border-gray-6 bg-gradient-to-b from-accent-3 font-bold"
      style={{
        height: `${size}px`,
        width: `${size}px`,
      }}
    >
      {showShortName && (
        <div className="absolute right-0 top-0 max-w-full bg-gray-1 px-[1px]">
          <Text className="block truncate text-right text-[11px]">
            {shortName}
          </Text>
        </div>
      )}
      {iconImageUrl && (
        <Image
          width={size}
          height={size}
          src={iconImageUrl}
          alt={shortName}
          unoptimized={true}
        />
      )}
    </div>
  );
}
