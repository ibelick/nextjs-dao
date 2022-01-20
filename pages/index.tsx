import type { NextPage } from "next";
import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "@3rdweb/hooks";
import { Proposal, ThirdwebSDK } from "@3rdweb/sdk";
import { UnsupportedChainIdError } from "@web3-react/core";

const sdk = new ThirdwebSDK("rinkeby");

// replace the addresses here with yours created by the scripts
const bundleDropModule = sdk.getBundleDropModule(
  "0xC3107A142ee45118DaE15962a990A31FC03728C2"
);
const tokenModule = sdk.getTokenModule(
  "0xFe459Be9D474A45A0FE839FBAEEA7B90531BCa2C"
);
const voteModule = sdk.getVoteModule(
  "0x3697c5592cb205225Fe6f354E1aE78C48bE493C9"
);

const shortenAddress = (str: string) => {
  return str.substring(0, 6) + "..." + str.substring(str.length - 4);
};

const App = () => {
  const { connectWallet, address, error, provider } = useWeb3();
  const signer = provider ? provider.getSigner() : undefined;
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [memberTokenAmounts, setMemberTokenAmounts] =
    useState<Record<string, ethers.BigNumber> | null>(null);
  const [memberAddresses, setMemberAddresses] = useState<string[] | null>(null);
  const [proposals, setProposals] = useState<Proposal[] | []>([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (!signer) {
      return;
    }

    sdk.setProviderOrSigner(signer);
  }, [signer]);

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    bundleDropModule
      .getAllClaimerAddresses("0")
      .then((addresses) => {
        setMemberAddresses(addresses);
      })
      .catch((err) => {
        console.error("failed to get member list", err);
      });
  }, [hasClaimedNFT]);

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    tokenModule
      .getAllHolderBalances()
      .then((amounts) => {
        setMemberTokenAmounts(amounts);
      })
      .catch((err) => {
        console.error("failed to get token amounts", err);
      });
  }, [hasClaimedNFT]);

  const memberList = useMemo(() => {
    if (!memberTokenAmounts) {
      return;
    }

    return memberAddresses?.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          memberTokenAmounts[address] || 0,
          18
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  useEffect(() => {
    if (!address) {
      return;
    }

    bundleDropModule
      .balanceOf(address, "0")
      .then((balance) => {
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
        } else {
          setHasClaimedNFT(false);
        }
      })
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error("failed to nft balance", error);
      });
  }, [address]);

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    voteModule
      .getAll()
      .then((proposals) => {
        setProposals(proposals);
      })
      .catch((err) => {
        console.error("failed to get proposals", err);
      });
  }, [hasClaimedNFT]);

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    if (!proposals.length) {
      return;
    }

    voteModule
      .hasVoted(proposals[0].proposalId, address)
      .then((hasVoted) => {
        setHasVoted(hasVoted);
        if (hasVoted) {
          console.log("🥵 User has already voted");
        } else {
          console.log("🙂 User has not voted yet");
        }
      })
      .catch((err) => {
        console.error("failed to check if wallet has voted", err);
      });
  }, [hasClaimedNFT, proposals, address]);

  const mintNft = () => {
    setIsClaiming(true);

    bundleDropModule
      .claim("0", 1)
      .then(() => {
        setHasClaimedNFT(true);
        alert(
          `🌊 Successfully Minted! Check it our on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
        );
      })
      .catch((err) => {
        console.error("failed to claim", err);
      })
      .finally(() => {
        setIsClaiming(false);
      });
  };

  if (error instanceof UnsupportedChainIdError) {
    return (
      <div className="bg-white max-w-md w-full text-center flex flex-col shadow-sm rounded-lg overflow-hidden ring-1 ring-slate-900/5 p-8">
        <h2 className="text-xl mb-2">Please connect to Rinkeby</h2>
        <p>
          This dapp only works on the Rinkeby network, please switch networks in
          your connected wallet.
        </p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="bg-white max-w-md w-full text-center flex flex-col shadow-sm rounded-lg overflow-hidden ring-1 ring-slate-900/5 p-8">
        <h1 className="text-2xl mb-4">Welcome to SurfDAO 🏄‍♂️</h1>
        <button
          onClick={() => connectWallet("injected")}
          className="transition bg-blue-500 hover:bg-blue-700 text-white text-center py-2 px-4 rounded"
        >
          Connect your wallet
        </button>
      </div>
    );
  }

  if (hasClaimedNFT) {
    return (
      <div className="mx-auto">
        <h1 className="text-4xl text-center mb-8">SurfDAO 🏄‍♂️ member page</h1>
        <div className="flex justify-center items-start gap-4 max-w-3xl">
          <div className="bg-white w-full basis-2/6 text-center flex flex-col shadow-sm rounded-lg overflow-hidden ring-1 ring-slate-900/5  p-4">
            <h2 className="text-xl mb-3 font-medium">Member List</h2>
            <table>
              <thead>
                <tr className="text-slate-700">
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList?.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-white w-full basis-4/6 text-center flex flex-col shadow-sm rounded-lg overflow-hidden ring-1 ring-slate-900/5  p-4">
            <h2 className="text-xl mb-3 font-medium">Active Proposals</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                setIsVoting(true);

                const votes = proposals?.map((proposal: Proposal) => {
                  let voteResult = {
                    proposalId: proposal.proposalId,
                    vote: 2,
                  };
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(
                      proposal.proposalId + "-" + vote.type
                    );

                    // @ts-ignore
                    if (elem.checked) {
                      voteResult.vote = vote.type;
                      return;
                    }
                  });
                  return voteResult;
                });

                try {
                  const delegation = await tokenModule.getDelegationOf(address);
                  if (delegation === ethers.constants.AddressZero) {
                    await tokenModule.delegateTo(address);
                  }

                  try {
                    await Promise.all(
                      votes.map(async (vote) => {
                        const proposal = await voteModule.get(vote.proposalId);
                        if (proposal.state === 1) {
                          return voteModule.vote(vote.proposalId, vote.vote);
                        }

                        return;
                      })
                    );
                    try {
                      await Promise.all(
                        votes.map(async (vote) => {
                          const proposal = await voteModule.get(
                            vote.proposalId
                          );

                          if (proposal.state === 4) {
                            return voteModule.execute(vote.proposalId);
                          }
                        })
                      );

                      setHasVoted(true);
                      alert("successfully voted");
                    } catch (err) {
                      console.error("failed to execute votes", err);
                    }
                  } catch (err) {
                    console.error("failed to vote", err);
                  }
                } catch (err) {
                  console.error("failed to delegate tokens");
                } finally {
                  setIsVoting(false);
                }
              }}
            >
              {proposals?.map((proposal: Proposal) => (
                <div key={proposal.proposalId} className="mb-4">
                  <h5 className="mb-0.5 text-slate-800">
                    {proposal.description}
                  </h5>
                  <div className="flex justify-between px-24">
                    {proposal.votes.map((vote) => (
                      <div key={vote.type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + vote.type}
                          name={proposal.proposalId}
                          value={vote.type}
                          defaultChecked={vote.type === 2}
                        />
                        <label
                          htmlFor={proposal.proposalId + "-" + vote.type}
                          className="text-slate-800 pl-1"
                        >
                          {vote.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex flex-col">
                <button
                  disabled={isVoting || hasVoted}
                  type="submit"
                  className="text-white bg-gray-800 hover:bg-gray-900 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  {isVoting
                    ? "Voting..."
                    : hasVoted
                    ? "You Already Voted"
                    : "Submit Votes"}
                </button>
                <small className="mt-2">
                  This will trigger multiple transactions that you will need to
                  sign.
                </small>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white max-w-md w-full text-center flex flex-col shadow-sm rounded-lg overflow-hidden ring-1 ring-slate-900/5 p-8">
      <h1 className="text-2xl mb-4">
        Mint your free SurfDAO 🏄‍♂️ Membership NFT
      </h1>
      <button
        className="text-white bg-gray-800 hover:bg-gray-900 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        disabled={isClaiming}
        onClick={mintNft}
      >
        {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
      </button>
    </div>
  );
};

const Home: NextPage = () => {
  return (
    <div className="min-h-screen flex justify-center items-start py-36 bg-gradient-to-r from-rose-100 to-teal-100">
      <App />
    </div>
  );
};

export default Home;
