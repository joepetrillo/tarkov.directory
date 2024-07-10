import React from "react";
import Image from "next/image";
import { toTitleCase } from "@/lib/utils";
import { request } from "graphql-request";
import { TARKOV_API_URL } from "@/lib/constants";
import { getAllGunsQuery } from "@/graphql/queries";
import { mapAllGunsToCategories } from "@/lib/data-mapping";

export async function GunList() {
  const data = await request(TARKOV_API_URL, getAllGunsQuery);
  const categorizedData = mapAllGunsToCategories(data);

  return (
    <div className="flex flex-col gap-12">
      {categorizedData.map(({ categoryName, items }) => {
        return (
          <div key={categoryName}>
            <h2 className="mb-4 text-2xl">
              {toTitleCase(categoryName)} - ({items.length})
            </h2>
            <div className="xs:grid-cols-2 grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {items.map((gun) => {
                return (
                  <div
                    key={gun.id}
                    className="group flex h-[110px] flex-col items-center justify-center gap-2 border border-eft-tan/30 p-2 hover:bg-stone-900/60"
                  >
                    <p className="text-center group-hover:underline">
                      {gun.shortName}
                    </p>
                    {gun.defaultPresetImageUrl && (
                      <div className="relative h-[50px] w-full max-w-[150px]">
                        <Image
                          src={gun.defaultPresetImageUrl}
                          alt={gun.name}
                          sizes="150px"
                          className="object-contain"
                          fill={true}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
