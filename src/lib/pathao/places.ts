import { connectMongoose } from "@/lib/db";
import { PathaoListModel, type PathaoPlace } from "@/lib/models/PathaoList";
import { dataOf, pathaoRequest } from "@/lib/pathao/client";
import { pathaoConfig } from "@/lib/pathao/config";

export type { PathaoPlace } from "@/lib/models/PathaoList";

// Pathao rarely changes its lists; a week old copy is fresh enough.
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function readItems(rows: unknown, idKey: string, nameKey: string): PathaoPlace[] {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row: Record<string, unknown>) => ({ id: Number(row[idKey]), name: String(row[nameKey] ?? "").trim() }))
    .filter((item) => Number.isInteger(item.id) && item.id > 0 && item.name !== "")
    .sort((a, b) => a.name.localeCompare(b.name));
}

// The cached list, fetched again when it is old; an old copy is kept if Pathao cannot be reached.
async function cachedList(name: string, path: string, idKey: string, nameKey: string): Promise<PathaoPlace[]> {
  const config = pathaoConfig();
  if (!config) return [];
  await connectMongoose();
  const key = `${config.baseUrl}|${name}`;
  const saved = await PathaoListModel.findOne({ key }).lean();
  if (saved && Date.now() - saved.fetchedAt.getTime() < MAX_AGE_MS) return saved.items;

  try {
    const response = await pathaoRequest(path);
    const items = response.status === 200 ? readItems(dataOf(response).data, idKey, nameKey) : [];
    if (items.length === 0) return saved?.items ?? [];
    await PathaoListModel.updateOne({ key }, { $set: { items, fetchedAt: new Date() } }, { upsert: true });
    return items;
  } catch {
    return saved?.items ?? [];
  }
}

export const getPathaoCities = () => cachedList("cities", "/aladdin/api/v1/city-list", "city_id", "city_name");

export const getPathaoZones = (cityId: number) =>
  cachedList(`zones:${cityId}`, `/aladdin/api/v1/cities/${cityId}/zone-list`, "zone_id", "zone_name");

export const getPathaoAreas = (zoneId: number) =>
  cachedList(`areas:${zoneId}`, `/aladdin/api/v1/zones/${zoneId}/area-list`, "area_id", "area_name");
