import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { type VerificationRequest, Role, RequestStatus } from "../../types";
import { toast } from "sonner";
import type { RootState } from "../store";
import { VOTING_CONTRACT_ABI, VOTING_CONTRACT_ADDRESS } from "../../constants/contract";

export const requestVerification = createAsyncThunk(
  "verification/requestVerification",
  async ({ role, docIpfsHash }: { role: Role; docIpfsHash: string }, { getState }) => {
    const state = getState() as RootState;
    const signer = state.user.signer;
    if (!signer) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

    try {
      const tx = await contract.requestVerification(role, docIpfsHash);
      await tx.wait();
      toast.success("Verification requested");
    } catch (error) {
      toast.error("Failed to request verification");
      throw error;
    }
  }
);

export const fetchVerificationRequests = createAsyncThunk(
  "verification/fetchVerificationRequests",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const provider = state.user.provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, provider);

    try {
      const [userAddresses, requestedRoles, verificationDocIpfsHashes, adminFeedbacks] = await contract.getPendingVerificationRequests();
      const requests: VerificationRequest[] = userAddresses.map((address: string, index: number) => ({
        userAddress: address,
        requestedRole: requestedRoles[index],
        status: RequestStatus.Pending,
        verificationDocIpfsHash: verificationDocIpfsHashes[index],
        adminFeedback: adminFeedbacks[index],
      }));
      return requests;
    } catch (error) {
      toast.error("Failed to fetch verification requests");
      throw error;
    }
  }
);

export const processVerification = createAsyncThunk(
  "verification/processVerification",
  async ({ userAddress, approved, feedback }: { userAddress: string; approved: boolean; feedback: string }, { getState }) => {
    const state = getState() as RootState;
    const signer = state.user.signer;
    if (!signer) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

    try {
      const tx = await contract.processVerification(userAddress, approved, feedback);
      await tx.wait();
      toast.success(`Verification ${approved ? "approved" : "rejected"}`);
      return { userAddress };
    } catch (error) {
      toast.error("Failed to process verification");
      throw error;
    }
  }
);