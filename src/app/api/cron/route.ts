import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { processAllGunsAndMods } from "@/lib/data-mapping";
import request from "graphql-request";
import { TARKOV_API_URL } from "@/lib/constants";
import { GetAllGunsAndMods } from "@/graphql/queries";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

const redis = Redis.fromEnv();
const MAX_CHUNK_SIZE = 1024 * 1024; // 1MB

async function appendDataInChunks(key: string, data: string) {
  await redis.del(key); // Clear existing data
  const chunks = [];
  for (let i = 0; i < data.length; i += MAX_CHUNK_SIZE) {
    chunks.push(data.slice(i, i + MAX_CHUNK_SIZE));
  }

  for (const chunk of chunks) {
    await redis.append(key, chunk);
  }
}

async function handler() {
  try {
    // Fetch the latest gun and mod data
    const data = await request(TARKOV_API_URL, GetAllGunsAndMods);
    const { allGuns, allMods, gunsByCategory } = processAllGunsAndMods(data);

    // Update Redis with the new data in chunks
    await appendDataInChunks("allGuns", JSON.stringify(allGuns));
    await appendDataInChunks("allMods", JSON.stringify(allMods));
    await appendDataInChunks("gunsByCategory", JSON.stringify(gunsByCategory));

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
