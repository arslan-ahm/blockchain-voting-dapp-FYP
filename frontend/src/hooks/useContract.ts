import { useMemo } from "react";
import { ethers } from "ethers";
import { VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI } from "../constants/contract";

export const useContract = (signerOrProvider?: ethers.Signer | ethers.Provider) => {
  return useMemo(() => {
    if (!signerOrProvider) return null;
    return new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signerOrProvider);
  }, [signerOrProvider]);
};