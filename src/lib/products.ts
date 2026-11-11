import { isValidObjectId, type Types } from "mongoose";

import { connectMongoose } from "@/lib/db";
import { ProductModel } from "@/lib/models/Product";
import { pickImages, type ProductImage } from "@/lib/product-images";
import type { ProductInput } from "@/lib/validation/product";

type ProductDoc = ProductInput & { _id: Types.ObjectId };

export const EMPTY_PRODUCT: ProductInput = {
  name: "",
  slug: "",
  price: 0,
  oldPrice: null,
  shortDescription: "",
  sortOrder: 0,
  active: false,
  images: [],
  hook: { headline: "", subheadline: "" },
  problem: { title: "", points: [] },
  story: { title: "", body: "" },
  solution: { title: "", benefits: [], images: [] },
  proof: { title: "", images: [], reviews: [] },
  cta: { title: "", text: "" },
};

function toProductInput(doc: ProductDoc): ProductInput {
  return {
    name: doc.name,
    slug: doc.slug,
    price: doc.price,
    oldPrice: doc.oldPrice ?? null,
    shortDescription: doc.shortDescription ?? "",
    sortOrder: doc.sortOrder ?? 0,
    active: doc.active,
    images: pickImages(doc.images),
    hook: { headline: doc.hook?.headline ?? "", subheadline: doc.hook?.subheadline ?? "" },
    problem: { title: doc.problem?.title ?? "", points: doc.problem?.points ?? [] },
    story: { title: doc.story?.title ?? "", body: doc.story?.body ?? "" },
    solution: {
      title: doc.solution?.title ?? "",
      benefits: doc.solution?.benefits ?? [],
      images: pickImages(doc.solution?.images),
    },
    proof: {
      title: doc.proof?.title ?? "",
      images: pickImages(doc.proof?.images),
      reviews: (doc.proof?.reviews ?? []).map(({ name, text }) => ({ name: name ?? "", text: text ?? "" })),
    },
    cta: { title: doc.cta?.title ?? "", text: doc.cta?.text ?? "" },
  };
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  sortOrder: number;
  active: boolean;
  mainImage: ProductImage | null;
}

export async function listProductsForAdmin(): Promise<ProductListItem[]> {
  await connectMongoose();
  const docs = await ProductModel.find({}, {
    name: 1,
    slug: 1,
    price: 1,
    oldPrice: 1,
    sortOrder: 1,
    active: 1,
    images: { $slice: 1 },
  })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean<ProductDoc[]>();

  return docs.map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    price: doc.price,
    oldPrice: doc.oldPrice ?? null,
    sortOrder: doc.sortOrder ?? 0,
    active: doc.active,
    mainImage: pickImages(doc.images)[0] ?? null,
  }));
}

export async function getProductForAdmin(id: string): Promise<ProductInput | null> {
  if (!isValidObjectId(id)) return null;
  await connectMongoose();
  const doc = await ProductModel.findById(id).lean<ProductDoc>();
  return doc ? toProductInput(doc) : null;
}
