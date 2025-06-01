import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI } from "../../constants/contract";
import { toast } from "sonner";
import type { Campaign } from "../../types";
import type { RootState } from "../store";

// Helper function to get signer from window.ethereum
const getCurrentSigner = async (): Promise<ethers.Signer | null> => {
  try {
    if (!window.ethereum) return null;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_accounts', []);
    if (accounts.length === 0) return null;
    return await provider.getSigner();
  } catch (error) {
    console.error('Failed to get current signer:', error);
    return null;
  }
};

// Helper function to get provider
const getProvider = (): ethers.Provider => {
  if (window.ethereum) {
    try {
      return new ethers.BrowserProvider(window.ethereum);
    } catch (error) {
      console.warn('Failed to create BrowserProvider, falling back to JsonRpcProvider:', error);
    }
  }
  return new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
};

export const fetchCampaigns = createAsyncThunk("campaign/fetchCampaigns", async () => {
  const provider = getProvider();
  const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, provider);

  const campaigns: Campaign[] = [];

  try {
    // Check if contract is deployed and accessible
    const code = await provider.getCode(VOTING_CONTRACT_ADDRESS);
    if (code === '0x') {
      console.warn('Contract not deployed at address:', VOTING_CONTRACT_ADDRESS);
      return campaigns;
    }

    // Get the current campaign ID counter with error handling
    let nextCampaignId;
    try {
      nextCampaignId = await contract.nextCampaignId();
    } catch (error) {
      console.error('Failed to call nextCampaignId:', error);
      // Try alternative method or return empty if contract method doesn't exist
      return campaigns;
    }

    const totalCampaigns = Number(nextCampaignId) - 1;

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
  async ({ startDate, endDate, detailsIpfsHash }: { 
    startDate: number; 
    endDate: number; 
    detailsIpfsHash: string 
  }, { getState, rejectWithValue }) => {
    
    const state = getState() as RootState;
    
    // Get current signer
    const signer = await getCurrentSigner();
    
    console.log("Debug wallet connection:", {
      signerExists: !!signer,
      signerConnected: state.user.signerConnected,
      account: state.user.account,
      providerConnected: state.user.providerConnected
    });

    if (!signer) {
      return rejectWithValue("Wallet not connected - please connect your wallet first");
    }

    if (!state.user.account) {
      return rejectWithValue("No account found - please connect your wallet");
    }

    try {
      // Check if contract is deployed
      const provider = getProvider();
      const code = await provider.getCode(VOTING_CONTRACT_ADDRESS);
      if (code === '0x') {
        return rejectWithValue("Contract not deployed - please check contract address");
      }

      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

      // Debug admin access
      const signerAddress = await signer.getAddress();
      let contractAdmin;
      try {
        contractAdmin = await contract.admin();
      } catch (error) {
        console.error('Failed to get contract admin:', error);
        return rejectWithValue("Failed to verify admin access - contract may not be properly deployed");
      }
      
      console.log("Admin verification:", {
        signerAddress,
        contractAdmin,
        isAdmin: signerAddress.toLowerCase() === contractAdmin.toLowerCase()
      });
      
      if (signerAddress.toLowerCase() !== contractAdmin.toLowerCase()) {
        return rejectWithValue(
          `Access denied: Only admin can create campaigns.\nConnected: ${signerAddress}\nRequired: ${contractAdmin}\n\nPlease switch to the admin account in MetaMask.`
        );
      }

      // Check for existing campaigns
      let nextId;
      try {
        nextId = await contract.nextCampaignId();
      } catch (error) {
        console.error('Failed to get nextCampaignId:', error);
        return rejectWithValue("Failed to read contract state - please try again");
      }
      
      console.log("Next campaign ID will be:", nextId.toString());

      // Check for overlapping campaigns
      console.log("Checking for campaign overlaps...");
      for (let i = 1; i < Number(nextId); i++) {
        try {
          const campaignDetails = await contract.getCampaignDetails(i);
          const existingStart = Number(campaignDetails.startDate);
          const existingEnd = Number(campaignDetails.endDate);
          const isOpen = campaignDetails.isOpen;
          
          console.log(`Campaign ${i}:`, {
            startDate: existingStart,
            endDate: existingEnd,
            isOpen,
            startDateReadable: new Date(existingStart * 1000).toLocaleString(),
            endDateReadable: new Date(existingEnd * 1000).toLocaleString()
          });

          if (isOpen) {
            const isOverlapping = !(endDate < existingStart || startDate > existingEnd);
            if (isOverlapping) {
              return rejectWithValue(
                `Campaign dates overlap with existing campaign ${i}.\nExisting: ${new Date(existingStart * 1000).toLocaleDateString()} - ${new Date(existingEnd * 1000).toLocaleDateString()}\nNew: ${new Date(startDate * 1000).toLocaleDateString()} - ${new Date(endDate * 1000).toLocaleDateString()}`
              );
            }
          }
        } catch (error) {
          console.log(`Campaign ${i} doesn't exist or is inaccessible:`, error);
        }
      }

      // Validate dates
      if (endDate <= startDate) {
        return rejectWithValue("End date must be after start date");
      }

      const now = Math.floor(Date.now() / 1000);
      if (startDate < now) {
        return rejectWithValue("Start date cannot be in the past");
      }

      console.log("Date validation:", {
        startDate,
        endDate,
        startDateReadable: new Date(startDate * 1000).toLocaleString(),
        endDateReadable: new Date(endDate * 1000).toLocaleString(),
        now,
        nowReadable: new Date(now * 1000).toLocaleString()
      });

      // Estimate gas
      console.log("Estimating gas...");
      let gasEstimate;
      try {
        gasEstimate = await contract.createCampaign.estimateGas(startDate, endDate, detailsIpfsHash);
        console.log("Gas estimate:", gasEstimate.toString());
      } catch (error) {
        console.warn("Gas estimation failed, using default gas limit:", error);
        gasEstimate = BigInt(500000); // Default gas limit
      }

      // Create transaction with gas buffer
      console.log("Sending transaction...");
      const tx = await contract.createCampaign(startDate, endDate, detailsIpfsHash, {
        gasLimit: gasEstimate * 120n / 100n // 20% buffer
      });

      console.log("Transaction sent:", {
        hash: tx.hash,
        from: tx.from,
        to: tx.to
      });

      // Wait for confirmation
      console.log("Waiting for confirmation...");
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", {
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString(),
        status: receipt.status
      });

      // Parse events to get the actual campaign ID
      let campaignId = Number(nextId);
      try {
        const campaignCreatedEvent = receipt.logs.find((log: ethers.Log) => {
          try {
            const parsed = contract.interface.parseLog(log);
            return parsed !== null && parsed.name === 'CampaignCreated';
          } catch {
            return false;
          }
        });

        if (campaignCreatedEvent) {
          const parsed = contract.interface.parseLog(campaignCreatedEvent);
          if (parsed !== null) {
            campaignId = Number(parsed.args?.campaignId || nextId);
            console.log("Campaign ID from event:", campaignId);
          }
        }
      } catch (eventError) {
        console.warn("Could not parse campaign created event:", eventError);
      }

      const newCampaign = {
        id: campaignId,
        startDate,
        endDate,
        winner: ethers.ZeroAddress,
        isOpen: true,
        detailsIpfsHash,
        voters: [],
        candidates: []
      };

      console.log("Campaign created successfully:", newCampaign);
      return newCampaign;

    } catch (error) {
      console.error("Failed to create campaign:", error);

      let errorMessage = "Unknown error occurred";
      
      if (typeof error === "object" && error !== null && "reason" in error) {
        errorMessage = (error as { reason: string }).reason;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
      ) {
        const message = (error as { message: string }).message;
        if (message.includes("Admin only")) {
          errorMessage = "Access denied: Only admin can create campaigns";
        } else if (message.includes("overlaps")) {
          errorMessage = "Campaign dates overlap with existing campaign";
        } else if (message.includes("Invalid dates")) {
          errorMessage = "Invalid campaign dates - end date must be after start date";
        } else if (message.includes("user rejected")) {
          errorMessage = "Transaction was rejected by user";
        } else if (message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for gas fees";
        } else {
          errorMessage = message;
        }
      } else if (typeof error === "object" && error !== null && "code" in error) {
        const code = (error as { code: string }).code;
        switch (code) {
          case 'ACTION_REJECTED':
            errorMessage = "Transaction was rejected by user";
            break;
          case 'INSUFFICIENT_FUNDS':
            errorMessage = "Insufficient funds for gas fees";
            break;
          case 'NETWORK_ERROR':
            errorMessage = "Network error - please check your connection";
            break;
          default:
            errorMessage = `Transaction failed with code: ${code}`;
        }
      }

      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteCampaign = createAsyncThunk(
  "campaign/deleteCampaign",
  async (campaignId: number, { rejectWithValue }) => {
    const signer = await getCurrentSigner();

    if (!signer) {
      return rejectWithValue("Wallet not connected");
    }

    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

    try {
      console.log("Deleting campaign:", campaignId);

      const tx = await contract.deleteCampaign(campaignId);
      console.log("Delete transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("Delete transaction confirmed:", receipt);

      toast.success("Campaign deleted successfully");
      return campaignId;

    } catch (error) {
      console.error("Failed to delete campaign:", error);

      let errorMessage = "Unknown error occurred";
      if (typeof error === "object" && error !== null && "reason" in error) {
        errorMessage = (error as { reason: string }).reason;
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast.error(`Failed to delete campaign: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const checkUpkeep = createAsyncThunk(
  "campaign/checkUpkeep",
  async () => {
    const provider = getProvider();
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
  async (campaignId: number) => {
    const signer = await getCurrentSigner();
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
  async () => {
    const provider = getProvider();
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
  async () => {
    const provider = getProvider();
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