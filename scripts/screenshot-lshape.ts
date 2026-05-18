import { type ChildProcess, spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createPageHelper } from "./auth";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;
const MAX_WAIT_MS = 30000;
const POLL_INTERVAL_MS = 500;

async function waitForServer(url: string, maxWait: number): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status === 304) return true;
    } catch {}
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }
  return false;
}

function startPreviewServer(): ChildProcess {
  const server = spawn("bun", ["run", "preview"], {
    cwd: projectRoot,
    stdio: ["ignore", "pipe", "pipe"],
    detached: false,
  });
  server.stdout?.on("data", () => {});
  server.stderr?.on("data", () => {});
  return server;
}

async function main() {
  console.log("🚀 Starting preview server...");
  const server = startPreviewServer();

  try {
    console.log(`⏳ Waiting for server at ${PREVIEW_URL}...`);
    const ready = await waitForServer(PREVIEW_URL, MAX_WAIT_MS);
    if (!ready) {
      console.error("❌ Server failed to start.");
      process.exit(1);
    }

    process.env.APP_URL = PREVIEW_URL;
    const helper = await createPageHelper();

    // Set L-shape layout in localStorage BEFORE navigating
    await helper.page.evaluate(() => {
      localStorage.setItem(
        "smmo-layout-config",
        JSON.stringify({
          mode: "lshape",
          deadZonePosition: "top-right",
          deadZoneWidth: 60,
          deadZoneHeight: 70,
        }),
      );
    });

    // Use mobile viewport (phone in portrait)
    await helper.page.setViewportSize({ width: 400, height: 800 });

    // Navigate to dashboard in L-shape mode
    await helper.goto("/dashboard");
    await helper.page.waitForTimeout(2000);
    await helper.screenshot("lshape-dashboard.png");
    console.log("\n📍 Dashboard URL:", helper.page.url());
    await helper.printPageContent();

    // Screenshot PvP in L-shape
    await helper.goto("/pvp");
    await helper.page.waitForTimeout(1500);
    await helper.screenshot("lshape-pvp.png");

    // Screenshot settings showing L-shape config
    await helper.goto("/settings");
    await helper.page.waitForTimeout(1500);
    await helper.screenshot("lshape-settings.png");

    // Also screenshot with dead zone in different position
    await helper.page.evaluate(() => {
      localStorage.setItem(
        "smmo-layout-config",
        JSON.stringify({
          mode: "lshape",
          deadZonePosition: "top-left",
          deadZoneWidth: 60,
          deadZoneHeight: 70,
        }),
      );
    });
    await helper.goto("/dashboard");
    await helper.page.waitForTimeout(1500);
    await helper.screenshot("lshape-dashboard-topleft.png");

    await helper.close();
    console.log("\n✅ All L-shape screenshots done!");
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch(err => {
  console.error("Failed:", err);
  process.exit(1);
});
