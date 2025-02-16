import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export async function storeFinalJSONSession(uuid: string, data: object) {
  await redis.set(uuid, JSON.stringify(data), "EX", 3600); // 1-hour expiry
}

export async function getStoredData(uuid: string): Promise<string | null> {
  return await redis.get(uuid);
}

export async function deleteStoredData(uuid: string) {
  await redis.del(uuid);
}
