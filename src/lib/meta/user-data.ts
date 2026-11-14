import { createHash } from "node:crypto";

import locationData from "@/data/bd-locations.json";
import type { LocationData } from "@/lib/locations/types";
import { toInternationalPhone } from "@/lib/phone";

const data = locationData as LocationData;

export interface CapiUserData {
  ph?: string[];
  external_id?: string[];
  fn?: string[];
  ln?: string[];
  ct?: string[];
  country: string[];
  client_ip_address?: string;
  client_user_agent?: string;
  fbp?: string;
  fbc?: string;
}

// What the browser request tells us; cookies are sent as they are, not hashed.
export interface BrowserFacts {
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
}

export interface CustomerFacts {
  name: string;
  phone: string;
  districtId: string;
}

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

function districtEnglishName(districtId: string): string | undefined {
  for (const division of data.divisions) {
    const district = division.districts.find((item) => item.id === districtId);
    if (district) return district.en;
  }
  return undefined;
}

export function browserUserData(facts: BrowserFacts): CapiUserData {
  return {
    country: [sha256("bd")],
    client_ip_address: facts.ip && facts.ip !== "unknown" ? facts.ip : undefined,
    client_user_agent: facts.userAgent || undefined,
    fbp: facts.fbp,
    fbc: facts.fbc,
  };
}

// Meta's normal form before hashing: lowercase, no punctuation, phone with country code.
export function customerUserData(customer: CustomerFacts, facts: BrowserFacts): CapiUserData {
  const phone = sha256(toInternationalPhone(customer.phone));
  const words = customer.name.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\s]/gu, "").split(/\s+/).filter(Boolean);
  const city = districtEnglishName(customer.districtId)?.toLowerCase().replace(/[^a-z]/g, "");
  return {
    ...browserUserData(facts),
    ph: [phone],
    external_id: [phone],
    fn: words[0] ? [sha256(words[0])] : undefined,
    ln: words.length > 1 ? [sha256(words[words.length - 1])] : undefined,
    ct: city ? [sha256(city)] : undefined,
  };
}
