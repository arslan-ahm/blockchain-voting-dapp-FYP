import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import {
  VOTING_CONTRACT_ADDRESS,
  VOTING_CONTRACT_ABI,
} from "../../constants/contract";
import { toast } from "sonner";
import type { RootState } from "../store";
import { mapCampaignStatus } from "../../utils/helpers";

export const fetchCampaigns = createAsyncThunk(
  "campaign/fetchCampaigns",
  async (provider?: ethers.Provider) => {
    if (!import.meta.env.VITE_RPC_URL) {
      console.error("RPC URL is not configured");
      throw new Error("RPC URL is not configured");
    }

    if (!VOTING_CONTRACT_ADDRESS) {
      console.error("Contract address is not configured");
      throw new Error("Contract address is not configured");
    }

    const contractProvider =
      provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      contractProvider
    );

    try {
      // Get nearby campaigns first to find active campaign IDs
      const campaignIds = await contract.getNearbyCampaigns();

      console.log("Found", campaignIds.length, "nearby campaigns");

      if (campaignIds.length === 0) {
        console.log("No nearby campaigns found");
        return [];
      }

      const campaigns = [];
      console.log(`Fetching details for ${campaignIds.length} campaigns`);

      // Process each campaign ID from getNearbyCampaigns
      for (let i = 0; i < campaignIds.length; i++) {
        const campaignId = campaignIds[i];
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
            status,
          ] = await contract.getCampaignDetails(campaignId);

          if (!isDeleted) {
            campaigns.push({
              id: Number(campaignId.toString()), // Convert BigInt to number properly
              startDate: Number(startDate.toString()), // Convert to number
              endDate: Number(endDate.toString()),
              winner,
              isOpen,
              isDeleted,
              detailsIpfsHash,
              title,
              description,
              totalVotes: Number(totalVotes.toString()), // Convert to number
              voterCount: Number(voterCount.toString()), // Convert to number
              candidateCount: Number(candidateCount.toString()), // Convert to number
              status: mapCampaignStatus(status),
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch campaign ${campaignId}:`, error);
        }
      }

      return campaigns;
    } catch (error: unknown) {
      interface ExtendedError extends Error {
        code?: string;
        reason?: string;
      }

      const err = error as ExtendedError;
      console.error("Error fetching campaigns:", err);

      let errorMessage = "Failed to fetch campaigns";
      const message = err.message || "";

      if (err.code === "NETWORK_ERROR" || err.code === "SERVER_ERROR") {
        errorMessage = `Network error: ${
          message || "Unable to connect to the blockchain"
        }`;
      } else if (err.code === "CALL_EXCEPTION") {
        errorMessage = `Contract error: ${
          err.reason || message || "Invalid contract call"
        }`;
      } else if (message.includes("missing provider")) {
        errorMessage = "Web3 provider not available";
      } else if (message.includes("invalid address")) {
        errorMessage = "Invalid contract address";
      }

      toast.error(errorMessage);
      const newError = new Error(errorMessage);
      Object.defineProperty(newError, "cause", { value: error });
      throw newError;
    }
  }
);

export const getCampaignParticipants = createAsyncThunk(
  "campaign/getCampaignParticipants",
  async ({
    campaignId,
    provider,
  }: {
    campaignId: number;
    provider: ethers.Provider;
  }) => {
    const contractProvider =
      provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      contractProvider
    );

    try {
      const [candidates, candidateNames, voteCounts] =
        await contract.getCampaignCandidates(campaignId);
      const [voters, voterNames, hasVotedList] =
        await contract.getCampaignVoters(campaignId);

      // Helper function to fetch user details including profile image
      const fetchUserDetails = async (address: string) => {
        try {
          const userDetails = await contract.userDetails(address);
          return {
            name: userDetails.name || "",
            email: userDetails.email || "",
            dateOfBirth: Number(userDetails.dateOfBirth) || 0,
            identityNumber: userDetails.identityNumber || "",
            contactNumber: userDetails.contactNumber || "",
            bio: userDetails.bio || "",
            profileImageIpfsHash: userDetails.profileImageIpfsHash || "",
            supportiveLinks: Array.isArray(userDetails.supportiveLinks)
              ? userDetails.supportiveLinks
              : [],
          };
        } catch (error) {
          console.warn(`Failed to fetch user details for ${address}:`, error);
          return null;
        }
      };

      // Fetch user details for all candidates
      const candidateDetailsPromises = candidates.map(
        async (candidate: string, index: number) => {
          const userDetails = await fetchUserDetails(candidate);
          return {
            address: candidate,
            name: candidateNames[index] || userDetails?.name || "",
            votes: voteCounts[index].toString(),
            type: "candidate",
            profileImageIpfsHash: userDetails?.profileImageIpfsHash || "",
            email: userDetails?.email || "",
            bio: userDetails?.bio || "",
            contactNumber: userDetails?.contactNumber || "",
            supportiveLinks: userDetails?.supportiveLinks || [],
          };
        }
      );

      // Fetch user details for all voters
      const voterDetailsPromises = voters.map(
        async (voter: string, index: number) => {
          const userDetails = await fetchUserDetails(voter);
          return {
            address: voter,
            name: voterNames[index] || userDetails?.name || "",
            hasVoted: hasVotedList[index],
            type: "voter",
            profileImageIpfsHash: userDetails?.profileImageIpfsHash || "",
            email: userDetails?.email || "",
            bio: userDetails?.bio || "",
            contactNumber: userDetails?.contactNumber || "",
          };
        }
      );

      // Wait for all user details to be fetched
      const [candidateDetails, voterDetails] = await Promise.all([
        Promise.all(candidateDetailsPromises),
        Promise.all(voterDetailsPromises),
      ]);

      return {
        campaignId,
        candidates: candidateDetails,
        voters: voterDetails,
      };
    } catch (error) {
      console.error("Failed to fetch campaign participants:", error);
      toast.error("Failed to fetch campaign participants");
      throw error;
    }
  }
);

export const getCampaignWithParticipants = createAsyncThunk(
  "campaign/getCampaignWithParticipants",
  async ({
    campaignId,
    provider,
  }: {
    campaignId: number;
    provider: ethers.Provider;
  }) => {
    const contractProvider =
      provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      contractProvider
    );

    try {
      // Get campaign details
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
        status,
      ] = await contract.getCampaignDetails(campaignId);

      // Get participants
      const [candidates, candidateNames, voteCounts] =
        await contract.getCampaignCandidates(campaignId);
      const [voters, voterNames, hasVotedList] =
        await contract.getCampaignVoters(campaignId);

      const candidateDetails = candidates.map(
        (candidate: string, index: number) => ({
          address: candidate,
          name: candidateNames[index],
          votes: voteCounts[index].toString(),
          type: "candidate",
        })
      );

      const voterDetails = voters.map((voter: string, index: number) => ({
        address: voter,
        name: voterNames[index],
        hasVoted: hasVotedList[index],
        type: "voter",
      }));

      return {
        id: Number(campaignId),
        startDate: Number(startDate.toString()), // Convert to number
        endDate: Number(endDate.toString()),
        winner,
        isOpen,
        isDeleted,
        detailsIpfsHash,
        title,
        description,
        totalVotes: Number(totalVotes.toString()), // Convert to number
        voterCount: Number(voterCount.toString()), // Convert to number
        candidateCount: Number(candidateCount.toString()),
        status: mapCampaignStatus(status),
        candidates: candidateDetails,
        voters: voterDetails,
      };
    } catch (error) {
      toast.error("Failed to fetch campaign with participants");
      throw error;
    }
  }
);

export const fetchNearbyCampaigns = createAsyncThunk(
  "campaign/fetchNearbyCampaigns",
  async (provider?: ethers.Provider) => {
    // Use provided provider or fallback to RPC URL
    // Since provider is no longer in Redux state, we need it passed or use fallback
    const contractProvider =
      provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      contractProvider
    );

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
            status,
          ] = await contract.getCampaignDetails(id);

          campaigns.push({
            id: Number(id.toString()),
            startDate: Number(startDate.toString()), // Convert to number
            endDate: Number(endDate.toString()),
            winner,
            isOpen,
            isDeleted,
            detailsIpfsHash,
            title,
            description,
            totalVotes: Number(totalVotes.toString()), // Convert to number
            voterCount: Number(voterCount.toString()), // Convert to number
            candidateCount: Number(candidateCount.toString()),
            status: mapCampaignStatus(status),
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
  async (
    {
      startDate,
      endDate,
      campaignDetailsIpfsHash,
      title,
      description,
      account,
      signer, // Add signer as a required parameter
    }: {
      startDate: number;
      endDate: number;
      campaignDetailsIpfsHash: string;
      title: string;
      description: string;
      account?: string; // Make optional
      signer: ethers.Signer; // Add signer parameter
    },
    { getState }
  ) => {
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

    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      signer
    );
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
            data: log.data,
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
        campaignId: campaignId ? Number(campaignId) : null, // Convert to number
        startDate: Number(startDate.toString()), // Convert to number
        endDate: Number(endDate.toString()),
        title,
        description,
        campaignDetailsIpfsHash,
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
    signer,
  }: {
    campaignId: number;
    adminAddress: string;
    signer: ethers.Signer;
  }) => {
    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      signer
    );

    try {
      const tx = await contract.deleteCampaign(campaignId, adminAddress);
      const receipt = await tx.wait();
      toast.success("Campaign deleted successfully");

      return {
        transactionHash: receipt.transactionHash,
        campaignId,
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
    const contractProvider =
      provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      contractProvider
    );

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
        status,
      ] = await contract.getCampaignDetails(activeCampaignId);

      return {
        id: Number(activeCampaignId.toString()),
        startDate: Number(startDate.toString()), // Convert to number
        endDate: Number(endDate.toString()),
        winner,
        isOpen,
        isDeleted,
        detailsIpfsHash,
        title,
        description,
        totalVotes: Number(totalVotes.toString()), // Convert to number
        voterCount: Number(voterCount.toString()), // Convert to number
        candidateCount: Number(candidateCount.toString()),
        status: mapCampaignStatus(status),
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
    const contractProvider =
      provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      contractProvider
    );

    try {
      const hasActive = await contract.hasActiveCampaign();
      let activeCampaignId = "0";

      if (hasActive) {
        const id = await contract.getActiveCampaignId();
        activeCampaignId = id.toString();
      }

      return {
        hasActiveCampaign: hasActive,
        activeCampaignId: Number(activeCampaignId.toString()),
      };
    } catch (error) {
      toast.error("Failed to check active campaign");
      throw error;
    }
  }
);

export const registerForCampaign = createAsyncThunk(
  "campaign/registerForCampaign",
  async ({
    campaignId,
    signer,
  }: {
    campaignId: number;
    signer: ethers.Signer;
  }) => {
    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      signer
    );

    try {
      const tx = await contract.registerForCampaign(campaignId);
      const receipt = await tx.wait();
      toast.success("Registered for campaign successfully");

      return {
        transactionHash: receipt.transactionHash,
        campaignId,
      };
    } catch (error) {
      toast.error("Failed to register for campaign");
      throw error;
    }
  }
);

export const checkUserRegistration = createAsyncThunk(
  "campaign/checkUserRegistration",
  async ({
    campaignId,
    userAddress,
    provider,
  }: {
    campaignId: number;
    userAddress: string;
    provider: ethers.Provider;
  }) => {
    const contractProvider =
      provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      contractProvider
    );

    try {
      const [isVoter, isCandidate] = await contract.isUserRegisteredForCampaign(
        campaignId,
        userAddress
      );

      return {
        campaignId,
        userAddress,
        isVoter,
        isCandidate,
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
    provider,
  }: {
    campaignId: number;
    candidate: string;
    provider: ethers.Provider;
  }) => {
    const contractProvider =
      provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      contractProvider
    );

    try {
      const votes = await contract.getCandidateVotes(campaignId, candidate);

      return {
        campaignId,
        candidate,
        votes: votes.toString(),
      };
    } catch (error) {
      toast.error("Failed to fetch candidate votes");
      throw error;
    }
  }
);

export const getAllCandidateVotes = createAsyncThunk(
  "campaign/getAllCandidateVotes",
  async ({
    campaignId,
    provider,
  }: {
    campaignId: number;
    provider: ethers.Provider;
  }) => {
    const contractProvider =
      provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      contractProvider
    );

    try {
      const [candidates, names, voteCounts] =
        await contract.getCampaignCandidates(campaignId);

      const candidateVotes = candidates.map(
        (candidate: string, index: number) => ({
          candidate,
          name: names[index],
          votes: voteCounts[index].toString(),
        })
      );

      return {
        campaignId,
        candidateVotes,
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
    signer,
  }: {
    campaignId: number;
    candidate: string;
    signer: ethers.Signer;
  }) => {
    if (!signer) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      signer
    );

    try {
      const tx = await contract.vote(campaignId, candidate);
      const receipt = await tx.wait();
      toast.success("Vote cast successfully");

      return {
        transactionHash: receipt.transactionHash,
        campaignId,
        candidate,
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
    provider,
  }: {
    campaignId: number;
    userAddress: string;
    provider: ethers.Provider;
  }) => {
    const contractProvider =
      provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      contractProvider
    );

    try {
      const votedCandidate = await contract.votes(userAddress, campaignId);

      return {
        campaignId,
        userAddress,
        votedCandidate:
          votedCandidate === ethers.ZeroAddress ? null : votedCandidate,
      };
    } catch (error) {
      toast.error("Failed to fetch user vote");
      throw error;
    }
  }
);

export const manualCloseCampaign = createAsyncThunk(
  "campaign/manualCloseCampaign",
  async ({
    campaignId,
    signer,
  }: {
    campaignId: number;
    signer: ethers.Signer;
  }) => {
    if (!signer) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      signer
    );

    try {
      const tx = await contract.manualCloseCampaign(campaignId);
      const receipt = await tx.wait();
      toast.success("Campaign closed successfully");

      return {
        transactionHash: receipt.transactionHash,
        campaignId,
      };
    } catch (error) {
      toast.error("Failed to close campaign");
      throw error;
    }
  }
);

export const checkUpkeep = createAsyncThunk(
  "campaign/checkUpkeep",
  async ({ provider }: { provider: ethers.Provider }) => {
    const contractProvider =
      provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      contractProvider
    );

    try {
      const [upkeepNeeded, performData] = await contract.checkUpkeep("0x");

      return {
        upkeepNeeded,
        performData,
      };
    } catch (error) {
      toast.error("Failed to check upkeep");
      throw error;
    }
  }
);

export const performUpkeep = createAsyncThunk(
  "campaign/performUpkeep",
  async ({
    performData,
    signer,
  }: {
    performData: string;
    signer: ethers.Signer;
  }) => {
    if (!signer) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      signer
    );

    try {
      const tx = await contract.performUpkeep(performData);
      const receipt = await tx.wait();
      toast.success("Upkeep performed successfully");

      return {
        transactionHash: receipt.transactionHash,
        performData,
      };
    } catch (error) {
      toast.error("Failed to perform upkeep");
      throw error;
    }
  }
);

export const getCampaignStats = createAsyncThunk(
  "campaign/getCampaignStats",
  async ({
    campaignId,
    provider,
  }: {
    campaignId: number;
    provider: ethers.Provider;
  }) => {
    const contractProvider =
      provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      contractProvider
    );

    try {
      const [totalVoters, votedCount, notVotedCount] =
        await contract.getVotingStats(campaignId);
      const [candidateCount, voterCount] = await contract.getParticipantStats(
        campaignId
      );

      return {
        campaignId,
        totalVoters: Number(totalVoters.toString()), // Convert to number
        votedCount: Number(votedCount.toString()), // Convert to number
        notVotedCount: Number(notVotedCount.toString()), // Convert to number
        candidateCount: Number(candidateCount.toString()), // Convert to number
        voterCount: Number(voterCount.toString()), // Convert to number
        totalVotes: Number(totalVoters.toString()),
      };
    } catch (error) {
      toast.error("Failed to fetch campaign statistics");
      throw error;
    }
  }
);

export const getCampaignVoters = createAsyncThunk(
  "campaign/getCampaignVoters",
  async ({
    campaignId,
    provider,
  }: {
    campaignId: number;
    provider: ethers.Provider;
  }) => {
    const contractProvider =
      provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      contractProvider
    );

    try {
      const [voters, names, hasVotedList] = await contract.getCampaignVoters(
        campaignId
      );

      const voterDetails = voters.map((voter: string, index: number) => ({
        address: voter,
        name: names[index],
        hasVoted: hasVotedList[index],
      }));

      return {
        campaignId,
        voters: voterDetails,
      };
    } catch (error) {
      toast.error("Failed to fetch campaign voters");
      throw error;
    }
  }
);

export const getMonthlyCampaigns = createAsyncThunk(
  "campaign/getMonthlyCampaigns",
  async ({ month, provider }: { month: number; provider: ethers.Provider }) => {
    const contractProvider =
      provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      contractProvider
    );

    try {
      const [campaignIds, startDates, endDates, titles, statuses, winners] =
        await contract.getMonthlyCampaigns(month);

      const campaigns = campaignIds.map((id: bigint, index: number) => ({
        campaignId: Number(id.toString()), // Change from 'id' to 'campaignId'
        startDate: Number(startDates[index].toString()), // Convert to number
        endDate: Number(endDates[index].toString()),
        title: titles[index],
        status: parseInt(statuses[index].toString()),
        winner: winners[index],
      }));

      return {
        month,
        campaigns,
      };
    } catch (error) {
      toast.error("Failed to fetch monthly campaigns");
      throw error;
    }
  }
);

// Enhanced voting function that allows verified voters to cast votes directly
export const castVoteWithRoleCheck = createAsyncThunk(
  "campaign/castVoteWithRoleCheck",
  async ({
    campaignId,
    candidate,
    signer,
    userAddress,
  }: {
    campaignId: number;
    candidate: string;
    signer: ethers.Signer;
    userAddress: string;
  }) => {
    if (!signer) throw new Error("Wallet not connected");
    if (!userAddress) throw new Error("User address required");

    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      signer
    );

    try {
      // First check if user has voter role
      const userRole = await contract.userRoles(userAddress);
      
      // Role.Voter = 1 in the enum
      if (Number(userRole) !== 1) {
        throw new Error("You must have a verified voter role to participate in voting");
      }

      // Check if user is registered for this specific campaign
      const [isVoter] = await contract.isUserRegisteredForCampaign(campaignId, userAddress);
      
      // If not registered but has voter role, auto-register for the campaign
      if (!isVoter && Number(userRole) === 1) {
        console.log("Auto-registering voter for campaign...");
        try {
          const registerTx = await contract.registerForCampaign(campaignId);
          await registerTx.wait();
          toast.success("Successfully registered for voting!");
        } catch (registrationError) {
          console.warn("Auto-registration failed, attempting direct vote:", registrationError);
          // Continue with voting attempt - the contract will handle the registration internally
        }
      }

      // Check if already voted
      const existingVote = await contract.votes(userAddress, campaignId);
      if (existingVote !== ethers.ZeroAddress) {
        throw new Error("You have already voted in this campaign");
      }

      // Get campaign details to validate timing
      const campaignDetails = await contract.getCampaignDetails(campaignId);
      const now = Math.floor(Date.now() / 1000);
      
      if (now < Number(campaignDetails.startDate)) {
        throw new Error("Campaign has not started yet");
      }
      
      if (now >= Number(campaignDetails.endDate) || !campaignDetails.isOpen) {
        throw new Error("Campaign has ended");
      }

      // Cast the vote
      console.log(`Casting vote for candidate ${candidate} in campaign ${campaignId}`);
      const tx = await contract.vote(campaignId, candidate);
      const receipt = await tx.wait();
      
      toast.success("Vote cast successfully!");

      return {
        transactionHash: receipt.transactionHash,
        campaignId,
        candidate,
        userAddress,
      };
    } catch (error) {
      console.error("Failed to cast vote with role check:", error);
      
      // Enhanced error handling
      if (error instanceof Error) {
        if (error.message.includes("Not a voter")) {
          toast.error("You need to have a verified voter role to vote. Please request verification from admin.");
        } else if (error.message.includes("Already voted")) {
          toast.error("You have already voted in this campaign");
        } else if (error.message.includes("Campaign not started")) {
          toast.error("Campaign has not started yet");
        } else if (error.message.includes("Campaign ended")) {
          toast.error("Campaign has ended");
        } else if (error.message.includes("Invalid candidate")) {
          toast.error("Invalid candidate selected");
        } else if (error.message.includes("Not registered")) {
          toast.error("Registration for this campaign failed. Please try again.");
        } else {
          toast.error(error.message || "Failed to cast vote");
        }
      }
      
      throw error;
    }
  }
);
