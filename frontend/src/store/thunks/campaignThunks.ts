import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI } from "../../constants/contract";
import { toast } from "sonner";
import type { Campaign } from "../../types";
import type { RootState } from "../store";

export const fetchCampaigns = createAsyncThunk("campaign/fetchCampaigns", async (_, { getState }) => {
  const state = getState() as RootState;
  const provider = state.user.signer?.provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
  const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, provider);

  const campaigns: Campaign[] = [];
  for (let i = 1; i <= 100; i++) {
    try {
      const [startDate, endDate, winner, isOpen, detailsIpfsHash, voters, candidates] = await contract.getCampaignDetails(i);
      if (startDate > 0) {
        campaigns.push({
          id: i,
          startDate: Number(startDate),
          endDate: Number(endDate),
          winner,
          isOpen,
          detailsIpfsHash,
          voters,
          candidates,
        });
      }
    } catch (error) {
      console.log("Error fetching campaign details for ID:", i, error);
      break;
    }
  }
  return campaigns;
});

export const createCampaign = createAsyncThunk(
  "campaign/createCampaign",
  async ({ startDate, endDate, detailsIpfsHash }: { startDate: number; endDate: number; detailsIpfsHash: string }, { getState }) => {
    const state = getState() as RootState;
    const signer = state.user.signer;
    if (!signer) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

    try {
      const tx = await contract.createCampaign(startDate, endDate, detailsIpfsHash);
      await tx.wait();
      const campaignId = Number((await contract.nextCampaignId()) - 1);
      toast.success("Campaign created");
      return { id: campaignId, startDate, endDate, winner: ethers.ZeroAddress, isOpen: true, detailsIpfsHash, voters: [], candidates: [] };
    } catch (error) {
      toast.error("Failed to create campaign");
      throw error;
    }
  }
);

export const deleteCampaign = createAsyncThunk(
  "campaign/deleteCampaign",
  async (campaignId: number, { getState }) => {
    const state = getState() as RootState;
    const signer = state.user.signer;
    if (!signer) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

    try {
      const tx = await contract.deleteCampaign(campaignId);
      await tx.wait();
      toast.success("Campaign deleted");
      return campaignId;
    } catch (error) {
      toast.error("Failed to delete campaign");
      throw error;
    }
  }
);