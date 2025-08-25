import { searchAssets } from '@helium/spl-utils';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';

export const verifyDewiOwner = async (address: string) => {
  // Verify if provided wallet owns a DeWiCat
  const DEWICAT_COLLECTION = process.env.COLLECTION_MINT;

  const connection = new Connection(clusterApiUrl('mainnet-beta'));
  const publicKey = new PublicKey(address);

  const items = await searchAssets(connection.rpcEndpoint, {
    ownerAddress: publicKey.toBase58(),
    creatorVerified: true,
    grouping: ['collection', DEWICAT_COLLECTION],
  });

  const hasDewiCat = items.length > 0;

  return hasDewiCat;
};
