// Builds src/data/bd-locations.json from the bangladesh-geocode JSON files (MIT, Nuhil Mehdy).
// Usage: npx tsx scripts/build-locations.ts <folder with divisions.json, districts.json, upazilas.json>
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { CMP_THANAS } from "./location-thanas";

interface SourceRow {
  id: string;
  name: string;
  bn_name: string;
  division_id?: string;
  district_id?: string;
}

interface Place {
  id: string;
  bn: string;
  en: string;
}

const sourceDir = process.argv[2];
if (!sourceDir) throw new Error("Pass the folder with the bangladesh-geocode JSON files.");

function readTable(file: string): SourceRow[] {
  const parts = JSON.parse(readFileSync(path.join(sourceDir, file), "utf8")) as { type: string; data?: SourceRow[] }[];
  const table = parts.find((part) => part.type === "table");
  if (!table?.data) throw new Error(`No table data in ${file}`);
  return table.data;
}

// Checked against bangladesh.gov.bd/views/upazila-list (November 2026): official spellings and one rename.
const UPAZILA_NAMES: Record<string, string> = {
  "11": "কুমিল্লা আদর্শ সদর",
  "301": "শান্তিগঞ্জ",
};
const UPAZILA_EN: Record<string, string> = { "11": "Cumilla Adarsha Sadar", "301": "Shantiganj" };
const SPELLINGS: Record<string, string> = {
  টুংগীপাড়া: "টুঙ্গিপাড়া",
  "মুন্সিগঞ্জ সদর": "মুন্সীগঞ্জ সদর",
  টংগীবাড়ি: "টংগিবাড়ী",
  ভুয়াপুর: "ভূঞাপুর",
  মোড়েলগঞ্জ: "মোরেলগঞ্জ",
  দিঘীনালা: "দীঘিনালা",
  পত্নিতলা: "পত্নীতলা",
  ভুরুঙ্গামারী: "ভূরুঙ্গামারী",
  তেতুলিয়া: "তেঁতুলিয়া",
  তালতলি: "তালতলী",
  দুমকি: "দুমকী",
};

// Upazilas on the national portal that the dataset does not have yet (dataset district ids).
const ADDED_UPAZILAS: (Place & { districtId: string })[] = [
  { id: "495", districtId: "7", bn: "চন্দ্রগঞ্জ", en: "Chandraganj" },
  { id: "496", districtId: "14", bn: "মোকামতলা", en: "Mokamtola" },
  { id: "497", districtId: "58", bn: "ভূল্লী", en: "Bhulli" },
  { id: "498", districtId: "58", bn: "রুহিয়া", en: "Ruhia" },
  { id: "499", districtId: "38", bn: "শায়েস্তাগঞ্জ", en: "Shayestaganj" },
  { id: "500", districtId: "62", bn: "দক্ষিণ গফরগাঁও", en: "South Gafargaon" },
];

const CITY_THANAS: Record<string, { label: string; prefix: string; thanas: Omit<Place, "id">[] }> = {
  "8": { label: "চট্টগ্রাম সিটির থানা", prefix: "cmp", thanas: CMP_THANAS },
};

const byBangla = (a: Place, b: Place) => a.bn.localeCompare(b.bn, "bn");
// NFC, so the same letter is always stored the same way (the sources mix two forms of ড় and য়).
const nfc = (text: string) => text.trim().normalize("NFC");
const place = (row: SourceRow): Place => ({ id: row.id, bn: nfc(row.bn_name), en: row.name.trim() });

const divisions = readTable("divisions.json");
const districts = readTable("districts.json");
const upazilas = readTable("upazilas.json");

const upazilaPlaces = [
  ...upazilas.map((row) => {
    const bn = UPAZILA_NAMES[row.id] ?? SPELLINGS[row.bn_name.trim()] ?? row.bn_name.trim();
    return { ...place(row), bn: nfc(bn), en: UPAZILA_EN[row.id] ?? row.name.trim(), districtId: row.district_id ?? "" };
  }),
  ...ADDED_UPAZILAS.map((upazila) => ({ ...upazila, bn: nfc(upazila.bn) })),
];

const tree = divisions.map((division) => ({
  ...place(division),
  districts: districts
    .filter((district) => district.division_id === division.id)
    .map((district) => {
      const city = CITY_THANAS[district.id];
      return {
        ...place(district),
        ...(city && {
          cityLabel: city.label,
          cityThanas: city.thanas
            .map((thana, index) => ({ id: `${city.prefix}-${String(index + 1).padStart(2, "0")}`, ...thana, bn: nfc(thana.bn) }))
            .sort(byBangla),
        }),
        upazilas: upazilaPlaces
          .filter((upazila) => upazila.districtId === district.id)
          .map(({ id, bn, en }) => ({ id, bn, en }))
          .sort(byBangla),
      };
    })
    .sort(byBangla),
}));
tree.sort(byBangla);

const out = path.join(process.cwd(), "src/data/bd-locations.json");
writeFileSync(out, `${JSON.stringify({ divisions: tree })}\n`);
const counts = tree.reduce(
  (sum, division) => {
    sum.districts += division.districts.length;
    for (const district of division.districts) {
      sum.upazilas += district.upazilas.length;
      sum.thanas += district.cityThanas?.length ?? 0;
    }
    return sum;
  },
  { divisions: tree.length, districts: 0, upazilas: 0, thanas: 0 },
);
console.log(`Wrote ${out}`, counts);
