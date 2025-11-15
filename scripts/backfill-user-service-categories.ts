/**
 * Backfill script to update serviceCategories and categoryRoles for existing users
 * Run this after deploying the setUserServices fix to update historical data
 * 
 * Usage: tsx scripts/backfill-user-service-categories.ts
 */

import { db } from "../server/db";
import { users, userServices } from "../shared/schema";
import { eq } from "drizzle-orm";

interface UserServicesMap {
  userId: string;
  services: Array<{ categoryId: string; roleType: string }>;
}

async function backfillUserServiceCategories() {
  console.log("🔄 Starting backfill of user serviceCategories and categoryRoles...\n");

  try {
    // Fetch ALL user services in a single query for efficiency
    const allServices = await db
      .select({
        userId: userServices.userId,
        categoryId: userServices.categoryId,
        roleType: userServices.roleType,
      })
      .from(userServices);

    console.log(`📦 Fetched ${allServices.length} service records from database`);

    // Group services by userId for efficient processing
    const userServicesMap = new Map<string, Array<{ categoryId: string; roleType: string }>>();
    
    allServices.forEach(service => {
      if (!userServicesMap.has(service.userId)) {
        userServicesMap.set(service.userId, []);
      }
      userServicesMap.get(service.userId)!.push({
        categoryId: service.categoryId,
        roleType: service.roleType,
      });
    });

    console.log(`📊 Found ${userServicesMap.size} users with services to update\n`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Process users in batches of 50 within transactions for safety
    const userIds = Array.from(userServicesMap.keys());
    const BATCH_SIZE = 50;

    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      const batch = userIds.slice(i, i + BATCH_SIZE);
      
      await db.transaction(async (tx) => {
        for (const userId of batch) {
          try {
            const services = userServicesMap.get(userId)!;

            // Skip users with no services (shouldn't happen but safeguard)
            if (services.length === 0) {
              skipped++;
              console.log(`⏭️  Skipped user ${userId}: No services found`);
              continue;
            }

            // Compute serviceCategories (unique categories)
            const serviceCategories = [...new Set(services.map(s => s.categoryId))];

            // Compute categoryRoles (roles grouped by category)
            const categoryRoles: Record<string, string[]> = {};
            services.forEach(service => {
              if (!categoryRoles[service.categoryId]) {
                categoryRoles[service.categoryId] = [];
              }
              if (!categoryRoles[service.categoryId].includes(service.roleType)) {
                categoryRoles[service.categoryId].push(service.roleType);
              }
            });

            // Update the user record
            await tx
              .update(users)
              .set({
                serviceCategories,
                categoryRoles,
              })
              .where(eq(users.id, userId));

            updated++;
            console.log(`✅ Updated user ${userId}: ${serviceCategories.length} categories`);
          } catch (error: any) {
            errors++;
            console.error(`❌ Error updating user ${userId}:`, error.message);
          }
        }
      });

      console.log(`📦 Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(userIds.length / BATCH_SIZE)}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Backfill Summary:");
    console.log("=".repeat(60));
    console.log(`✅ Successfully updated: ${updated} users`);
    console.log(`⚠️  Skipped: ${skipped} users`);
    console.log(`❌ Errors: ${errors} users`);
    console.log("=".repeat(60) + "\n");

    if (errors === 0) {
      console.log("🎉 Backfill completed successfully!\n");
    } else {
      console.log("⚠️  Backfill completed with some errors. Review logs above.\n");
    }

  } catch (error: any) {
    console.error("❌ Fatal error during backfill:", error);
    process.exit(1);
  }
}

// Execute
backfillUserServiceCategories()
  .then(() => {
    console.log("✨ Script finished\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });

export { backfillUserServiceCategories };
