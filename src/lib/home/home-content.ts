import { cacheLife, cacheTag } from "next/cache";

import { connectMongoose } from "@/lib/db";
import { HomeContentModel } from "@/lib/models/HomeContent";
import { pickImages } from "@/lib/product-images";
import { TRUST_ITEMS, type HomeContentValues } from "@/lib/validation/home-content";

export const HOME_TAG = "home";
export const HOME_KEY = "main";

// Used until the admin saves the home page for the first time.
export const DEFAULT_HOME_CONTENT: HomeContentValues = {
  trust: ["ক্যাশ অন ডেলিভারি", "সারা দেশে ডেলিভারি", "3 দিনে রিটার্ন", "WhatsApp সাপোর্ট"],
  why: {
    title: "কেন কিনবো এখন",
    body: "আমরা দরকারি পণ্য বেছে আনি, যা প্রতিদিনের কাজ সহজ করে। পণ্য হাতে পেয়ে দেখে টাকা দিন, কোনো ঝামেলা নেই।\nকোনো সমস্যা হলে ফোন বা WhatsApp এ আমাদের জানান, আমরা দ্রুত সমাধান করব।",
    founderName: "",
    founderPhoto: null,
  },
  faq: [
    { question: "কীভাবে অর্ডার করব?", answer: "পণ্যের পেজে গিয়ে ফর্মে নাম, মোবাইল নম্বর ও ঠিকানা লিখে অর্ডার কনফার্ম করুন। আমরা ফোন করে অর্ডার নিশ্চিত করব।" },
    { question: "ক্যাশ অন ডেলিভারি আছে?", answer: "হ্যাঁ। পণ্য হাতে পেয়ে টাকা দিতে পারবেন।" },
    { question: "পণ্য ফেরত দেওয়া যায়?", answer: "পণ্য ভাঙা, ভুল বা ত্রুটিপূর্ণ হলে ডেলিভারির 3 দিনের মধ্যে ছবি বা ভিডিওসহ জানান। বিস্তারিত রিটার্ন নীতিতে দেখুন।" },
  ],
};

interface HomeContentDoc extends Partial<HomeContentValues> {
  updatedAt?: Date;
}

function withDefaults(doc: HomeContentDoc | null): HomeContentValues {
  const why = { ...DEFAULT_HOME_CONTENT.why, ...doc?.why };
  const trust = doc?.trust?.length === TRUST_ITEMS ? doc.trust : DEFAULT_HOME_CONTENT.trust;
  return {
    trust,
    why: { ...why, founderPhoto: why.founderPhoto ? pickImages([why.founderPhoto])[0] : null },
    faq: (doc?.faq ?? DEFAULT_HOME_CONTENT.faq).map(({ question, answer }) => ({ question, answer })),
  };
}

async function readDoc(): Promise<HomeContentDoc | null> {
  await connectMongoose();
  return HomeContentModel.findOne({ key: HOME_KEY }, { _id: 0, key: 0, __v: 0, createdAt: 0 }).lean<HomeContentDoc>();
}

export async function getHomeContent(): Promise<HomeContentValues> {
  "use cache";
  cacheTag(HOME_TAG);
  cacheLife("max");
  return withDefaults(await readDoc());
}

// Uncached read for the admin form. `version` changes on every save.
export async function getHomeContentForAdmin(): Promise<{ content: HomeContentValues; version: string }> {
  const doc = await readDoc();
  return { content: withDefaults(doc), version: doc?.updatedAt?.toISOString() ?? "" };
}
