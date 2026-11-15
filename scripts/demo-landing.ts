import { LandingPageModel } from "@/lib/models/LandingPage";
import { ProductModel } from "@/lib/models/Product";

import { uploadPlaceholder } from "./demo-images";

const DEMO_LANDING_SLUG = "demo-vegetable-chopper";

// The ad landing page /l/demo-vegetable-chopper with every section filled.
export async function seedDemoLanding(): Promise<string> {
  const product = await ProductModel.findOne({ slug: DEMO_LANDING_SLUG, isDemo: true }, { _id: 1 }).lean();
  if (!product) throw new Error(`Demo product ${DEMO_LANDING_SLUG} is missing.`);

  const gallery = [];
  for (const [index, color] of ["#F85606", "#B33F00", "#2B2B2B"].entries()) {
    gallery.push(
      await uploadPlaceholder("landing", `gallery-${index + 1}`, {
        width: 800, height: 800, background: color, title: `GALLERY ${index + 1}`, subtitle: "demo landing",
      }),
    );
  }

  await LandingPageModel.updateOne(
    { productId: product._id },
    {
      $set: {
        active: true,
        isDemo: true,
        headline: "চোখে পানি ছাড়াই পেঁয়াজ কুচি, কয়েক টানেই",
        subheadline: "হ্যান্ড পুল চপার। দড়ি টানলেই পেঁয়াজ, রসুন, মরিচ, টমেটো কুচি। বিদ্যুৎ লাগে না। (ডেমো পেজ)",
        heroImage: null,
        heroVideoUrl: "",
        problem: { title: "", points: ["পেঁয়াজ কাটতে গেলে চোখ জ্বালা করে", "হাত কেটে যাওয়ার ভয় থাকে", "রান্নার আগে অনেক সময় চলে যায়"] },
        solution: { title: "", text: "এই চপারে পেঁয়াজ রেখে কয়েকবার দড়ি টানুন। কয়েক সেকেন্ডেই মিহি কুচি তৈরি।" },
        benefits: {
          title: "",
          items: [
            { icon: "bolt", text: "বিদ্যুৎ বা ব্যাটারি লাগে না" },
            { icon: "shield", text: "ধারালো স্টেইনলেস স্টিলের ব্লেড" },
            { icon: "clock", text: "রান্নার সময় বাঁচায়" },
            { icon: "hand", text: "সহজে খুলে ধোয়া যায়" },
          ],
        },
        gallery: { title: "", images: gallery },
        howTo: { title: "", steps: ["সবজি টুকরো করে বাটিতে দিন", "ঢাকনা লাগিয়ে দড়ি টানুন", "পছন্দমতো মিহি হলে ঢাকনা খুলুন"] },
        inBox: { title: "", items: ["1টি চপার বাটি", "3টি ব্লেড", "1টি ঢাকনা"] },
        specs: {
          title: "",
          rows: [
            { label: "ধারণক্ষমতা", value: "500 মিলি" },
            { label: "ব্লেড", value: "স্টেইনলেস স্টিল" },
            { label: "রং", value: "সবুজ ও সাদা" },
          ],
        },
        guarantee: "ভাঙা বা ত্রুটিপূর্ণ হলে 3 দিনের মধ্যে রিটার্ন",
        faq: [
          { question: "এটি কি বিদ্যুতে চলে?", answer: "না, দড়ি টেনে হাতে চালাতে হয়।" },
          { question: "ক্যাশ অন ডেলিভারি আছে?", answer: "হ্যাঁ, পণ্য হাতে পেয়ে টাকা দিন।" },
        ],
      },
    },
    { upsert: true },
  );
  return DEMO_LANDING_SLUG;
}
