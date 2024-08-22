import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { processAllGunsAndMods } from "@/lib/data-mapping";
import request from "graphql-request";
import { TARKOV_API_URL } from "@/lib/constants";
import { GetAllGunsAndMods } from "@/graphql/queries";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

const redis = Redis.fromEnv();

async function handler() {
  try {
    // Fetch the latest gun and mod data
    const data = await request(TARKOV_API_URL, GetAllGunsAndMods);
    const { allGuns, allMods, gunsByCategory } = processAllGunsAndMods(data);

    // Update Redis with the new data
    await redis.set("allGuns", JSON.stringify(allGuns));
    await redis.set("allMods", JSON.stringify(allMods));
    await redis.set("gunsByCategory", JSON.stringify(gunsByCategory));

    return NextResponse.json(
      { success: true, message: "Redis updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating Redis:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update Redis" },
      { status: 500 },
    );
  }
}

export const POST = verifySignatureAppRouter(handler);
