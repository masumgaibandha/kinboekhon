import type { PathaoPlace } from "@/lib/models/PathaoList";

// Pathao uses older spellings for some districts.
const ALIASES: Record<string, string> = {
  barishal: "barisal",
  brahmanbaria: "bbaria",
  bogura: "bogra",
  chattogram: "chittagong",
  comilla: "cumilla",
  jessore: "jashore",
  jhalokati: "jhalokathi",
  jhenaidah: "jhenidah",
  munshiganj: "munsiganj",
  narsingdi: "narshingdi",
  netrokona: "netrakona",
};

// Lowercase letters only, double letters made single and common spelling swaps evened out.
function normalize(name: string): string {
  const letters = name.toLowerCase().replace(/[^a-z]/g, "");
  const plain = (ALIASES[letters] ?? letters)
    .replace(/(.)\1+/g, "$1")
    .replace(/gonj/g, "ganj")
    .replace(/ee/g, "i")
    .replace(/oo/g, "u")
    .replace(/w/g, "o")
    .replace(/h/g, "");
  return plain;
}

function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    previous = current;
  }
  return previous[b.length];
}

const stripSadar = (name: string) => name.replace(/sadar$/, "");

// The place whose name is the same as ours, allowing small spelling differences; null when none is close.
export function matchPlace(name: string, places: PathaoPlace[]): PathaoPlace | null {
  const target = normalize(name);
  if (!target) return null;
  let best: { place: PathaoPlace; distance: number } | null = null;
  for (const place of places) {
    const candidate = normalize(place.name);
    const distance = Math.min(editDistance(target, candidate), editDistance(stripSadar(target), stripSadar(candidate)) + 1);
    if (!best || distance < best.distance) best = { place, distance };
  }
  if (!best) return null;
  // One typo per five letters at most.
  return best.distance <= Math.floor(target.length / 5) ? best.place : null;
}
