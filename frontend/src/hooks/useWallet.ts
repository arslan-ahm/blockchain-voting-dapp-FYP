import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";

export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const connect = useCallback(async () => {
    try {
      if (!window.ethereum) {
        toast.error("Please install MetaMask");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      setAccount(accounts[0]);
      setProvider(provider);
      setSigner(signer);
      toast.success("Wallet connected");
    } catch (error) {
      toast.error("Failed to connect wallet");
      console.error(error);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    toast.info("Wallet disconnected");
  }, []);

  return { account, provider, signer, connect, disconnect };
};