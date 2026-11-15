// Demo shop data for testing in the dev database. Every record is saved with isDemo: true.
// Each product's folder in public/demo-products holds its photos and is also its slug.

export const DEMO_CATEGORIES = [
  { key: "educational", name: "শিক্ষামূলক খেলনা", slug: "educational-toys" },
  { key: "montessori", name: "মন্টেসরি ও সেন্সরি", slug: "montessori-sensory" },
  { key: "math", name: "গণিত ও সংখ্যা শেখা", slug: "math-learning" },
  { key: "outdoor", name: "বাইরের খেলা", slug: "outdoor-play" },
] as const;

export type DemoCategoryKey = (typeof DEMO_CATEGORIES)[number]["key"];

interface DemoProduct {
  folder: string;
  name: string;
  price: number;
  category: DemoCategoryKey;
  popular: boolean;
  description: string;
}

export const DEMO_WEIGHT_GRAMS = 400;

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    folder: "toddler-montessori-busy-book-and-travel-bag",
    name: "শিশুদের মন্টেসরি বিজি বুক ও ট্রাভেল ব্যাগ",
    price: 1290,
    category: "montessori",
    popular: true,
    description: "বোতাম লাগানো, চেইন টানা, ফিতা বাঁধা শেখার নরম কাপড়ের বই। সাথে ভ্রমণের ব্যাগ।",
  },
  {
    folder: "7-in-1-wooden-montessori-learning-board",
    name: "7 ইন 1 কাঠের মন্টেসরি লার্নিং বোর্ড",
    price: 1490,
    category: "montessori",
    popular: true,
    description: "এক বোর্ডেই 7 রকম শেখার খেলা। মনোযোগ আর হাতের দক্ষতা বাড়ায়।",
  },
  {
    folder: "interactive-rc-ejection-battle-cars",
    name: "রিমোট কন্ট্রোল ব্যাটল কার জোড়া",
    price: 1390,
    category: "outdoor",
    popular: true,
    description: "দুই জনে রিমোট দিয়ে লড়াই। জোরে ধাক্কা লাগলেই চালক ছিটকে বেরিয়ে আসে।",
  },
  {
    folder: "rainbow-wooden-abacus-and-counting-stacker",
    name: "রংধনু কাঠের অ্যাবাকাস ও কাউন্টিং স্ট্যাকার",
    price: 990,
    category: "math",
    popular: true,
    description: "রঙিন রিং সাজিয়ে সাজিয়ে গোনা আর রং চেনা শেখে শিশু।",
  },
  {
    folder: "10-row-wooden-abacus-and-math-learning-frame",
    name: "10 সারির কাঠের অ্যাবাকাস ও গণিত শেখার ফ্রেম",
    price: 890,
    category: "math",
    popular: false,
    description: "পুঁতি সরিয়ে সরিয়ে যোগ-বিয়োগ শেখা। মজবুত কাঠ, রঙিন পুঁতি।",
  },
  {
    folder: "smart-chopstick-and-clip-bead-math-set",
    name: "চপস্টিক ও ক্লিপে পুঁতি তোলার গণিত সেট",
    price: 1090,
    category: "math",
    popular: false,
    description: "চপস্টিক বা ক্লিপে পুঁতি তুলে গোনা শেখা। আঙুলের নিয়ন্ত্রণ বাড়ায়।",
  },
  {
    folder: "wooden-counting-sticks-and-number-cards-set",
    name: "কাঠের কাউন্টিং স্টিক ও সংখ্যা কার্ড সেট",
    price: 850,
    category: "math",
    popular: false,
    description: "রঙিন কাঠি আর সংখ্যা কার্ডে গোনা ও যোগ-বিয়োগ শেখা।",
  },
  {
    folder: "3-in-1-wooden-shape-number-and-symbol-puzzle-board",
    name: "3 ইন 1 কাঠের আকৃতি, সংখ্যা ও চিহ্নের পাজল বোর্ড",
    price: 790,
    category: "educational",
    popular: false,
    description: "আকৃতি, সংখ্যা আর গণিতের চিহ্ন চিনতে শেখায়। হাত ও চোখের মিল বাড়ায়।",
  },
  {
    folder: "greedy-caterpillar-wooden-lacing-and-threading-toy",
    name: "ক্ষুধার্ত শুঁয়োপোকা কাঠের লেসিং খেলনা",
    price: 790,
    category: "educational",
    popular: false,
    description: "ফল আর পাতার ফুটো দিয়ে শুঁয়োপোকা পার করার মজার খেলা।",
  },
  {
    folder: "wooden-shape-threading-and-lacing-beads-set",
    name: "কাঠের আকৃতির পুঁতি ও লেসিং সেট",
    price: 890,
    category: "montessori",
    popular: false,
    description: "রঙিন কাঠের পুঁতি সুতায় পরিয়ে আকৃতি আর রং চেনা।",
  },
  {
    folder: "kids-explorer-binoculars-outdoor-nature",
    name: "শিশুদের এক্সপ্লোরার বাইনোকুলার",
    price: 790,
    category: "outdoor",
    popular: false,
    description: "পাখি, গাছপালা আর প্রকৃতি কাছ থেকে দেখার জন্য। হালকা, শিশুর হাতের মাপে।",
  },
];

export const DEMO_BANNERS = [
  { key: "banner-1", title: "ডেমো ব্যানার: মন্টেসরি খেলনা", link: "/c/montessori-sensory", color: "#F85606", label: "DEMO BANNER 1", sub: "Montessori toys" },
  { key: "banner-2", title: "ডেমো ব্যানার: গণিত শেখার খেলনা", link: "/c/math-learning", color: "#B33F00", label: "DEMO BANNER 2", sub: "Math learning" },
];
