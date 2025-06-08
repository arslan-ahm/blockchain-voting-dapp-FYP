import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI } from "../../constants/contract";
import { toast } from "sonner";
import type { RootState } from "../store";

export const fetchCampaigns = createAsyncThunk(
  "campaign/fetchCampaigns",
  async (provider?: ethers.Provider) => {
    const contractProvider = provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, contractProvider);

    try {
      const nextCampaignId = await contract.nextCampaignId();
      const campaigns = [];

      for (let i = 1; i < nextCampaignId; i++) {
        try {
          const [
            startDate,
            endDate,
            winner,
            isOpen,
            isDeleted,
            detailsIpfsHash,
            title,
            description,
            totalVotes,
            voterCount,
            candidateCount,
            status
          ] = await contract.getCampaignDetails(i);

          if (!isDeleted) {
            campaigns.push({
              campaignId: i,
              startDate: startDate.toString(),
              endDate: endDate.toString(),
              winner,
              isOpen,
              isDeleted,
              detailsIpfsHash,
              title,
              description,
              totalVotes: totalVotes.toString(),
              voterCount: voterCount.toString(),
              candidateCount: candidateCount.toString(),
              status: parseInt(status.toString())
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch campaign ${i}:`, error);
        }
      }

      return campaigns;
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast.error("Failed to fetch campaigns");
      throw error;
    }
  }
);

export const fetchNearbyCampaigns = createAsyncThunk(
  "campaign/fetchNearbyCampaigns",
  async (provider?: ethers.Provider) => {
    
    // Use provided provider or fallback to RPC URL
    // Since provider is no longer in Redux state, we need it passed or use fallback
    const contractProvider = provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, contractProvider);

    try {
      const campaignIds = await contract.getNearbyCampaigns();
      const campaigns = [];

      for (const id of campaignIds) {
        try {
          const [
            startDate,
            endDate,
            winner,
            isOpen,
            isDeleted,
            detailsIpfsHash,
            title,
            description,
            totalVotes,
            voterCount,
            candidateCount,
            status
          ] = await contract.getCampaignDetails(id);

          campaigns.push({
            campaignId: id.toString(),
            startDate: startDate.toString(),
            endDate: endDate.toString(),
            winner,
            isOpen,
            isDeleted,
            detailsIpfsHash,
            title,
            description,
            totalVotes: totalVotes.toString(),
            voterCount: voterCount.toString(),
            candidateCount: candidateCount.toString(),
            status: parseInt(status.toString())
          });
        } catch (error) {
          console.warn(`Failed to fetch nearby campaign ${id}:`, error);
        }
      }

      return campaigns;
    } catch (error) {
      console.error("Error fetching nearby campaigns:", error);
      toast.error("Failed to fetch nearby campaigns");
      throw error;
    }
  }
);

export const createCampaign = createAsyncThunk(
  "campaign/createCampaign",
  async ({
    startDate,
    endDate,
    campaignDetailsIpfsHash,
    title,
    description,
    account,
    signer // Add signer as a required parameter
  }: {
    startDate: number;
    endDate: number;
    campaignDetailsIpfsHash: string;
    title: string;
    description: string;
    account?: string; // Make optional
    signer: ethers.Signer; // Add signer parameter
  }, { getState }) => {
    const state = getState() as RootState;
    const userAccount = account || state.user.account;
    
    // Enhanced wallet connection check
    if (!userAccount) {
      throw new Error("Wallet not connected - No account found");
    }
    
    // Check if wallet is connected via Redux state
    if (!state.user.signerConnected) {
      throw new Error("Wallet not connected - Signer not available");
    }
    
    console.log("Step 5", signer);
    
    if (!signer) {
      throw new Error("Wallet not connected - No signer provided");
    }
    
    console.log("Step 6");
    console.log("Signer:", signer);
    
    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);
    console.log("Contract:", contract);
    
    try {
      // Note: Remove userAccount from contract call as it's not in the Solidity function
      const tx = await contract.createCampaign(
        startDate,
        endDate,
        campaignDetailsIpfsHash,
        title,
        description
        // Remove userAccount - it's not a parameter in the smart contract function
      );
      const receipt = await tx.wait();
      console.log("Receipt:", receipt);
      toast.success("Campaign created successfully");
      
      let campaignId = null;
      
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          
          if (parsed && parsed.name === "CampaignCreated") {
            campaignId = parsed.args.campaignId?.toString();
            break;
          }
        } catch {
          continue;
        }
      }
      console.log("Campaign ID:", campaignId);
      return {
        transactionHash: receipt.hash,
        campaignId,
        startDate: startDate.toString(),
        endDate: endDate.toString(),
        title,
        description,
        campaignDetailsIpfsHash
      };
    } catch (error) {
      console.error("Error creating campaign:", error);
      
      let errorMessage = "Failed to create campaign";
      if (error instanceof Error && error.message) {
        if (error.message.includes("Invalid dates")) {
          errorMessage = "Invalid campaign dates";
        } else if (error.message.includes("Start date must be in future")) {
          errorMessage = "Campaign start date must be in the future";
        } else if (error.message.includes("Campaign title required")) {
          errorMessage = "Campaign title is required";
        } else if (error.message.includes("overlaps")) {
          errorMessage = "Campaign dates overlap with existing campaign";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected by user";
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for transaction";
        } else {
          errorMessage = `Failed to create campaign: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
);

export const deleteCampaign = createAsyncThunk(
  "campaign/deleteCampaign",
  async ({
    campaignId,
    adminAddress,
    signer
  }: {
    campaignId: number;
    adminAddress: string;
    signer: ethers.Signer;
  }) => {
    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

    try {
      const tx = await contract.deleteCampaign(campaignId, adminAddress);
      const receipt = await tx.wait();
      toast.success("Campaign deleted successfully");

      return {
        transactionHash: receipt.transactionHash,
        campaignId
      };
    } catch (error) {
      toast.error("Failed to delete campaign");
      throw error;
    }
  }
);

export const getActiveCampaign = createAsyncThunk(
  "campaign/getActiveCampaign",
  async (provider?: ethers.Provider) => {
    const contractProvider = provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, contractProvider);

    try {
      const activeCampaignId = await contract.getActiveCampaignId();

      if (activeCampaignId.toString() === "0") {
        return null;
      }

      const [
        startDate,
        endDate,
        winner,
        isOpen,
        isDeleted,
        detailsIpfsHash,
        title,
        description,
        totalVotes,
        voterCount,
        candidateCount,
        status
      ] = await contract.getCampaignDetails(activeCampaignId);

      return {
        campaignId: activeCampaignId.toString(),
        startDate: startDate.toString(),
        endDate: endDate.toString(),
        winner,
        isOpen,
        isDeleted,
        detailsIpfsHash,
        title,
        description,
        totalVotes: totalVotes.toString(),
        voterCount: voterCount.toString(),
        candidateCount: candidateCount.toString(),
        status: parseInt(status.toString())
      };
    } catch (error) {
      toast.error("Failed to fetch active campaign");
      throw error;
    }
  }
);

export const hasActiveCampaign = createAsyncThunk(
  "campaign/hasActiveCampaign",
  async (provider?: ethers.Provider) => {
    const contractProvider = provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, contractProvider);

    try {
      const hasActive = await contract.hasActiveCampaign();
      let activeCampaignId = "0";

      if (hasActive) {
        const id = await contract.getActiveCampaignId();
        activeCampaignId = id.toString();
      }

      return {
        hasActiveCampaign: hasActive,
        activeCampaignId
      };
    } catch (error) {
      toast.error("Failed to check active campaign");
      throw error;
    }
  }
);

export const registerForCampaign = createAsyncThunk(
  "campaign/registerForCampaign",
  async ({campaignId, signer}: {campaignId: number, signer: ethers.Signer}) => {
    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

    try {
      const tx = await contract.registerForCampaign(campaignId);
      const receipt = await tx.wait();
      toast.success("Registered for campaign successfully");

      return {
        transactionHash: receipt.transactionHash,
        campaignId
      };
    } catch (error) {
      toast.error("Failed to register for campaign");
      throw error;
    }
  }
);

export const checkUserRegistration = createAsyncThunk(
  "campaign/checkUserRegistration",
  async ({campaignId, userAddress, provider}: {campaignId: number, userAddress: string, provider: ethers.Provider}) => {
    const contractProvider = provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, contractProvider);

    try {
      const [isVoter, isCandidate] = await contract.isUserRegisteredForCampaign(campaignId, userAddress);

      return {
        campaignId,
        userAddress,
        isVoter,
        isCandidate
      };
    } catch (error) {
      toast.error("Failed to check user registration");
      throw error;
    }
  }
);

export const getCandidateVotes = createAsyncThunk(
  "campaign/getCandidateVotes",
  async ({
    campaignId,
    candidate,
    provider
  }: {
    campaignId: number;
    candidate: string;
    provider: ethers.Provider;
  }) => {
    const contractProvider = provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, contractProvider);

    try {
      const votes = await contract.getCandidateVotes(campaignId, candidate);

      return {
        campaignId,
        candidate,
        votes: votes.toString()
      };
    } catch (error) {
      toast.error("Failed to fetch candidate votes");
      throw error;
    }
  }
);

export const getAllCandidateVotes = createAsyncThunk(
  "campaign/getAllCandidateVotes",
  async ({campaignId, provider}: {campaignId: number, provider: ethers.Provider}) => {
    const contractProvider = provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, contractProvider);

    try {
      const [candidates, names, voteCounts] = await contract.getCampaignCandidates(campaignId);

      const candidateVotes = candidates.map((candidate: string, index: number) => ({
        candidate,
        name: names[index],
        votes: voteCounts[index].toString()
      }));

      return {
        campaignId,
        candidateVotes
      };
    } catch (error) {
      toast.error("Failed to fetch candidate votes");
      throw error;
    }
  }
);

export const castVote = createAsyncThunk(
  "campaign/castVote",
  async ({
    campaignId,
    candidate,
    signer
  }: {
    campaignId: number;
    candidate: string;
    signer: ethers.Signer;
  }) => {
    if (!signer) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

    try {
      const tx = await contract.vote(campaignId, candidate);
      const receipt = await tx.wait();
      toast.success("Vote cast successfully");

      return {
        transactionHash: receipt.transactionHash,
        campaignId,
        candidate
      };
    } catch (error) {
      toast.error("Failed to cast vote");
      throw error;
    }
  }
);

export const getUserVote = createAsyncThunk(
  "campaign/getUserVote",
  async ({
    campaignId,
    userAddress,
    provider
  }: {
    campaignId: number;
    userAddress: string;
    provider: ethers.Provider;
  }) => {
    const contractProvider = provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, contractProvider);

    try {
      const votedCandidate = await contract.votes(userAddress, campaignId);

      return {
        campaignId,
        userAddress,
        votedCandidate: votedCandidate === ethers.ZeroAddress ? null : votedCandidate
      };
    } catch (error) {
      toast.error("Failed to fetch user vote");
      throw error;
    }
  }
);

