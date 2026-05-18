import { runTest } from "./auth";

runTest("SMMO Companion - Full App Test", async helper => {
  const { page } = helper;

  // Should start authenticated on root, which should redirect to dashboard or landing
  await helper.goto("/dashboard");
  await page.waitForTimeout(3000); // Wait for Convex data + auto-seed

  // Take dashboard screenshot
  await helper.screenshot("dashboard.png");

  // Navigate to PvP page
  await helper.goto("/pvp");
  await page.waitForTimeout(2000);
  await helper.screenshot("pvp.png");

  // Navigate to Buffs page
  await helper.goto("/buffs");
  await page.waitForTimeout(2000);
  await helper.screenshot("buffs.png");

  // Navigate to Equipment page
  await helper.goto("/equipment");
  await page.waitForTimeout(2000);
  await helper.screenshot("equipment.png");

  // Navigate to Settings page
  await helper.goto("/settings");
  await page.waitForTimeout(1500);
  await helper.screenshot("settings.png");

  console.log("All screenshots captured successfully!");
}).catch(() => process.exit(1));
