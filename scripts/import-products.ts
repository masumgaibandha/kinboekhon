import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { productImageFolder } from "@/lib/cloudinary/folder";
import { connectMongoose, DB_NAME, isProductionDb, mongoClient } from "@/lib/db";
import { CategoryModel } from "@/lib/models/Category";
import { ProductModel } from "@/lib/models/Product";
import type { ProductImage } from "@/lib/product-images";
import { productSchema } from "@/lib/validation/product";

import { uploadImage } from "./demo-cloudinary";
import { IMPORT_CATEGORY, IMPORT_PRODUCTS, type ImportProduct } from "./import-products-data";

const PHOTO_ROOT = path.join(process.cwd(), "_reference", "products");
const PHOTO_TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png" };
// Option A: China price = landed cost minus air shipping at this rate, so landed cost matches the owner's figure.
const SHIPPING_PER_KG = 710;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

const dryRun = process.argv.includes("--dry-run");
const allowProduction = process.argv.includes("--production");

function chinaPrice(product: ImportProduct): number {
  return Math.round(product.landedCost - (product.weightGrams / 1000) * SHIPPING_PER_KG);
}

function photoPath(product: ImportProduct, file: string): string {
  return path.join(PHOTO_ROOT, product.folder, file);
}

// Fixed ids with overwrite, so running again replaces the photos instead of adding copies.
async function uploadPhotos(product: ImportProduct): Promise<ProductImage[]> {
  const images: ProductImage[] = [];
  for (const [index, file] of product.images.entries()) {
    const bytes = await readFile(photoPath(product, file));
    const blob = new Blob([bytes], { type: PHOTO_TYPES[path.extname(file).toLowerCase()] });
    const params = {
      folder: productImageFolder(),
      public_id: `${product.slug}-${index + 1}`,
      overwrite: "true",
      invalidate: "true",
      transformation: "c_limit,h_2000,w_2000",
    };
    images.push(await uploadImage(params, blob, `${product.folder}/${file}`));
  }
  return images;
}

// Checks text lengths, slugs and photo files before anything is uploaded or written.
async function check(product: ImportProduct): Promise<void> {
  const fields = productSchema.pick({ name: true, slug: true, shortDescription: true, description: true });
  const parsed = fields.safeParse(product);
  if (!parsed.success) throw new Error(`${product.slug}: ${parsed.error.issues.map((issue) => `${issue.path.join(".")} ${issue.message}`).join("; ")}`);
  for (const file of product.images) {
    if (!(path.extname(file).toLowerCase() in PHOTO_TYPES)) throw new Error(`${product.slug}: unsupported file ${file}`);
    const { size } = await stat(photoPath(product, file));
    if (size > MAX_FILE_BYTES) throw new Error(`${product.slug}: ${file} is over 10 MB`);
  }
}

async function importProducts() {
  if (isProductionDb && !allowProduction && !dryRun) {
    throw new Error("MONGODB_URI points to the production database. Add --production (after a --dry-run) to import there.");
  }
  await connectMongoose();
  console.log(`Database: ${DB_NAME}${dryRun ? " (dry run: nothing is uploaded or written)" : ""}`);
  for (const product of IMPORT_PRODUCTS) await check(product);

  const category = await CategoryModel.findOne({ slug: IMPORT_CATEGORY.slug }).lean<{ _id: unknown; isDemo?: boolean }>();
  console.log(`Category ${IMPORT_CATEGORY.slug}: ${category ? `exists${category.isDemo ? ", demo flag and demo image will be removed" : ""}` : "will be created"}`);
  // A demo category becomes real; its demo image is dropped because demo cleanup deletes it on Cloudinary.
  const categoryDoc = dryRun
    ? null
    : category?.isDemo
      ? await CategoryModel.findOneAndUpdate({ slug: IMPORT_CATEGORY.slug }, { $set: { isDemo: false, image: null } }, { returnDocument: "after" })
          .lean<{ _id: unknown }>()
      : await CategoryModel.findOneAndUpdate(
          { slug: IMPORT_CATEGORY.slug },
          { $setOnInsert: { name: IMPORT_CATEGORY.name, image: null, sortOrder: 1, isDemo: false } },
          { upsert: true, returnDocument: "after" },
        ).lean<{ _id: unknown }>();

  for (const [index, product] of IMPORT_PRODUCTS.entries()) {
    const exists = await ProductModel.exists({ slug: product.slug });
    console.log(
      `Product ${product.slug}: ${exists ? "update" : `create (active: ${!isProductionDb})`}, ৳${product.price}, ` +
        `${product.weightGrams} g, China price ${chinaPrice(product)}, ${product.images.length} images`,
    );
    if (!categoryDoc) continue;

    const images = await uploadPhotos(product);
    // Active, sort order and stock are set only when the product is created, so a later run never changes them.
    await ProductModel.updateOne(
      { slug: product.slug },
      {
        $set: {
          name: product.name,
          price: product.price,
          shortDescription: product.shortDescription,
          description: product.description,
          images,
          categoryId: categoryDoc._id,
          costs: { chinaPrice: chinaPrice(product), weightGrams: product.weightGrams, shippingPerKg: SHIPPING_PER_KG, agentFee: 0 },
        },
        $setOnInsert: { active: !isProductionDb, sortOrder: index + 1 },
      },
      { upsert: true },
    );
  }
  if (!dryRun) console.log("Done. Restart the server (or build again) to see the products in the shop.");
}

importProducts()
  .catch((error: unknown) => {
    console.error(`Import failed: ${error instanceof Error ? error.message : "unknown error"}`);
    process.exitCode = 1;
  })
  .finally(() => mongoClient.close());
