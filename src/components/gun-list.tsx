"use client";

import React from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getAllGuns } from "@/utils/query-options";
import Image from "next/image";
import { toTitleCase } from "@/utils/utils";

export function GunList() {
  const { data, error } = useSuspenseQuery(getAllGuns);

  // if (error) {
  //   return <p>There was an error fetching data</p>;
  // }

  return (
    <div className="flex flex-col gap-12">
      {data.map(({ categoryName, items }) => {
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
