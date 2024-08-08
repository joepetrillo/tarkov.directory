import Image from "next/image";
import { Text } from "@radix-ui/themes";

export function ModIcon({
  iconImageUrl,
  shortName,
  showShortName = true,
  className,
  size = 56,
}: {
  iconImageUrl: string | null;
  shortName: string;
  showShortName?: boolean;
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`${className ? className : ""} relative h-[${size}px] w-[${size}px] shrink-0 overflow-hidden border border-gray-6 bg-gradient-to-b from-accent-3 font-bold`}
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
