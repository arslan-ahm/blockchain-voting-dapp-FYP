import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI } from "../../constants/contract";
import { toast } from "sonner";

interface ContractError extends Error {
  reason?: string;
  code?: string;
  data?: string;
}

interface CampaignDetailsResponse {
  startDate: bigint;
  endDate: bigint;
  winner: string;
  isOpen: boolean;
  isDeleted: boolean;
  detailsIpfsHash: string;
  title: string;
  description: string;
  totalVotes: bigint;
  voterCount: bigint;
  candidateCount: bigint;
  status: number;
}

interface CandidateData {
  address: string;
  name: string;
  voteCount: number;
  role: string;
}

interface VoterData {
  address: string;
  name: string;
  hasVoted: boolean;
  role: string;
}

interface VerificationRequestData {
  userAddress: string;
  requestedRole: number;
  verificationDocIpfsHash: string;
  adminFeedback: string;
  userName: string;
  timestamp: number;
  status: number;
}

interface AdminDashboardData {
  // Campaign Details
  currentCampaign: {
    id: number;
    title: string;
    description: string;
    startDate: number;
    endDate: number;
    duration: number;
    winner: string;
    isOpen: boolean;
    status: 'Upcoming' | 'Active' | 'Completed' | 'Deleted';
    detailsIpfsHash: string;
    creationTimestamp?: number;
  } | null;

  participantStats: {
    candidateCount: number;
    voterCount: number;
  };

  voteStats: {
    votedCount: number;
    notVotedCount: number;
    totalVoters: number;
  };

  monthlyCampaigns: {
    campaignIds: number[];
    titles: string[];
    startDates: number[];
    endDates: number[];
    statuses: string[];
    winners: string[];
  };

  candidates: CandidateData[];

  voters: VoterData[];

  verificationRequests: VerificationRequestData[];

  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
}

enum RequestStatus { Pending, Approved, Rejected }
enum CampaignStatus { Upcoming, Active, Completed, Deleted }

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

const handleContractError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'reason' in error) {
    return String((error as ContractError).reason);
  }

  if (error instanceof Error) {
    const message = error.message;
    if (message.includes("Admin only")) {
      return "Access denied: Only admin can perform this action";
    } else if (message.includes("user rejected")) {
      return "Transaction rejected by user";
    } else if (message.includes("insufficient funds")) {
      return "Insufficient funds for gas fees";
    } else if (message.includes("could not decode result data")) {
      return "Contract not found or invalid contract address";
    } else if (message.includes("BAD_DATA")) {
      return "Invalid contract response - please check contract deployment";
    }
    return message;
  }

  return "Unknown error occurred";
};

// Enhanced contract validation function
const validateContract = async (contract: ethers.Contract): Promise<boolean> => {
  try {
    // Try to get contract code to verify deployment
    const provider = contract.runner?.provider || contract.provider;
    if (provider && 'getCode' in provider) {
      const code = await provider.getCode(await contract.getAddress());
      if (code === '0x') {
        console.error('Contract not deployed at address:', await contract.getAddress());
        return false;
      }
    }

    // Try a simple view function call to verify ABI compatibility
    await contract.nextCampaignId.staticCall();
    return true;
  } catch (error) {
    console.error('Contract validation failed:', error);
    return false;
  }
};

const getMostRelevantCampaign = async (contract: ethers.Contract): Promise<number> => {
  try {
    // Validate contract first
    const isValidContract = await validateContract(contract);
    if (!isValidContract) {
      console.error('Contract validation failed');
      return 0;
    }

    // Use staticCall for better error handling
    const nextCampaignId = await contract.nextCampaignId.staticCall();
    const totalCampaigns = Number(nextCampaignId) - 1;

    console.log(`Total campaigns found: ${totalCampaigns}`);

    if (totalCampaigns < 1) return 0;

    const now = Math.floor(Date.now() / 1000);
    let activeCampaign = 0;
    let nearestUpcomingCampaign = 0;
    let nearestUpcomingTime = Infinity;

    for (let i = 1; i <= totalCampaigns; i++) {
      try {
        const result = await contract.getCampaignDetails.staticCall(i) as CampaignDetailsResponse;

        if (result.isDeleted) continue;

        const startTime = Number(result.startDate);
        const endTime = Number(result.endDate);

        if (now >= startTime && now < endTime && result.isOpen) {
          activeCampaign = i;
          break;
        }

        if (now < startTime && startTime < nearestUpcomingTime) {
          nearestUpcomingCampaign = i;
          nearestUpcomingTime = startTime;
        }
      } catch (error) {
        console.log(`Error checking campaign ${i}:`, error);
        continue;
      }
    }

    return activeCampaign || nearestUpcomingCampaign;
  } catch (error) {
    console.error("Error finding most relevant campaign:", error);
    return 0;
  }
};

