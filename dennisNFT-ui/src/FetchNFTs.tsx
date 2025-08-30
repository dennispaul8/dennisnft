import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useEffect } from "react";

function FetchNFTs() {
  const account = useCurrentAccount();

  // Query all objects owned by the connected wallet
  const { data, isLoading, error } = useSuiClientQuery("getOwnedObjects", {
    owner: account?.address || "", // connected wallet address
    options: { showType: true }, // ensure we fetch object type
  });

  useEffect(() => {
    if (data && account) {
      // Filter for only your NFT type if known:
      // Replace `0xYourPackage::module::NFT` with your NFT struct type
      const nftObjects = data.data.filter((obj: any) =>
        obj.data?.type?.includes("0xYourPackage::module::NFT")
      );
      console.log(
        "NFT Object IDs:",
        nftObjects.map((nft: any) => nft.data.objectId)
      );
    }
  }, [data, account]);

  if (!account) return <p>Connect your wallet to see NFTs.</p>;
  if (isLoading) return <p>Loading NFTs…</p>;
  if (error) return <p>Error loading NFTs: {error.message}</p>;

  return (
    <div>
      <h2 className="font-semibold text-lg">Your NFTs</h2>
      <ul>
        {data?.data
          ?.filter((obj: any) =>
            obj.data?.type?.includes("0xYourPackage::module::NFT")
          )
          .map((nft: any) => (
            <li key={nft.data.objectId}>{nft.data.objectId}</li>
          ))}
      </ul>
    </div>
  );
}

export default FetchNFTs;
