import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule("INSERT_DROP_MODULE_ADDRESS");

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "Name of the NFT",
        description: "Description of the NFT.",
        image: readFileSync("scripts/assets/[ASSET_HERE]"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})();
