import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useWallet } from "./hooks/useWallet";
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { FetchNFTs } from "./FetchNFTs";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

export const PACKAGE_ID =
  "0x25c51a1aa26f60f562b02f59ebfb124acdee3844401d66d98cb76bd0fc33bc09";

function App() {
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  // const { signer: signAndExecuteTransaction } = useWallet();
  const account = useCurrentAccount();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [minting, setMinting] = useState(false);

  const handleMint = () => {
    if (!account || minting) return;
    setMinting(true);

    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::dennisnft::mint`,
      arguments: [
        tx.pure.string(name),
        tx.pure.string(description),
        tx.pure.string(imageUrl),
      ],
    });

    signAndExecuteTransaction(
      {
        transaction: tx,
        chain: "sui:testnet",
      },
      {
        onSuccess: (result) => {
          console.log("Mint success:", result);
          alert("NFT Minted successfully!");
          setName("");
          setDescription("");
          setImageUrl("");
        },
        onError: (err) => {
          console.error("Mint failed:", err);
          alert("Mint failed!");
        },
        onSettled: () => {
          setMinting(false);
        },
      }
    );
  };
  const client = new SuiClient({ url: getFullnodeUrl("testnet") });
  const handleBurnNft = async () => {
    if (!account?.address) {
      alert("Connect wallet first");
      return;
    }

    try {
      const nftIds = await FetchNFTs(account.address);
      if (!nftIds || nftIds.length === 0) {
        alert("No NFTs found to burn");
        return;
      }

      const objects = await client.getOwnedObjects({
        owner: account.address,
        options: { showContent: true },
      });

      // Build transaction block
      const tx = new Transaction();
      for (const obj of objects.data) {
        const type = obj.data?.type || "";
        if (type.includes("::DennisNFT") || type.includes("::SomeOtherNFT")) {
          tx.moveCall({
            target: `${PACKAGE_ID}::dennisnft::burn_any`, // now accepts any object type
            typeArguments: [type], // pass the type dynamically
            arguments: [tx.object(obj.data!.objectId)],
          });
        }
      }

      // Execute
      await signAndExecuteTransaction({
        transaction: tx,
        chain: "sui:testnet",
      });

      console.log("Burn success:");
      alert("NFT burned successfully!");
    } catch (error) {
      console.error("Burn failed:", error);
      alert("Error burning NFT");
    }
  };

  const isFormValid =
    name.trim().length > 0 &&
    description.trim().length > 0 &&
    imageUrl.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      <header className="w-full border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-slate-900 text-white grid place-items-center font-bold">
              D
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                DennisNFT
              </h1>
              <p className="text-xs text-slate-500">Mint example on Sui</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Form card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-semibold mb-4">Mint a new NFT</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dennis Genesis"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your NFT"
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://…/image.png"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-slate-200 focus:border-slate-400"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Make sure the URL is publicly accessible (IPFS/HTTPS).
                </p>
              </div>

              <button
                onClick={handleMint}
                disabled={!account || !isFormValid || minting}
                className="w-full rounded-2xl font-semibold py-2.5 border border-slate-300 shadow-sm bg-slate-900 text-white hover:opacity-95 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {minting ? "Minting…" : "Mint NFT"}
              </button>

              {!account && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  Connect a wallet to mint.
                </p>
              )}

              <button
                className="w-full rounded-2xl font-semibold py-2.5 border border-slate-300 shadow-sm bg-slate-900 text-white hover:opacity-95 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition"
                onClick={handleBurnNft}
              >
                Burn NFT
              </button>
            </div>
          </div>

          {/* Preview card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-semibold mb-4">Live preview</h2>
            <div className="space-y-3">
              <div className="aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 grid place-items-center">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-xs text-slate-400">
                    Image preview shows here
                  </span>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-700">Name:</span>
                  <span className="text-slate-600">{name || "—"}</span>
                </div>
                <div className="flex items-start gap-2 mt-2">
                  <span className="font-medium text-slate-700">
                    Description:
                  </span>
                  <span className="text-slate-600">{description || "—"}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-medium text-slate-700">Creator:</span>
                  <span className="text-slate-600">
                    {account?.address
                      ? `${account?.address.slice(
                          0,
                          6
                        )}…${account.address.slice(-6)}`
                      : "—"}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                This is a visual preview only. Actual on-chain metadata is
                defined by your Move module.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-xs text-slate-500">
        Built with Sui • Tailwind • Vite
      </footer>
    </div>
  );
}

export default App;
