// Demo shop data for testing in the dev database. Every record is saved with isDemo: true.

export const DEMO_CATEGORIES = [
  { key: "kitchen", name: "রান্নাঘরের পণ্য", slug: "demo-kitchen", color: "#F85606" },
  { key: "gadgets", name: "গ্যাজেট", slug: "demo-gadgets", color: "#B33F00" },
  { key: "home", name: "ঘর ও সাজসজ্জা", slug: "demo-home-decor", color: "#2B2B2B" },
] as const;

export type DemoCategoryKey = (typeof DEMO_CATEGORIES)[number]["key"];

interface DemoProduct {
  name: string;
  slug: string;
  price: number;
  category: DemoCategoryKey;
  popular: boolean;
  description: string;
}

export const DEMO_PRODUCTS: DemoProduct[] = [
  { name: "ডেমো সবজি কাটার চপার", slug: "demo-vegetable-chopper", price: 890, category: "kitchen", popular: true, description: "দড়ি টানলেই পেঁয়াজ, রসুন, মরিচ কুচি। এটি একটি ডেমো পণ্য।" },
  { name: "ডেমো স্টিলের পানির বোতল", slug: "demo-steel-bottle", price: 550, category: "kitchen", popular: false, description: "গরম ও ঠান্ডা ধরে রাখে। এটি একটি ডেমো পণ্য।" },
  { name: "ডেমো সিলিকন রান্নার সেট", slug: "demo-silicone-set", price: 1290, category: "kitchen", popular: true, description: "নন-স্টিক পাত্রে নিরাপদ। এটি একটি ডেমো পণ্য।" },
  { name: "ডেমো মিনি পোর্টেবল ফ্যান", slug: "demo-mini-fan", price: 690, category: "gadgets", popular: true, description: "চার্জে চলে, পকেটে রাখা যায়। এটি একটি ডেমো পণ্য।" },
  { name: "ডেমো ওয়্যারলেস ইয়ারবাড", slug: "demo-earbuds", price: 1490, category: "gadgets", popular: true, description: "পরিষ্কার শব্দ, লম্বা ব্যাটারি। এটি একটি ডেমো পণ্য।" },
  { name: "ডেমো এলইডি টেবিল ল্যাম্প", slug: "demo-led-lamp", price: 790, category: "gadgets", popular: false, description: "তিন রকম আলো, চোখে আরাম। এটি একটি ডেমো পণ্য।" },
  { name: "ডেমো ওয়াল স্টিকার সেট", slug: "demo-wall-sticker", price: 350, category: "home", popular: false, description: "দেয়ালে লাগান, দাগ পড়ে না। এটি একটি ডেমো পণ্য।" },
  { name: "ডেমো ফোল্ডিং স্টোরেজ বক্স", slug: "demo-storage-box", price: 450, category: "home", popular: false, description: "ভাঁজ করে রাখা যায়, জায়গা বাঁচায়। এটি একটি ডেমো পণ্য।" },
];

export const DEMO_BANNERS = [
  { key: "banner-1", title: "ডেমো ব্যানার: রান্নাঘরের পণ্যে অফার", link: "/c/demo-kitchen", color: "#F85606", label: "DEMO BANNER 1", sub: "Kitchen offer" },
  { key: "banner-2", title: "ডেমো ব্যানার: নতুন গ্যাজেট", link: "/c/demo-gadgets", color: "#B33F00", label: "DEMO BANNER 2", sub: "New gadgets" },
];
