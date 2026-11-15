import { connectMongoose, DB_NAME, isProductionDb, mongoClient } from "@/lib/db";
import { BannerModel } from "@/lib/models/Banner";
import { CategoryModel } from "@/lib/models/Category";
import { ProductModel } from "@/lib/models/Product";

import { DEMO_BANNERS, DEMO_CATEGORIES, DEMO_PRODUCTS } from "./demo-data";
import { uploadPlaceholder } from "./demo-images";

// Demo categories, products and banners for testing. Only on a dev database, never production.
async function seedDemo() {
  if (isProductionDb) throw new Error("MONGODB_URI points to the production database. Demo data is never added there.");
  await connectMongoose();

  const categoryIds = new Map<string, unknown>();
  for (const [index, category] of DEMO_CATEGORIES.entries()) {
    const image = await uploadPlaceholder("categories", category.key, {
      width: 400, height: 400, background: category.color, title: `DEMO ${index + 1}`, subtitle: category.key,
    });
    const doc = await CategoryModel.findOneAndUpdate(
      { slug: category.slug },
      { $set: { name: category.name, image, sortOrder: index + 1, isDemo: true } },
      { upsert: true, returnDocument: "after" },
    );
    categoryIds.set(category.key, doc._id);
  }

  for (const [index, product] of DEMO_PRODUCTS.entries()) {
    const color = DEMO_CATEGORIES.find((category) => category.key === product.category)?.color ?? "#F85606";
    const image = await uploadPlaceholder("products", `product-${index + 1}`, {
      width: 800, height: 800, background: color, title: `DEMO ${index + 1}`, subtitle: product.slug,
    });
    await ProductModel.updateOne(
      { slug: product.slug },
      {
        $set: {
          name: product.name,
          price: product.price,
          shortDescription: product.description,
          hook: { headline: product.name, subheadline: product.description },
          images: [image],
          categoryId: categoryIds.get(product.category),
          popular: product.popular,
          active: true,
          sortOrder: 100 + index,
          isDemo: true,
        },
      },
      { upsert: true },
    );
  }

  for (const [index, banner] of DEMO_BANNERS.entries()) {
    const options = { background: banner.color, title: banner.label, subtitle: banner.sub };
    const mobileImage = await uploadPlaceholder("banners", `${banner.key}-mobile`, { ...options, width: 1200, height: 600 });
    const desktopImage = await uploadPlaceholder("banners", `${banner.key}-desktop`, { ...options, width: 1920, height: 600 });
    await BannerModel.updateOne(
      { isDemo: true, title: banner.title },
      { $set: { link: banner.link, mobileImage, desktopImage, sortOrder: index + 1, active: true, isDemo: true } },
      { upsert: true },
    );
  }

  console.log(`Database: ${DB_NAME}`);
  console.log(`Demo data: ${DEMO_CATEGORIES.length} categories, ${DEMO_PRODUCTS.length} products, ${DEMO_BANNERS.length} banners.`);
  console.log("Restart the dev server (or build again) to see it in the shop.");
}

seedDemo()
  .catch((error: unknown) => {
    console.error(`Demo seed failed: ${error instanceof Error ? error.message : "unknown error"}`);
    process.exitCode = 1;
  })
  .finally(() => mongoClient.close());
