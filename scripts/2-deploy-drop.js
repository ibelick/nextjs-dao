import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const app = sdk.getAppModule("INSERT_YOUR_APP_ADDRESS_HERE");

(async () => {
  try {
    const bundleDropModule = await app.deployBundleDropModule({
      name: "DAO Membership",
      description: "A description of the DAO.",
      image: readFileSync("scripts/assets/[ASSET_HERE]"),
      primarySaleRecipientAddress: ethers.constants.AddressZero,
    });

    console.log(
      "✅ Successfully deployed bundleDrop module, address:",
      bundleDropModule.address
    );
    console.log(
      "✅ bundleDrop metadata:",
      await bundleDropModule.getMetadata()
    );
  } catch (error) {
    console.log("failed to deploy bundleDrop module", error);
  }
})();
