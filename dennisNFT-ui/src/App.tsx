import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { NFTBurnSelector } from "./FetchNFTs";

export const PACKAGE_ID =
  "0x9688773ae64878a692ed9d77a488f79ed73a6dd47dffabd4a230fe4cc41d2d83";

function App() {
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

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
          window.location.reload();
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
  // const client = new SuiClient({ url: getFullnodeUrl("testnet") });

  // const handleBurnNft = async () => {
  //   if (!account?.address) {
  //     alert("Connect wallet first");
  //     return;
  //   }

  //   try {
  //     const objects = await client.getOwnedObjects({
  //       owner: account.address,
  //       options: {
  //         showContent: true,
  //         showType: true,
  //       },
  //     });

  //     const burnableObjects = objects.data.filter((obj) => {
  //       const type = obj.data?.type || "";

  //       return (
  //         type.includes("::DennisNFT") ||
  //         type.includes("::SomeOtherNFT") ||
  //         type.includes("::MyNFT")
  //       );
  //     });

  //     if (burnableObjects.length === 0) {
  //       alert("No burnable NFTs found");
  //       return;
  //     }

  //     const tx = new Transaction();

  //     for (const obj of burnableObjects) {
  //       if (!obj.data?.objectId || !obj.data?.type) continue;

  //       const objectType = obj.data.type;

  //       tx.moveCall({
  //         target: `${PACKAGE_ID}::dennisnft::burn_nft`,
  //         typeArguments: [objectType],
  //         arguments: [tx.object(obj.data.objectId)],
  //       });
  //     }

  //     const result = await signAndExecuteTransaction({
  //       transaction: tx,
  //       chain: "sui:testnet",
  //     });

  //     console.log("Burn success:", result);
  //     alert(`Successfully burned ${burnableObjects.length} NFT(s)!`);
  //   } catch (error) {
  //     console.error("Burn failed:", error);
  //     // alert(`Error burning NFT: ${error.message || error}`);
  //   }
  // };

  const isFormValid =
    name.trim().length > 0 &&
    description.trim().length > 0 &&
    imageUrl.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-black text-slate-100">
      <header className="w-full backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <a href="/">
                <img
                  src="/dennisnft-logo.png"
                  alt="DennisNFT Logo"
                  className="w-20 h-auto" // Adjust width as needed
                />
              </a>
              <p className="text-xs text-slate-500">Mint or Burn NFTs on Sui</p>
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
            <h2 className="text-base text-black font-semibold mb-4">
              Mint a new NFT
            </h2>

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
                  className="w-full rounded-xl border border-slate-300 bg-white text-slate-800 
px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 placeholder-slate-400"
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
                  className="w-full rounded-xl border border-slate-300 bg-white text-slate-800 
px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 placeholder-slate-400"
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
                  className="w-full rounded-xl border border-slate-300 bg-white text-slate-800 
px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 placeholder-slate-400"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Make sure the URL is publicly accessible (IPFS/HTTPS).
                </p>
              </div>

              <button
                onClick={handleMint}
                disabled={!account || !isFormValid || minting}
                className="w-full rounded-2xl font-semibold py-2.5 
border border-indigo-500 shadow-sm 
bg-indigo-600 text-white 
hover:bg-indigo-700 active:scale-[0.99] 
disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {minting ? "Minting…" : "Mint NFT"}
              </button>

              {!account && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  Connect a wallet to mint.
                </p>
              )}

              {/* <button
                className="w-full rounded-2xl font-semibold py-2.5 border border-slate-300 shadow-sm bg-slate-900 text-white hover:opacity-95 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition"
                onClick={handleBurnNft}
              >
                Burn NFT
              </button> */}
            </div>
          </div>

          {/* Preview card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-black mb-4">
              Live preview
            </h2>
            <div className="space-y-3">
              <div className="aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 grid place-items-center">
                {imageUrl ? (
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
      <div className="max-w-5xl mx-auto">
        <NFTBurnSelector
          account={account}
          signAndExecuteTransaction={signAndExecuteTransaction}
        />
      </div>
      <footer className="py-8 text-center text-xs text-slate-500">
        Built with Sui • Tailwind • Vite
      </footer>
    </div>
  );
}

export default App;