export const fetchAdminDashboardData = createAsyncThunk(
  "admin/fetchDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const provider = getProvider();
      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, provider);

      // Validate contract deployment and ABI
      const isValidContract = await validateContract(contract);
      if (!isValidContract) {
        return rejectWithValue("Contract not found or invalid. Please check the contract address and deployment.");
      }

      const relevantCampaignId = await getMostRelevantCampaign(contract);

      if (!relevantCampaignId) {
        return {
          currentCampaign: null,
          participantStats: { candidateCount: 0, voterCount: 0 },
          voteStats: { votedCount: 0, notVotedCount: 0, totalVoters: 0 },
          monthlyCampaigns: { campaignIds: [], titles: [], startDates: [], endDates: [], statuses: [], winners: [] },
          candidates: [],
          voters: [],
          verificationRequests: [],
          totalCampaigns: 0,
          activeCampaigns: 0,
          completedCampaigns: 0
        } as AdminDashboardData;
      }

      const campaignDetails = await contract.getCampaignDetails.staticCall(relevantCampaignId) as CampaignDetailsResponse;

      const now = Math.floor(Date.now() / 1000);
      const startTime = Number(campaignDetails.startDate);
      const endTime = Number(campaignDetails.endDate);

      let status: 'Upcoming' | 'Active' | 'Completed' | 'Deleted';
      if (campaignDetails.isDeleted) {
        status = 'Deleted';
      } else if (now < startTime) {
        status = 'Upcoming';
      } else if (now >= startTime && now < endTime && campaignDetails.isOpen) {
        status = 'Active';
      } else {
        status = 'Completed';
      }

      const currentCampaign = {
        id: relevantCampaignId,
        title: campaignDetails.title,
        description: campaignDetails.description,
        startDate: startTime,
        endDate: endTime,
        duration: endTime - startTime,
        winner: campaignDetails.winner,
        isOpen: campaignDetails.isOpen,
        status,
        detailsIpfsHash: campaignDetails.detailsIpfsHash
      };

      const participantStats = await contract.getParticipantStats.staticCall(relevantCampaignId);

      const voteStats = await contract.getVotingStats.staticCall(relevantCampaignId);

      const candidatesResult = await contract.getCampaignCandidates.staticCall(relevantCampaignId);
      const candidates: CandidateData[] = [];

      for (let i = 0; i < candidatesResult.candidates.length; i++) {
        candidates.push({
          address: candidatesResult.candidates[i],
          name: candidatesResult.names[i] || "Unknown",
          voteCount: Number(candidatesResult.voteCounts[i]),
          role: "Candidate"
        });
      }

      const votersResult = await contract.getCampaignVoters.staticCall(relevantCampaignId);
      const voters: VoterData[] = [];

      for (let i = 0; i < votersResult.voters.length; i++) {
        voters.push({
          address: votersResult.voters[i],
          name: votersResult.names[i] || "Unknown",
          hasVoted: votersResult.hasVotedList[i],
          role: "Voter"
        });
      }

      const currentMonth = Math.floor(now / (30 * 24 * 60 * 60)) * (30 * 24 * 60 * 60);
      const monthlyData = await contract.getMonthlyCampaigns.staticCall(currentMonth);

      const monthlyCampaigns = {
        campaignIds: monthlyData.campaignIds.map((id: bigint) => Number(id)),
        titles: monthlyData.titles,
        startDates: monthlyData.startDates.map((date: bigint) => Number(date)),
        endDates: monthlyData.endDates.map((date: bigint) => Number(date)),
        statuses: monthlyData.statuses.map((status: number) => {
          switch (status) {
            case CampaignStatus.Upcoming: return "Upcoming";
            case CampaignStatus.Active: return "Active";
            case CampaignStatus.Completed: return "Completed";
            case CampaignStatus.Deleted: return "Deleted";
            default: return "Unknown";
          }
        }),
        winners: monthlyData.winners
      };

      const verificationRequests: VerificationRequestData[] = [];
      try {
        const signer = await getCurrentSigner();
        if (signer) {
          const adminContract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);
          const requestsData = await adminContract.getPendingVerificationRequests.staticCall();

          for (let i = 0; i < requestsData.userAddresses.length; i++) {
            verificationRequests.push({
              userAddress: requestsData.userAddresses[i],
              requestedRole: Number(requestsData.requestedRoles[i]),
              verificationDocIpfsHash: requestsData.verificationDocIpfsHashes[i],
              adminFeedback: requestsData.adminFeedbacks[i],
              userName: requestsData.userNames[i],
              timestamp: Number(requestsData.timestamps[i]),
              status: RequestStatus.Pending
            });
          }
        }
      } catch (error) {
        console.log("Could not fetch verification requests (may not be admin):", error);
      }

      const nextCampaignId = await contract.nextCampaignId.staticCall();
      const totalCampaigns = Number(nextCampaignId) - 1;
      let activeCampaigns = 0;
      let completedCampaigns = 0;

      for (let i = 1; i <= totalCampaigns; i++) {
        try {
          const details = await contract.getCampaignDetails.staticCall(i) as CampaignDetailsResponse;
          if (details.isDeleted) continue;

          const start = Number(details.startDate);
          const end = Number(details.endDate);

          if (now >= start && now < end && details.isOpen) {
            activeCampaigns++;
          } else if (now >= end || !details.isOpen) {
            completedCampaigns++;
          }
        } catch (error) {
          console.log("Error fetching campaign statistics:", error);
          continue;
        }
      }

      return {
        currentCampaign,
        participantStats: {
          candidateCount: Number(participantStats.candidateCount),
          voterCount: Number(participantStats.voterCount)
        },
        voteStats: {
          votedCount: Number(voteStats.votedCount),
          notVotedCount: Number(voteStats.notVotedCount),
          totalVoters: Number(voteStats.totalVoters)
        },
        monthlyCampaigns,
        candidates,
        voters,
        verificationRequests,
        totalCampaigns,
        activeCampaigns,
        completedCampaigns
      } as AdminDashboardData;

    } catch (error) {
      console.error("Failed to fetch admin dashboard data:", error);
      const errorMessage = handleContractError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const adminCreateCampaign = createAsyncThunk(
  "admin/createCampaign",
  async ({
    startDate,
    endDate,
    detailsIpfsHash,
    title,
    description
  }: {
    startDate: number;
    endDate: number;
    detailsIpfsHash: string;
    title: string;
    description: string;
  }, { rejectWithValue }) => {

    const signer = await getCurrentSigner();

    if (!signer) {
      return rejectWithValue("Wallet not connected - please connect your wallet first");
    }

    try {
      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

      // Validate contract
      const isValidContract = await validateContract(contract);
      if (!isValidContract) {
        return rejectWithValue("Contract not found or invalid. Please check the contract address and deployment.");
      }

      const signerAddress = await signer.getAddress();
      const contractAdmin = await contract.admin.staticCall();

      if (signerAddress.toLowerCase() !== contractAdmin.toLowerCase()) {
        return rejectWithValue("Access denied: Only admin can create campaigns");
      }

      if (endDate <= startDate) {
        return rejectWithValue("End date must be after start date");
      }

      const now = Math.floor(Date.now() / 1000);
      if (startDate <= now) {
        return rejectWithValue("Start date must be in the future");
      }

      const MIN_DURATION = 3600; // 1 hour
      if (endDate - startDate < MIN_DURATION) {
        return rejectWithValue("Campaign must run for at least 1 hour");
      }

      const gasEstimate = await contract.createCampaign.estimateGas(startDate, endDate, detailsIpfsHash, title, description);
      const tx = await contract.createCampaign(startDate, endDate, detailsIpfsHash, title, description, {
        gasLimit: gasEstimate * 120n / 100n
      });

      const receipt = await tx.wait();

      let campaignId = 0;
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
          if (parsed !== null && parsed.args) {
            campaignId = Number(parsed.args.campaignId || parsed.args[0]);
          }
        }
      } catch (eventError) {
        console.warn("Could not parse campaign created event:", eventError);
      }

      toast.success(`Campaign #${campaignId} created successfully!`);
      return campaignId;

    } catch (error) {
      console.error("Failed to create campaign:", error);
      const errorMessage = handleContractError(error);
      toast.error(`Failed to create campaign: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const adminDeleteCampaign = createAsyncThunk(
  "admin/deleteCampaign",
  async (campaignId: number, { rejectWithValue }) => {
    const signer = await getCurrentSigner();

    if (!signer) {
      return rejectWithValue("Wallet not connected");
    }

    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

    try {
      // Validate contract
      const isValidContract = await validateContract(contract);
      if (!isValidContract) {
        return rejectWithValue("Contract not found or invalid. Please check the contract address and deployment.");
      }

      const result = await contract.getCampaignDetails.staticCall(campaignId) as CampaignDetailsResponse;

      if (!result.isOpen || result.isDeleted) {
        return rejectWithValue("Campaign is already closed or deleted");
      }

      const now = Math.floor(Date.now() / 1000);
      if (now >= Number(result.startDate)) {
        return rejectWithValue("Cannot delete campaign that has already started");
      }

      const adminAddress = await contract.admin.staticCall();
      const tx = await contract.deleteCampaign(campaignId, adminAddress);
      await tx.wait();

      toast.success(`Campaign #${campaignId} deleted successfully`);
      return campaignId;

    } catch (error) {
      console.error("Failed to delete campaign:", error);
      const errorMessage = handleContractError(error);
      toast.error(`Failed to delete campaign: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const adminManualCloseCampaign = createAsyncThunk(
  "admin/manualCloseCampaign",
  async (campaignId: number, { rejectWithValue }) => {
    const signer = await getCurrentSigner();

    if (!signer) {
      return rejectWithValue("Wallet not connected");
    }

    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

    try {
      // Validate contract
      const isValidContract = await validateContract(contract);
      if (!isValidContract) {
        return rejectWithValue("Contract not found or invalid. Please check the contract address and deployment.");
      }

      const tx = await contract.manualCloseCampaign(campaignId);
      await tx.wait();

      toast.success(`Campaign #${campaignId} closed successfully`);
      return campaignId;

    } catch (error) {
      console.error("Failed to manually close campaign:", error);
      const errorMessage = handleContractError(error);
      toast.error(`Failed to close campaign: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const adminProcessVerification = createAsyncThunk(
  "admin/processVerification",
  async ({
    userAddress,
    approved,
    feedback = ""
  }: {
    userAddress: string;
    approved: boolean;
    feedback?: string;
  }, { rejectWithValue }) => {

    const signer = await getCurrentSigner();

    if (!signer) {
      return rejectWithValue("Wallet not connected");
    }

    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

    try {
      // Validate contract
      const isValidContract = await validateContract(contract);
      if (!isValidContract) {
        return rejectWithValue("Contract not found or invalid. Please check the contract address and deployment.");
      }

      const tx = await contract.processVerification(userAddress, approved, feedback);
      await tx.wait();

      const action = approved ? "approved" : "rejected";
      toast.success(`Verification request ${action} successfully`);

      return { userAddress, approved, feedback };

    } catch (error) {
      console.error("Failed to process verification:", error);
      const errorMessage = handleContractError(error);
      toast.error(`Failed to process verification: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getVerificationRequestDetails = createAsyncThunk(
  "admin/getVerificationRequestDetails",
  async (userAddress: string, { rejectWithValue }) => {
    const provider = getProvider();
    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, provider);

    try {
      // Validate contract
      const isValidContract = await validateContract(contract);
      if (!isValidContract) {
        return rejectWithValue("Contract not found or invalid. Please check the contract address and deployment.");
      }

      const request = await contract.verificationRequests.staticCall(userAddress);
      const userDetails = await contract.userDetails.staticCall(userAddress);

      return {
        userAddress: request.userAddress,
        requestedRole: Number(request.requestedRole),
        status: Number(request.status),
        verificationDocIpfsHash: request.verificationDocIpfsHash,
        adminFeedback: request.adminFeedback,
        requestTimestamp: Number(request.requestTimestamp),
        userName: request.userName,
        userInfo: {
          name: userDetails.name,
          email: userDetails.email,
          dateOfBirth: Number(userDetails.dateOfBirth),
          identityNumber: userDetails.identityNumber,
          contactNumber: userDetails.contactNumber,
          bio: userDetails.bio,
          profileImageIpfsHash: userDetails.profileImageIpfsHash,
          supportiveLinks: userDetails.supportiveLinks
        }
      };

    } catch (error) {
      console.error("Failed to get verification request details:", error);
      const errorMessage = handleContractError(error);
      return rejectWithValue(errorMessage);
    }
  }
);