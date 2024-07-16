import { ModdingAction, ModItem } from "@/types";
import Image from "next/image";
import { Dispatch } from "react";

export default function ModItemIcon({
  dispatch,
  slotNameId,
  item,
}: {
  dispatch: Dispatch<ModdingAction>;
  slotNameId: string;
  item: ModItem;
}) {
  return (
    <div
      className="relative select-none border border-eft-white/30 bg-gradient-to-b from-stone-900 hover:cursor-pointer"
      onClick={() => {
        dispatch({
          type: "removed_item",
          nameId: slotNameId,
        });
        dispatch({
          type: "added_item",
          nameId: slotNameId,
          item,
        });
      }}
    >
      <div className="absolute bottom-0 left-0 right-0 top-0">
        <span className="line-clamp-1 text-right text-[11px]">
          {item.shortName}
        </span>
      </div>
      <Image width={60} height={60} src={item.iconLink} alt={item.name} />
    </div>
  );
}