export const manualCloseCampaign = createAsyncThunk(
  "campaign/manualCloseCampaign",
  async ({campaignId, signer}: {campaignId: number, signer: ethers.Signer}) => {
    if (!signer) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

    try {
      const tx = await contract.manualCloseCampaign(campaignId);
      const receipt = await tx.wait();
      toast.success("Campaign closed successfully");

      return {
        transactionHash: receipt.transactionHash,
        campaignId
      };
    } catch (error) {
      toast.error("Failed to close campaign");
      throw error;
    }
  }
);

export const checkUpkeep = createAsyncThunk(
  "campaign/checkUpkeep",
  async ({provider}: {provider: ethers.Provider}) => {
    const contractProvider = provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, contractProvider);

    try {
      const [upkeepNeeded, performData] = await contract.checkUpkeep("0x");

      return {
        upkeepNeeded,
        performData
      };
    } catch (error) {
      toast.error("Failed to check upkeep");
      throw error;
    }
  }
);

export const performUpkeep = createAsyncThunk(
  "campaign/performUpkeep",
  async ({performData, signer}: {performData: string, signer: ethers.Signer}) => {
    if (!signer) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

    try {
      const tx = await contract.performUpkeep(performData);
      const receipt = await tx.wait();
      toast.success("Upkeep performed successfully");

      return {
        transactionHash: receipt.transactionHash,
        performData
      };
    } catch (error) {
      toast.error("Failed to perform upkeep");
      throw error;
    }
  }
);

