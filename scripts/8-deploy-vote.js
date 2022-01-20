import sdk from "./1-initialize-sdk.js";

const appModule = sdk.getAppModule("INSERT_YOUR_APP_ADDRESS_HERE");

(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      name: "Governance contract name",
      votingTokenAddress: "INSERT_TOKEN_MODULE_ADDRESS",
      proposalStartWaitTimeInSeconds: 0,
      proposalVotingTimeInSeconds: 24 * 60 * 60,
      votingQuorumFraction: 0,
      minimumNumberOfTokensNeededToPropose: "0",
    });

    console.log(
      "✅ Successfully deployed vote module, address:",
      voteModule.address
    );
  } catch (err) {
    console.error("Failed to deploy vote module", err);
  }
})();
