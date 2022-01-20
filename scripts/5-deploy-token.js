import sdk from "./1-initialize-sdk.js";

const app = sdk.getAppModule("INSERT_YOUR_APP_ADDRESS_HERE");

(async () => {
  try {
    const tokenModule = await app.deployTokenModule({
      name: "DAO Governance Token",
      symbol: "$DAO",
    });
    console.log(
      "✅ Successfully deployed token module, address:",
      tokenModule.address
    );
  } catch (error) {
    console.error("failed to deploy token module", error);
  }
})();
