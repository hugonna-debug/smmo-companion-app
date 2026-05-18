const fs = require("fs");
const path = require("path");

const generatedDir = path.join(__dirname, "..", "convex", "_generated");

// Ensure the _generated directory exists
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

// 1. Write server.d.ts using high-fidelity Convex builders
const serverDts = `import {
  ActionBuilder,
  GenericActionCtx,
  GenericMutationCtx,
  GenericQueryCtx,
  MutationBuilder,
  QueryBuilder,
} from "convex/server";
import { DataModel } from "./dataModel";

export type QueryCtx = GenericQueryCtx<DataModel>;
export type MutationCtx = GenericMutationCtx<DataModel>;
export type ActionCtx = GenericActionCtx<DataModel>;

export declare const query: QueryBuilder<DataModel, "public">;
export declare const mutation: MutationBuilder<DataModel, "public">;
export declare const action: ActionBuilder<DataModel, "public">;
export declare const internalQuery: QueryBuilder<DataModel, "internal">;
export declare const internalMutation: MutationBuilder<DataModel, "internal">;
export declare const internalAction: ActionBuilder<DataModel, "internal">;
`;

// 2. Write server.js
const serverJs = `import {
  actionGeneric,
  internalActionGeneric,
  internalMutationGeneric,
  internalQueryGeneric,
  mutationGeneric,
  queryGeneric,
} from "convex/server";

export const query = queryGeneric;
export const mutation = mutationGeneric;
export const action = actionGeneric;
export const internalQuery = internalQueryGeneric;
export const internalMutation = internalMutationGeneric;
export const internalAction = internalActionGeneric;
`;

// 3. Write dataModel.d.ts
const dataModelDts = `import { GenericId } from "convex/server";
import { DataModelFromSchemaDefinition } from "convex/server";
import schema from "../schema";

export type DataModel = DataModelFromSchemaDefinition<typeof schema>;
export type TableNames = keyof DataModel & string;
export type Doc<Table extends TableNames> = DataModel[Table]["document"];
export type Id<Table extends TableNames> = GenericId<Table>;
`;

// 4. Write api.d.ts
const apiDts = `import { AnyApi } from "convex/server";

export declare const api: AnyApi;
export declare const internal: AnyApi;
`;

// 5. Write api.js
const apiJs = `import { anyApi } from "convex/server";

export const api = anyApi;
export const internal = anyApi;
`;

fs.writeFileSync(path.join(generatedDir, "server.d.ts"), serverDts);
fs.writeFileSync(path.join(generatedDir, "server.js"), serverJs);
fs.writeFileSync(path.join(generatedDir, "dataModel.d.ts"), dataModelDts);
fs.writeFileSync(path.join(generatedDir, "api.d.ts"), apiDts);
fs.writeFileSync(path.join(generatedDir, "api.js"), apiJs);

console.log("Successfully generated Convex offline mock types inside convex/_generated/!");
