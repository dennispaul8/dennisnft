import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { PACKAGE_ID } from "./App";

const client = new SuiClient({ url: getFullnodeUrl("testnet") });

export async function FetchNFTs(address: string): Promise<string[]> {
  const objects = await client.getOwnedObjects({
    owner: address,
    filter: { StructType: `${PACKAGE_ID}::dennisnft::DennisNFT` },
    options: { showContent: true },
  });

  return objects.data
    .map((obj) => obj.data?.objectId)
    .filter((id): id is string => !!id);
}
