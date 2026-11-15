import { BannerModel } from "@/lib/models/Banner";
import { CategoryModel } from "@/lib/models/Category";
import { LandingPageModel } from "@/lib/models/LandingPage";
import { ProductModel } from "@/lib/models/Product";

// Deletes every product, category, banner and landing page marked isDemo and returns a summary line.
export async function deleteDemoRecords(): Promise<string> {
  const demoCategoryIds = (await CategoryModel.distinct("_id", { isDemo: true })).map(String);
  const products = await ProductModel.deleteMany({ isDemo: true });
  const categories = await CategoryModel.deleteMany({ isDemo: true });
  const banners = await BannerModel.deleteMany({ isDemo: true });
  const landings = await LandingPageModel.deleteMany({ isDemo: true });
  // Real products left in a demo category get no category.
  const moved = await ProductModel.updateMany({ categoryId: { $in: demoCategoryIds } }, { $set: { categoryId: null } });

  return (
    `Deleted ${products.deletedCount} products, ${categories.deletedCount} categories, ${banners.deletedCount} banners, ${landings.deletedCount} landing pages.` +
    (moved.modifiedCount > 0 ? ` ${moved.modifiedCount} other products lost their demo category.` : "")
  );
}