export const getCampaignStats = createAsyncThunk(
  "campaign/getCampaignStats",
  async ({campaignId, provider}: {campaignId: number, provider: ethers.Provider}) => {
    const contractProvider = provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, contractProvider);

    try {
      const [totalVoters, votedCount, notVotedCount] = await contract.getVotingStats(campaignId);
      const [candidateCount, voterCount] = await contract.getParticipantStats(campaignId);

      return {
        campaignId,
        totalVoters: totalVoters.toString(),
        votedCount: votedCount.toString(),
        notVotedCount: notVotedCount.toString(),
        candidateCount: candidateCount.toString(),
        voterCount: voterCount.toString()
      };
    } catch (error) {
      toast.error("Failed to fetch campaign statistics");
      throw error;
    }
  }
);

export const getCampaignVoters = createAsyncThunk(
  "campaign/getCampaignVoters",
  async ({campaignId, provider}: {campaignId: number, provider: ethers.Provider}) => {
    const contractProvider = provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, contractProvider);

    try {
      const [voters, names, hasVotedList] = await contract.getCampaignVoters(campaignId);

      const voterDetails = voters.map((voter: string, index: number) => ({
        address: voter,
        name: names[index],
        hasVoted: hasVotedList[index]
      }));

      return {
        campaignId,
        voters: voterDetails
      };
    } catch (error) {
      toast.error("Failed to fetch campaign voters");
      throw error;
    }
  }
);

export const getMonthlyCampaigns = createAsyncThunk(
  "campaign/getMonthlyCampaigns",
  async ({month, provider}: {month: number, provider: ethers.Provider}) => {
    const contractProvider = provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, contractProvider);

    try {
      const [campaignIds, startDates, endDates, titles, statuses, winners] =
        await contract.getMonthlyCampaigns(month);

      const campaigns = campaignIds.map((id: bigint, index: number) => ({
        campaignId: id.toString(),
        startDate: startDates[index].toString(),
        endDate: endDates[index].toString(),
        title: titles[index],
        status: parseInt(statuses[index].toString()),
        winner: winners[index]
      }));

      return {
        month,
        campaigns
      };
    } catch (error) {
      toast.error("Failed to fetch monthly campaigns");
      throw error;
    }
  }
);