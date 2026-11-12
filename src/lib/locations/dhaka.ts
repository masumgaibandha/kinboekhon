// Inside Dhaka the customer picks only the city corporation; the areas line helps them find theirs.
export const CITY_CORPORATIONS = [
  {
    id: "dncc",
    bn: "ঢাকা উত্তর সিটি কর্পোরেশন",
    en: "Dhaka North City Corporation",
    areas: "উত্তরা, মিরপুর, গুলশান, বনানী, বাড্ডা, মোহাম্মদপুর",
  },
  {
    id: "dscc",
    bn: "ঢাকা দক্ষিণ সিটি কর্পোরেশন",
    en: "Dhaka South City Corporation",
    areas: "ধানমন্ডি, মতিঝিল, পুরান ঢাকা, যাত্রাবাড়ী, লালবাগ, খিলগাঁও",
  },
] as const;

export type CityCorporationId = (typeof CITY_CORPORATIONS)[number]["id"];

export const DHAKA_DIVISION_ID = "6";
export const DHAKA_DISTRICT_ID = "47";
