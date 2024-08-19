import Image from "next/image";
import { Text } from "@radix-ui/themes";

type ModIconProps = {
  iconImageUrl: string | null;
  shortName: string;
  showShortName?: boolean;
  size?: number;
};

export default function ModIcon({
  iconImageUrl,
  shortName,
  showShortName = true,
  size = 60,
}: ModIconProps) {
  return (
    <div
      className="relative shrink-0 overflow-hidden border border-gray-6 bg-gradient-to-b from-accent-3 font-bold"
      style={{
        height: size,
        width: size,
      }}
    >
      {showShortName && <ShortNameLabel shortName={shortName} />}
      {iconImageUrl && (
        <ModImage src={iconImageUrl} alt={shortName} size={size} />
      )}
    </div>
  );
}

function ShortNameLabel({ shortName }: { shortName: string }) {
  return (
    <div className="absolute right-0 top-0 max-w-full bg-gray-1 px-[1px]">
      <Text className="block truncate text-right text-[11px]">{shortName}</Text>
    </div>
  );
}

function ModImage({
  src,
  alt,
  size,
}: {
  src: string;
  alt: string;
  size: number;
}) {
  return (
    <Image width={size} height={size} src={src} alt={alt} unoptimized={true} />
  );
}
