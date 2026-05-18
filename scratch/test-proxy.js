import { anyApi } from "convex/server";

const queryRef = anyApi.gameData.getPlayerData;
console.log("queryRef type:", typeof queryRef);
console.log("queryRef keys:", Object.keys(queryRef || {}));
console.log("queryRef ownPropertyNames:", Object.getOwnPropertyNames(queryRef || {}));
console.log("queryRef Symbols:", Object.getOwnPropertySymbols(queryRef || {}));

// Try accessing typical Convex symbol properties if any
for (const sym of Object.getOwnPropertySymbols(queryRef || {})) {
  console.log(`Symbol(${sym.description}):`, queryRef[sym]);
}

try {
  console.log("JSON stringify:", JSON.stringify(queryRef));
} catch (e) {
  console.log("JSON error:", e.message);
}

try {
  console.log("toString:", queryRef.toString());
} catch (e) {
  console.log("toString error:", e.message);
}
