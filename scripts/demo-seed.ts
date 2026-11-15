import { connectMongoose, DB_NAME, isProductionDb, mongoClient } from "@/lib/db";
import { BannerModel } from "@/lib/models/Banner";
import { CategoryModel } from "@/lib/models/Category";
import { ProductModel } from "@/lib/models/Product";
import type { ProductImage } from "@/lib/product-images";

import { deleteDemoImages } from "./demo-cloudinary";
import { DEMO_BANNERS, DEMO_CATEGORIES, DEMO_PRODUCTS, DEMO_WEIGHT_GRAMS } from "./demo-data";
import { demoPhotoFiles, uploadPhoto, uploadPlaceholder } from "./demo-images";
import { seedDemoLanding } from "./demo-landing";
import { deleteDemoRecords } from "./demo-records";

async function uploadProductPhotos(folder: string): Promise<ProductImage[]> {
  const images: ProductImage[] = [];
  for (const [index, file] of (await demoPhotoFiles(folder)).entries()) {
    images.push(await uploadPhoto("products", `${folder}-${index + 1}`, folder, file));
  }
  return images;
}

// Demo categories, products and banners for testing. Only on a dev database, never production.
async function seedDemo() {
  if (isProductionDb) throw new Error("MONGODB_URI points to the production database. Demo data is never added there.");
  await connectMongoose();

  console.log(`Database: ${DB_NAME}`);
  console.log(await deleteDemoRecords());
  console.log(`Deleted ${await deleteDemoImages()} old demo images on Cloudinary.`);

  for (const [index, category] of DEMO_CATEGORIES.entries()) {
    // The category picture is the main photo of its first product.
    const first = DEMO_PRODUCTS.find((product) => product.category === category.key);
    const files = first ? await demoPhotoFiles(first.folder) : [];
    const image = first ? await uploadPhoto("categories", category.slug, first.folder, files[0]) : null;
    const doc = await CategoryModel.create({ name: category.name, slug: category.slug, image, sortOrder: index + 1, isDemo: true });

    for (const product of DEMO_PRODUCTS.filter((item) => item.category === category.key)) {
      await ProductModel.create({
        name: product.name,
        slug: product.folder,
        price: product.price,
        shortDescription: product.description,
        images: await uploadProductPhotos(product.folder),
        categoryId: String(doc._id),
        popular: product.popular,
        active: true,
        sortOrder: 100 + DEMO_PRODUCTS.indexOf(product),
        costs: { weightGrams: DEMO_WEIGHT_GRAMS },
        isDemo: true,
      });
      console.log(`Product: ${product.folder}`);
    }
  }

  for (const [index, banner] of DEMO_BANNERS.entries()) {
    const options = { background: banner.color, title: banner.label, subtitle: banner.sub };
    const mobileImage = await uploadPlaceholder("banners", `${banner.key}-mobile`, { ...options, width: 1200, height: 600 });
    const desktopImage = await uploadPlaceholder("banners", `${banner.key}-desktop`, { ...options, width: 1920, height: 600 });
    await BannerModel.create({ title: banner.title, link: banner.link, mobileImage, desktopImage, sortOrder: index + 1, active: true, isDemo: true });
  }

  const landingSlug = await seedDemoLanding();

  console.log(`Demo data: ${DEMO_CATEGORIES.length} categories, ${DEMO_PRODUCTS.length} products, ${DEMO_BANNERS.length} banners, landing page /l/${landingSlug}.`);
  console.log("Restart the dev server (or build again) to see it in the shop.");
}

seedDemo()
  .catch((error: unknown) => {
    console.error(`Demo seed failed: ${error instanceof Error ? error.message : "unknown error"}`);
    process.exitCode = 1;
  })
  .finally(() => mongoClient.close());
