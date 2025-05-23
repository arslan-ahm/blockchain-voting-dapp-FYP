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
  
  try {
    // Get the current campaign ID counter
    const nextCampaignId = await contract.nextCampaignId();
    const totalCampaigns = Number(nextCampaignId) - 1; // Since nextCampaignId starts from 1
    
    // If no campaigns exist yet, return empty array
    if (totalCampaigns < 1) {
      console.log("No campaigns created yet");
      return campaigns;
    }

    // Fetch campaigns from 1 to totalCampaigns
    for (let i = 1; i <= totalCampaigns; i++) {
      try {
        const [startDate, endDate, winner, isOpen, detailsIpfsHash, voters, candidates] = await contract.getCampaignDetails(i);
        
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
      } catch (error) {
        console.log(`Error fetching campaign details for ID ${i}:`, error);
        // Continue to next campaign instead of breaking
        continue;
      }
    }
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    throw error;
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
      // Get the campaign ID that will be created
      const nextCampaignId = await contract.nextCampaignId();
      const campaignId = Number(nextCampaignId);
      
      const tx = await contract.createCampaign(startDate, endDate, detailsIpfsHash);
      await tx.wait();
      
      toast.success("Campaign created");
      return { 
        id: campaignId, 
        startDate, 
        endDate, 
        winner: ethers.ZeroAddress, 
        isOpen: true, 
        detailsIpfsHash, 
        voters: [], 
        candidates: [] 
      };
    } catch (error) {
      console.error("Failed to create campaign:", error);
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
      console.error("Failed to delete campaign:", error);
      toast.error("Failed to delete campaign");
      throw error;
    }
  }
);

export const checkUpkeep = createAsyncThunk(
  "campaign/checkUpkeep",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const provider = state.user.signer?.provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, provider);

    try {
      const [upkeepNeeded, performData] = await contract.checkUpkeep("0x");
      if (upkeepNeeded) {
        const campaignId = Number(ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], performData)[0]);
        toast.info(`Campaign ${campaignId} needs upkeep`);
        return { campaignId, upkeepNeeded: true };
      }
      return { campaignId: 0, upkeepNeeded: false };
    } catch (error) {
      console.error("Failed to check upkeep:", error);
      toast.error("Failed to check upkeep");
      throw error;
    }
  }
);

export const performUpkeep = createAsyncThunk(
  "campaign/performUpkeep",
  async (campaignId: number, { getState }) => {
    const state = getState() as RootState;
    const signer = state.user.signer;
    if (!signer) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

    try {
      const performData = ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [campaignId]);
      const tx = await contract.performUpkeep(performData);
      await tx.wait();
      toast.success(`Campaign ${campaignId} closed`);
      return campaignId;
    } catch (error) {
      console.error("Failed to perform upkeep:", error);
      toast.error("Failed to perform upkeep");
      throw error;
    }
  }
);

export const hasActiveCampaign = createAsyncThunk(
  "campaign/hasActiveCampaign",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const provider = state.user.signer?.provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, provider);

    try {
      const hasActive = await contract.hasActiveCampaign();
      return hasActive;
    } catch (error) {
      console.error("Failed to check active campaigns:", error);
      toast.error("Failed to check active campaigns");
      throw error;
    }
  }
);

// Additional helper thunk to get the current active campaign
export const getActiveCampaign = createAsyncThunk(
  "campaign/getActiveCampaign",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const provider = state.user.signer?.provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, provider);

    try {
      const hasActive = await contract.hasActiveCampaign();
      if (!hasActive) {
        return null;
      }

      // Find the active campaign
      const nextCampaignId = await contract.nextCampaignId();
      const totalCampaigns = Number(nextCampaignId) - 1;
      
      for (let i = 1; i <= totalCampaigns; i++) {
        try {
          const [startDate, endDate, winner, isOpen, detailsIpfsHash, voters, candidates] = await contract.getCampaignDetails(i);
          if (isOpen) {
            return {
              id: i,
              startDate: Number(startDate),
              endDate: Number(endDate),
              winner,
              isOpen,
              detailsIpfsHash,
              voters,
              candidates,
            };
          }
        } catch (error) {
          console.log(`Error fetching campaign ${i}:`, error);
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Failed to get active campaign:", error);
      throw error;
    }
  }
);