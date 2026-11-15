import { LandingPageModel } from "@/lib/models/LandingPage";
import { ProductModel } from "@/lib/models/Product";

import { demoPhotoFiles, uploadPhoto } from "./demo-images";

const DEMO_LANDING_SLUG = "toddler-montessori-busy-book-and-travel-bag";

// The ad landing page for the busy book with every section filled; its photos form the gallery.
export async function seedDemoLanding(): Promise<string> {
  const product = await ProductModel.findOne({ slug: DEMO_LANDING_SLUG, isDemo: true }, { _id: 1 }).lean();
  if (!product) throw new Error(`Demo product ${DEMO_LANDING_SLUG} is missing.`);

  const gallery = [];
  for (const [index, file] of (await demoPhotoFiles(DEMO_LANDING_SLUG)).entries()) {
    gallery.push(await uploadPhoto("landing", `${DEMO_LANDING_SLUG}-${index + 1}`, DEMO_LANDING_SLUG, file));
  }

  await LandingPageModel.create({
    productId: product._id,
    active: true,
    isDemo: true,
    headline: "মোবাইল ছাড়াই খেলায় ব্যস্ত থাকবে আপনার শিশু",
    subheadline: "মন্টেসরি বিজি বুক: বোতাম লাগানো, চেইন টানা, ফিতা বাঁধা খেলতে খেলতে শেখে। সাথে ট্রাভেল ব্যাগ। (ডেমো পেজ)",
    heroImage: null,
    heroVideoUrl: "",
    problem: { title: "", points: ["শিশু সারাক্ষণ মোবাইল চায়", "ভ্রমণে বা দাওয়াতে শিশুকে শান্ত রাখা কঠিন", "হাতের ছোট কাজ শেখানোর সহজ উপায় মেলে না"] },
    solution: { title: "", text: "প্রতিটি পাতায় নতুন একটি কাজ। শিশু নিজে নিজে খেলে, আর খেলতে খেলতে হাতের দক্ষতা ও মনোযোগ বাড়ে।" },
    benefits: {
      title: "",
      items: [
        { icon: "leaf", text: "নরম কাপড়, শিশুর জন্য নিরাপদ" },
        { icon: "hand", text: "হাত ও আঙুলের দক্ষতা বাড়ায়" },
        { icon: "heart", text: "মোবাইল থেকে দূরে রাখে" },
        { icon: "gift", text: "জন্মদিনে চমৎকার উপহার" },
      ],
    },
    gallery: { title: "", images: gallery },
    howTo: { title: "", steps: ["ব্যাগ থেকে বইটি বের করে দিন", "একটি পাতা খুলে কাজটি একবার দেখিয়ে দিন", "এরপর শিশু নিজেই খেলবে"] },
    inBox: { title: "", items: ["1টি বিজি বুক", "1টি ট্রাভেল ব্যাগ"] },
    specs: {
      title: "",
      rows: [
        { label: "বয়স", value: "2 থেকে 6 বছর" },
        { label: "উপাদান", value: "নরম ফেল্ট কাপড়" },
        { label: "ওজন", value: "400 গ্রাম" },
      ],
    },
    guarantee: "ভাঙা বা ত্রুটিপূর্ণ হলে 3 দিনের মধ্যে রিটার্ন",
    faq: [
      { question: "কত বছরের শিশুর জন্য?", answer: "2 থেকে 6 বছরের শিশুদের জন্য উপযুক্ত।" },
      { question: "ক্যাশ অন ডেলিভারি আছে?", answer: "হ্যাঁ, পণ্য হাতে পেয়ে টাকা দিন।" },
    ],
  });
  return DEMO_LANDING_SLUG;
}
