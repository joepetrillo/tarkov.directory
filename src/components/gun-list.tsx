"use client";

import React from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getAllGuns } from "@/utils/query-options";
import Image from "next/image";

export function GunList() {
  const { data, error } = useSuspenseQuery(getAllGuns);

  if (error) {
    return <p>There was an error fetching data</p>;
  }

  return (
    <div className="xs:grid-cols-3 grid grid-cols-1 gap-4 md:grid-cols-4">
      {data.items.map((gun) => {
        if (!gun) return null;
        return (
          <div
            key={gun.id}
            className="flex h-[175px] flex-col items-center justify-center gap-4 border border-eft-tan/50 p-6 hover:bg-stone-900"
          >
            <p>{gun.shortName}</p>
            {gun.properties?.__typename === "ItemPropertiesWeapon" &&
              gun.properties.defaultPreset?.baseImageLink && (
                <Image
                  src={gun.properties.defaultPreset?.baseImageLink}
                  alt=""
                  width={125}
                  height={50}
                />
              )}
          </div>
        );
      })}
    </div>
  );
}
