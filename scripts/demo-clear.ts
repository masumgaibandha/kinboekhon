import { connectMongoose, DB_NAME, isProductionDb, mongoClient } from "@/lib/db";
import { BannerModel } from "@/lib/models/Banner";
import { CategoryModel } from "@/lib/models/Category";
import { LandingPageModel } from "@/lib/models/LandingPage";
import { ProductModel } from "@/lib/models/Product";

// Deletes every product, category and banner marked isDemo. Only on a dev database.
async function clearDemo() {
  if (isProductionDb) throw new Error("MONGODB_URI points to the production database. Demo scripts run only on dev.");
  await connectMongoose();

  const demoCategoryIds = (await CategoryModel.distinct("_id", { isDemo: true })).map(String);
  const products = await ProductModel.deleteMany({ isDemo: true });
  const categories = await CategoryModel.deleteMany({ isDemo: true });
  const banners = await BannerModel.deleteMany({ isDemo: true });
  const landings = await LandingPageModel.deleteMany({ isDemo: true });
  // Real products left in a demo category get no category.
  const moved = await ProductModel.updateMany({ categoryId: { $in: demoCategoryIds } }, { $set: { categoryId: null } });

  console.log(`Database: ${DB_NAME}`);
  console.log(
    `Deleted ${products.deletedCount} products, ${categories.deletedCount} categories, ${banners.deletedCount} banners, ${landings.deletedCount} landing pages.` +
      (moved.modifiedCount > 0 ? ` ${moved.modifiedCount} other products lost their demo category.` : ""),
  );
}

clearDemo()
  .catch((error: unknown) => {
    console.error(`Demo clear failed: ${error instanceof Error ? error.message : "unknown error"}`);
    process.exitCode = 1;
  })
  .finally(() => mongoClient.close());
