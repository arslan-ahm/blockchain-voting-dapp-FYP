import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI } from "../../constants/contract";
import { toast } from "sonner";

export const submitVote = createAsyncThunk(
  "vote/submitVote",
  async ({ campaignId, candidate }: { campaignId: number; candidate: string }, { getState }) => {
    const state = getState() as { user: { signer: ethers.Signer | null } };
    const signer = state.user.signer;
    if (!signer) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

    try {
      const tx = await contract.vote(campaignId, candidate);
      const receipt = await tx.wait();
      toast.success("Vote submitted successfully");
      return receipt.transactionHash;
    } catch (error) {
      toast.error("Failed to submit vote");
      throw error;
    }
  }
);

export const registerForCampaign = createAsyncThunk(
  "vote/registerForCampaign",
  async (campaignId: number, { getState }) => {
    const state = getState() as { user: { signer: ethers.Signer | null } };
    const signer = state.user.signer;
    if (!signer) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

    try {
      const tx = await contract.registerForCampaign(campaignId);
      await tx.wait();
      toast.success("Registered for campaign");
    } catch (error) {
      toast.error("Failed to register for campaign");
      throw error;
    }
  }
);