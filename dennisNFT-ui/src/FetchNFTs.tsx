import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID } from "./App";
import { useEffect, useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";

const client = new SuiClient({ url: getFullnodeUrl("testnet") });

// Interface for NFT data
interface NFTData {
  objectId: string;
  type: string;
  name?: string;
  description?: string;
  url?: string;
  display?: any;
}

// Fetch all burnable NFTs with their metadata
export async function FetchBurnableNFTs(address: string): Promise<NFTData[]> {
  const objects = await client.getOwnedObjects({
    owner: address,
    options: {
      showContent: true,
      showType: true,
      showDisplay: true,
    },
  });

  return objects.data
    .filter((obj) => {
      const type = obj.data?.type || "";
      // Add your NFT type patterns here
      return (
        type.includes("::DennisNFT") ||
        type.includes("::SomeOtherNFT") ||
        type.includes("::MyNFT")
      );
    })
    .map((obj) => ({
      objectId: obj.data!.objectId,
      type: obj.data!.type!,
      name: obj.data?.display?.data?.name || "Unknown NFT",
      description: obj.data?.display?.data?.description || "",
      url: obj.data?.display?.data?.image_url || "",
      display: obj.data?.display,
    }))
    .filter((nft) => nft.objectId);
}

export const createBurnTransaction = (selectedNFTs: NFTData[]): Transaction => {
  if (selectedNFTs.length === 0) {
    throw new Error("No NFTs selected for burning");
  }

  const tx = new Transaction();

  for (const nft of selectedNFTs) {
    tx.moveCall({
      target: `${PACKAGE_ID}::dennisnft::burn_nft`,
      typeArguments: [nft.type],
      arguments: [tx.object(nft.objectId)],
    });
  }

  return tx;
};

// Burn selected NFTs
export const burnSelectedNFTs = async (selectedNFTs: NFTData[]) => {
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const account = useCurrentAccount();

  if (!account?.address) {
    throw new Error("Wallet not connected");
  }

  if (selectedNFTs.length === 0) {
    throw new Error("No NFTs selected for burning");
  }

  const tx = new Transaction();

  for (const nft of selectedNFTs) {
    tx.moveCall({
      target: `${PACKAGE_ID}::dennisnft::burn_nft`,
      typeArguments: [nft.type],
      arguments: [tx.object(nft.objectId)],
    });
  }

  const result = await signAndExecuteTransaction({
    transaction: tx,
    chain: "sui:testnet",
  });

  return result;
};

interface NFTBurnSelectorProps {
  account: { address: string } | null;
  signAndExecuteTransaction: (args: {
    transaction: Transaction;
    chain?: `${string}:${string}`;
    [key: string]: any;
  }) => void;
}
// React component for NFT selection (example)
export const NFTBurnSelector = ({
  account,
  signAndExecuteTransaction,
}: NFTBurnSelectorProps) => {
  // const account = useCurrentAccount();
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [selectedNFTs, setSelectedNFTs] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(false);

  // Load NFTs
  const loadNFTs = async () => {
    if (!account?.address) return;

    setLoading(true);
    try {
      const fetchedNFTs = await FetchBurnableNFTs(account.address);
      setNfts(fetchedNFTs);
    } catch (error) {
      console.error("Failed to load NFTs:", error);
      alert("Failed to load NFTs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNFTs();
  }, [account?.address]);

  // Toggle NFT selection
  const toggleNFTSelection = (nft: NFTData) => {
    setSelectedNFTs((prev) => {
      const isSelected = prev.some(
        (selected) => selected.objectId === nft.objectId
      );
      if (isSelected) {
        return prev.filter((selected) => selected.objectId !== nft.objectId);
      } else {
        return [...prev, nft];
      }
    });
  };

  // Handle burn
  const handleBurn = async () => {
    if (!account?.address) {
      alert("Please connect your wallet first");
      return;
    }

    if (selectedNFTs.length === 0) {
      alert("Please select NFTs to burn");
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to burn ${selectedNFTs.length} NFT(s)? This action cannot be undone.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      // Create transaction using utility function
      const tx = createBurnTransaction(selectedNFTs);

      // Execute transaction using the passed function
      await signAndExecuteTransaction({
        transaction: tx,
        chain: "sui:testnet",
        requestType: "WaitForLocalExecution",
      });

      console.log("Burn success:");
      alert(`Successfully burned ${selectedNFTs.length} NFT(s)!`);
      window.location.reload();
      await loadNFTs();
      setSelectedNFTs([]);
      await loadNFTs(); // Refresh the list
    } catch (error) {
      console.error("Burn failed:", error);
      alert(`Failed to burn NFTs`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select NFTs to Burn</h3>
        <button
          onClick={loadNFTs}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 shadow-sm bg-gray-50 hover:bg-gray-100 disabled:opacity-60"
        >
          {loading ? "Loading..." : "Refresh NFTs"}
        </button>
      </div>

      {nfts.length === 0 ? (
        <p className="text-gray-500">No burnable NFTs found</p>
      ) : (
        <>
          {/* NFT grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {nfts.map((nft) => {
              const selected = selectedNFTs.some(
                (s) => s.objectId === nft.objectId
              );
              return (
                <div
                  key={nft.objectId}
                  onClick={() => toggleNFTSelection(nft)}
                  className={`relative cursor-pointer border rounded-xl p-3 transition 
                ${
                  selected
                    ? "border-red-500 ring-2 ring-red-400"
                    : "border-gray-200 hover:border-gray-400"
                }
              `}
                >
                  {nft.url && (
                    <img
                      src={nft.url}
                      alt={nft.name}
                      className="w-full h-40 object-cover rounded-md"
                    />
                  )}
                  <div className="mt-2 space-y-1">
                    <h4 className="font-semibold text-gray-800">{nft.name}</h4>
                    <p className="text-sm text-gray-600">{nft.description}</p>
                    <small className="text-gray-400 block">
                      {nft.objectId.slice(0, 8)}...
                    </small>
                  </div>

                  {/* Selection indicator */}
                  <div className="absolute top-2 right-2 bg-white rounded-full shadow px-2 py-1 text-sm font-medium">
                    {selected ? "✓" : "○"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-700">
              {selectedNFTs.length} NFT(s) selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedNFTs(nfts)}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 disabled:opacity-60"
              >
                Select All
              </button>
              <button
                onClick={() => setSelectedNFTs([])}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 disabled:opacity-60"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBurn}
                disabled={loading || selectedNFTs.length === 0}
                className="px-4 py-2 text-sm font-medium rounded-lg shadow bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
              >
                Burn Selected ({selectedNFTs.length})
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
