// src/hooks/useWallet.ts
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";

export function useWallet() {
  const account = useCurrentAccount();
  
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  const connect = () => {
    console.warn("Use the <ConnectButton /> in your component to connect.");
  };

  const disconnect = () => {
    localStorage.clear();
    window.location.reload();
  };

  return {
    address: account?.address || null,
    signer: signAndExecuteTransaction,
    connect,
    disconnect,
  };
}