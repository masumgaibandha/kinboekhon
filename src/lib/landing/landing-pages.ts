import { cacheLife, cacheTag } from "next/cache";
import { isValidObjectId } from "mongoose";

import { getProductBySlug, PRODUCTS_TAG, productTag, type LandingProduct } from "@/lib/catalog";
import { connectMongoose } from "@/lib/db";
import { LandingPageModel } from "@/lib/models/LandingPage";
import { ProductModel } from "@/lib/models/Product";
import { pickImages } from "@/lib/product-images";
import type { LandingValues } from "@/lib/validation/landing";

export const LANDINGS_TAG = "landings";

export function landingTag(productId: string): string {
  return `landing-${productId}`;
}

export const EMPTY_LANDING: LandingValues = {
  active: false,
  headline: "",
  subheadline: "",
  heroImage: null,
  heroVideoUrl: "",
  problem: { title: "", points: [] },
  solution: { title: "", text: "" },
  benefits: { title: "", items: [] },
  gallery: { title: "", images: [] },
  howTo: { title: "", steps: [] },
  inBox: { title: "", items: [] },
  specs: { title: "", rows: [] },
  guarantee: "",
  faq: [],
};

type LandingDoc = Partial<LandingValues> & { updatedAt?: Date };

// Plain values with every section present, whatever an older document is missing.
function toLandingValues(doc: LandingDoc): LandingValues {
  return {
    active: doc.active ?? false,
    headline: doc.headline ?? "",
    subheadline: doc.subheadline ?? "",
    heroImage: doc.heroImage ? pickImages([doc.heroImage])[0] : null,
    heroVideoUrl: doc.heroVideoUrl ?? "",
    problem: { title: doc.problem?.title ?? "", points: doc.problem?.points ?? [] },
    solution: { title: doc.solution?.title ?? "", text: doc.solution?.text ?? "" },
    benefits: {
      title: doc.benefits?.title ?? "",
      items: (doc.benefits?.items ?? []).map(({ icon, text }) => ({ icon, text })),
    },
    gallery: { title: doc.gallery?.title ?? "", images: pickImages(doc.gallery?.images) },
    howTo: { title: doc.howTo?.title ?? "", steps: doc.howTo?.steps ?? [] },
    inBox: { title: doc.inBox?.title ?? "", items: doc.inBox?.items ?? [] },
    specs: { title: doc.specs?.title ?? "", rows: (doc.specs?.rows ?? []).map(({ label, value }) => ({ label, value })) },
    guarantee: doc.guarantee ?? "",
    faq: (doc.faq ?? []).map(({ question, answer }) => ({ question, answer })),
  };
}

export interface AdLanding {
  product: LandingProduct;
  landing: LandingValues;
}

// The ad landing page for an active product whose landing is On, or null.
export async function getLandingBySlug(slug: string): Promise<AdLanding | null> {
  "use cache";
  cacheTag(productTag(slug), LANDINGS_TAG);
  cacheLife("max");

  const product = await getProductBySlug(slug);
  if (!product) return null;
  cacheTag(landingTag(product.id));
  await connectMongoose();
  const doc = await LandingPageModel.findOne({ productId: product.id, active: true }).lean<LandingDoc>();
  return doc ? { product, landing: toLandingValues(doc) } : null;
}

export async function getLandingSlugs(): Promise<string[]> {
  "use cache";
  cacheTag(LANDINGS_TAG, PRODUCTS_TAG);
  cacheLife("max");

  await connectMongoose();
  const productIds = await LandingPageModel.distinct("productId", { active: true });
  const products = await ProductModel.find({ _id: { $in: productIds }, active: true }, { slug: 1 }).lean<{ slug: string }[]>();
  return products.map((product) => product.slug);
}

// Uncached admin read; a product without a landing page gets the empty one. `version` changes on every save.
export async function getLandingForAdmin(productId: string): Promise<{ landing: LandingValues; version: string }> {
  if (!isValidObjectId(productId)) return { landing: EMPTY_LANDING, version: "" };
  await connectMongoose();
  const doc = await LandingPageModel.findOne({ productId }).lean<LandingDoc>();
  return doc ? { landing: toLandingValues(doc), version: doc.updatedAt?.toISOString() ?? "" } : { landing: EMPTY_LANDING, version: "" };
}
