import { env } from "@/env.mjs";
import { Redis } from "@upstash/redis";
import { gzip, ungzip } from "node-gzip";

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// Utility function to set compressed data
export async function setCompressed(
  key: string,
  data: any,
  options?: { ex?: number }
) {
  const compressed = await gzip(JSON.stringify(data));
  return redis.set(
    key,
    compressed,
    options?.ex ? { ex: options.ex } : undefined
  );
}

// Utility function to get and decompress data
export async function getCompressed(key: string) {
  try {
    // Get data from Redis (explicitly type it as Buffer | string | null)
    const compressed = await redis.get<Buffer | string | null>(key);

    // If nothing found, return null
    if (!compressed) {
      return null;
    }

    // Ensure we have a Buffer for ungzip
    const compressedBuffer = Buffer.isBuffer(compressed)
      ? compressed
      : Buffer.from(compressed, "utf-8"); // Assume string is UTF-8 encoded

    // Decompress
    const decompressedBuffer = await ungzip(compressedBuffer);

    // Convert to string and parse JSON
    const decompressedString = decompressedBuffer.toString("utf-8");
    return JSON.parse(decompressedString);
  } catch (error) {
    console.error("Error in getCompressed:", error);

    // Try to delete the possibly corrupted entry
    try {
      await redis.del(key);
    } catch (delError) {
      console.error("Error deleting corrupted cache:", delError);
    }

    return null;
  }
}

// Your existing invalidation functions
export async function invalidateUserChatListCache(userId: string) {
  const keys = await redis.keys(`chats:${userId}:*`);

  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

export async function invalidateChatMessagesCache(
  userId: string,
  chatId: string
) {
  await redis.del(`user:${userId}:chat:${chatId}:messages`);
}

export async function invalidateAllUserChatCaches(userId: string) {
  const listKeys = await redis.keys(`chats:${userId}:*`);
  const messageKeys = await redis.keys(`user:${userId}:chat:*:messages`);

  const allKeys = [...listKeys, ...messageKeys];

  if (allKeys.length > 0) {
    await redis.del(...allKeys);
  }
}
