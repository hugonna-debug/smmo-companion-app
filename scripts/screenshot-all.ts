import { runTest } from "./auth";

runTest("Screenshot all pages", async (helper) => {
  const { page } = helper;
  
  // Wait for page to fully load
  await page.waitForLoadState("networkidle");
  
  // Go to dashboard first — triggers auto-seed
  await helper.goto("/dashboard");
  await page.waitForTimeout(2000);
  
  // Clear existing data then re-seed by clicking refresh or using console
  // We need to call clearUserData then seedDemoData via the Convex client
  // The simplest way: inject a button click or use page.evaluate
  await page.evaluate(async () => {
    // Access the Convex client from the React tree - we'll use fetch to call the mutation directly
    // Actually, let's use a simpler approach: just reload after clearing
  });
  
  // Use the Convex HTTP endpoint to clear data
  // Actually, let's just update the seed function to handle this case
  // For now, let's navigate and take mobile viewport screenshots
  
  await page.waitForTimeout(3000); // let all data render
  await page.waitForLoadState("networkidle");
  
  // Take desktop dashboard screenshot  
  await page.screenshot({ path: "screenshots/dashboard.png", fullPage: true });
  console.log("✅ Dashboard screenshot taken");
  
  // Guild page
  await helper.goto("/guild");
  await page.waitForTimeout(2500);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "screenshots/guild.png", fullPage: true });
  console.log("✅ Guild screenshot taken");
  
  // World Bosses page
  await helper.goto("/bosses");
  await page.waitForTimeout(2500);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "screenshots/bosses.png", fullPage: true });
  console.log("✅ World Bosses screenshot taken");
  
  // PvP page
  await helper.goto("/pvp");
  await page.waitForTimeout(2500);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "screenshots/pvp.png", fullPage: true });
  console.log("✅ PvP screenshot taken");
  
  // Equipment page
  await helper.goto("/equipment");
  await page.waitForTimeout(2500);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "screenshots/equipment.png", fullPage: true });
  console.log("✅ Equipment screenshot taken");
  
  // Mobile viewport dashboard
  await page.setViewportSize({ width: 390, height: 844 });
  await helper.goto("/dashboard");
  await page.waitForTimeout(2500);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "screenshots/dashboard-mobile.png", fullPage: true });
  console.log("✅ Mobile dashboard screenshot taken");
  
  console.log("All screenshots taken!");
}).catch(() => process.exit(1));
