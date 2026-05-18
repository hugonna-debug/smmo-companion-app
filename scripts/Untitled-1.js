const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

test("generate-mock-convex.cjs", t => {
  const writtenFiles = {};
  const createdDirs = [];
  const logs = [];

  // Mock fs and console methods
  t.mock.method(fs, "writeFileSync", (file, content) => {
    writtenFiles[file] = content;
  });
  t.mock.method(fs, "existsSync", dir => {
    return false; // Force mkdirSync to be called
  });
  t.mock.method(fs, "mkdirSync", (dir, opts) => {
    createdDirs.push(dir);
  });
  t.mock.method(console, "log", msg => {
    logs.push(msg);
  });

  // Ensure fresh execution
  const scriptPath = path.resolve(__dirname, "generate-mock-convex.cjs");
  delete require.cache[require.resolve(scriptPath)];

  // Execute the script
  require(scriptPath);

  const generatedDir = path.join(__dirname, "..", "convex", "_generated");

  // Assertions
  assert.deepStrictEqual(
    createdDirs,
    [generatedDir],
    "Should create the _generated directory",
  );

  assert.ok(
    writtenFiles[path.join(generatedDir, "server.d.ts")],
    "Should write server.d.ts",
  );
  assert.ok(
    writtenFiles[path.join(generatedDir, "server.d.ts")].includes(
      "QueryBuilder",
    ),
    "server.d.ts should contain correct content",
  );

  assert.ok(
    writtenFiles[path.join(generatedDir, "server.js")],
    "Should write server.js",
  );
  assert.ok(
    writtenFiles[path.join(generatedDir, "server.js")].includes("queryGeneric"),
    "server.js should contain correct content",
  );

  assert.ok(
    writtenFiles[path.join(generatedDir, "dataModel.d.ts")],
    "Should write dataModel.d.ts",
  );
  assert.ok(
    writtenFiles[path.join(generatedDir, "dataModel.d.ts")].includes(
      "DataModelFromSchemaDefinition",
    ),
    "dataModel.d.ts should contain correct content",
  );

  assert.ok(
    writtenFiles[path.join(generatedDir, "api.d.ts")],
    "Should write api.d.ts",
  );
  assert.ok(
    writtenFiles[path.join(generatedDir, "api.d.ts")].includes("AnyApi"),
    "api.d.ts should contain correct content",
  );

  assert.ok(
    writtenFiles[path.join(generatedDir, "api.js")],
    "Should write api.js",
  );
  assert.ok(
    writtenFiles[path.join(generatedDir, "api.js")].includes("anyApi"),
    "api.js should contain correct content",
  );

  assert.strictEqual(
    logs[0],
    "Successfully generated Convex offline mock types inside convex/_generated/!",
    "Should log success message",
  );
});
