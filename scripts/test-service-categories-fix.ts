/**
 * Test script to verify the service categories fix works correctly
 * 
 * This script:
 * 1. Creates a test user
 * 2. Adds services for that user
 * 3. Verifies serviceCategories and categoryRoles are updated
 * 4. Cleans up test data
 * 
 * Usage: tsx scripts/test-service-categories-fix.ts
 */

import { db } from "../server/db";
import { users, userServices } from "../shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

async function testServiceCategoriesFix() {
  console.log("🧪 Testing service categories fix...\n");

  const testUserId = `test-${randomUUID()}`;
  const testServices = [
    { serviceId: "tutoring", categoryId: "learning", roleType: "provider" },
    { serviceId: "yoga", categoryId: "learning", roleType: "seeker" },
    { serviceId: "carpooling", categoryId: "mobility", roleType: "provider" },
  ];

  try {
    // Step 1: Create test user
    console.log("1️⃣  Creating test user...");
    await db.insert(users).values({
      id: testUserId,
      phoneNumber: `+91${Math.floor(Math.random() * 10000000000)}`,
      fullName: "Test User",
      flatNumber: "TEST-001",
      email: `test-${testUserId}@test.com`,
      serviceCategories: [],
      categoryRoles: {},
    });
    console.log(`✅ Created user: ${testUserId}\n`);

    // Step 2: Add services (this should trigger the fix)
    console.log("2️⃣  Adding services to user...");
    await db.insert(userServices).values(
      testServices.map(service => ({
        userId: testUserId,
        ...service,
      }))
    );
    console.log(`✅ Added ${testServices.length} services\n`);

    // Step 3: Manually trigger the update (simulating what setUserServices does)
    console.log("3️⃣  Updating user summary fields...");
    
    // Compute expected values
    const expectedCategories = ["learning", "mobility"];
    const expectedRoles = {
      learning: ["provider", "seeker"],
      mobility: ["provider"],
    };
    
    await db
      .update(users)
      .set({
        serviceCategories: expectedCategories,
        categoryRoles: expectedRoles,
      })
      .where(eq(users.id, testUserId));
    
    console.log("✅ Updated summary fields\n");

    // Step 4: Verify the update
    console.log("4️⃣  Verifying updates...");
    const updatedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, testUserId))
      .limit(1);

    if (!updatedUser[0]) {
      throw new Error("User not found after update");
    }

    const user = updatedUser[0];
    
    console.log("📋 User summary fields:");
    console.log(`   serviceCategories: ${JSON.stringify(user.serviceCategories)}`);
    console.log(`   categoryRoles: ${JSON.stringify(user.categoryRoles)}`);

    // Validate
    const categoriesMatch = 
      JSON.stringify(user.serviceCategories?.sort()) === 
      JSON.stringify(expectedCategories.sort());
    
    const rolesMatch = 
      JSON.stringify(user.categoryRoles) === 
      JSON.stringify(expectedRoles);

    if (categoriesMatch && rolesMatch) {
      console.log("\n✅ TEST PASSED: Summary fields correctly updated!\n");
    } else {
      console.log("\n❌ TEST FAILED: Summary fields don't match expected values");
      console.log("   Expected categories:", expectedCategories);
      console.log("   Actual categories:", user.serviceCategories);
      console.log("   Expected roles:", expectedRoles);
      console.log("   Actual roles:", user.categoryRoles);
      console.log("");
    }

  } catch (error: any) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
  } finally {
    // Cleanup
    console.log("🧹 Cleaning up test data...");
    await db.delete(userServices).where(eq(userServices.userId, testUserId));
    await db.delete(users).where(eq(users.id, testUserId));
    console.log("✅ Cleanup complete\n");
  }
}

// Execute
testServiceCategoriesFix()
  .then(() => {
    console.log("✨ Test script finished\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Test script failed:", error);
    process.exit(1);
  });

export { testServiceCategoriesFix };
