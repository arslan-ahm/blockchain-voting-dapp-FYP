import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import {
  VOTING_CONTRACT_ADDRESS,
  VOTING_CONTRACT_ABI,
} from "../../constants/contract";
import { toast } from "sonner";
import { RequestStatus } from "../../types";
import type { VerificationRequestData, AdminDashboardData } from "../../types";

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

const handleContractError = (error: unknown): string => {
  if (error && typeof error === "object" && "reason" in error) {
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
    } else if (message.includes("Cannot switch from active campaign")) {
      return "Please wait for the current campaign to complete before switching";
    } else if (message.includes("Cannot switch to deleted campaign")) {
      return "Selected campaign is no longer available";
    } else if (message.includes("BAD_DATA")) {
      return "Invalid contract response - please check contract deployment";
    }
    return message;
  }

  return "Unknown error occurred";
};

// Enhanced contract validation function
const validateContract = async (
  contract: ethers.Contract
): Promise<boolean> => {
  try {
    // Try to get contract code to verify deployment
    const provider = contract.runner?.provider || contract.provider;
    if (provider && "getCode" in provider) {
      const code = await provider.getCode(await contract.getAddress());
      if (code === "0x") {
        console.error(
          "Contract not deployed at address:",
          await contract.getAddress()
        );
        return false;
      }
    }

    // Try a simple view function call to verify ABI compatibility
    await contract.nextCampaignId.staticCall();
    return true;
  } catch (error) {
    console.error("Contract validation failed:", error);
    return false;
  }
};

const getMostRelevantCampaign = async (
  contract: ethers.Contract
): Promise<number> => {
  try {
    // Validate contract first
    const isValidContract = await validateContract(contract);
    if (!isValidContract) {
      console.error("Contract validation failed");
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
        const result = (await contract.getCampaignDetails.staticCall(
          i
        )) as CampaignDetailsResponse;

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

// Method 1: Type assertion approach
export const fetchAdminDashboardData = createAsyncThunk(
  "admin/fetchDashboardData",
  async (
    {
      campaignId,
      signer,
      forceRefresh = false,
    }: {
      campaignId?: number;
      signer: ethers.Signer;
      forceRefresh?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      // Create contract instance with signer
      const contract = new ethers.Contract(
        VOTING_CONTRACT_ADDRESS,
        VOTING_CONTRACT_ABI,
        signer
      );

      // Validate contract deployment and ABI
      const isValidContract = await validateContract(contract);
      if (!isValidContract) {
        return rejectWithValue(
          "Contract not found or invalid. Please check the contract address and deployment."
        );
      }

      // Use provided campaignId or get the most relevant one if not provided
      let targetCampaignId = campaignId;
      if (!targetCampaignId || forceRefresh) {
        targetCampaignId = await getMostRelevantCampaign(contract);
      }

      // If no campaign ID is available, return empty state
      if (!targetCampaignId) {
        return getEmptyDashboardData();
      }

      const campaignList = await getCampaignList(contract);

      // Verify campaign exists and is not deleted
      try {
        const campaignInfo = await contract.getCampaignDetails(
          targetCampaignId
        );
        if (campaignInfo.isDeleted) {
          throw new Error("Campaign has been deleted");
        }
      } catch (error) {
        console.error(
          `Campaign ${targetCampaignId} not found or deleted, falling back to most recent`,
          error
        );
        targetCampaignId = await getMostRelevantCampaign(contract);
        if (!targetCampaignId) {
          return getEmptyDashboardData();
        }
      }

      // Get campaign details
      const campaignDetails = (await contract.getCampaignDetails(
        targetCampaignId
      )) as CampaignDetailsResponse;

      const now = Math.floor(Date.now() / 1000);
      const startTime = Number(campaignDetails.startDate);
      const endTime = Number(campaignDetails.endDate);

      let status: "Upcoming" | "Active" | "Completed" | "Deleted";
      if (campaignDetails.isDeleted) {
        status = "Deleted";
      } else if (now < startTime) {
        status = "Upcoming";
      } else if (now >= startTime && now < endTime && campaignDetails.isOpen) {
        status = "Active";
      } else {
        status = "Completed";
      }

      const currentCampaign = {
        id: targetCampaignId,
        title: campaignDetails.title,
        description: campaignDetails.description,
        startDate: startTime,
        endDate: endTime,
        duration: endTime - startTime,
        winner: campaignDetails.winner,
        isOpen: campaignDetails.isOpen,
        status,
        detailsIpfsHash: campaignDetails.detailsIpfsHash,
      };

      // Get participant stats
      const participantStats = {
        candidateCount: Number(campaignDetails.candidateCount),
        voterCount: Number(campaignDetails.voterCount),
      };

      // Get voting stats
      const voteStats = await contract.getVotingStats(targetCampaignId);

      // Get candidates
      const candidatesResult = await contract.getCampaignCandidates(
        targetCampaignId
      );
      const candidatesPromises = candidatesResult.candidates.map(
        async (address: string, i: number) => {
          const voteCount = await contract.getCandidateVotes(
            targetCampaignId,
            address
          );
          return {
            address,
            name: candidatesResult.names[i] || "Unknown",
            voteCount: Number(voteCount),
            role: "Candidate" as const,
          };
        }
      );
      const candidates = await Promise.all(candidatesPromises);

      // Get voters
      const votersResult = await contract.getCampaignVoters(targetCampaignId);
      const votersPromises = votersResult.voters.map(
        async (address: string, i: number) => {
          const hasVoted = votersResult.hasVotedList[i];
          return {
            address,
            name: votersResult.names[i] || "Unknown",
            hasVoted,
            role: "Voter" as const,
          };
        }
      );
      const voters = await Promise.all(votersPromises);

      // Get monthly campaigns data
      const currentMonth =
        Math.floor(now / (30 * 24 * 60 * 60)) * (30 * 24 * 60 * 60);
      const monthlyData = await contract.getMonthlyCampaigns(currentMonth);

      const monthlyCampaigns = {
        campaignIds: monthlyData.campaignIds.map((id: bigint) => Number(id)),
        titles: monthlyData.titles,
        startDates: monthlyData.startDates.map((date: bigint) => Number(date)),
        endDates: monthlyData.endDates.map((date: bigint) => Number(date)),
        statuses: monthlyData.statuses.map((status: number) => {
          switch (status) {
            case 0:
              return "Upcoming";
            case 1:
              return "Active";
            case 2:
              return "Completed";
            case 3:
              return "Deleted";
            default:
              return "Unknown";
          }
        }),
        winners: monthlyData.winners,
      };

      // Get verification requests if admin
      const verificationRequests: VerificationRequestData[] = [];

      try {
        const signerAddress = await signer.getAddress();
        const contractAdmin = await contract.admin();
        console.log("Signer Address: ", signerAddress);
        console.log("Contract Admin Address: ", contractAdmin);

        // Case-insensitive comparison
        if (signerAddress.toLowerCase() === contractAdmin.toLowerCase()) {
          console.log("Admin verification passed");

          // Type assertion approach - cast contract to any to bypass TypeScript checking
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const contractAny = contract as any;

          try {
            const requestsData =
              await contractAny.getPendingVerificationRequests();

            if (
              requestsData &&
              Array.isArray(requestsData) &&
              requestsData.length >= 7
            ) {
              const [
                userAddresses,
                requestedRoles,
                verificationDocIpfsHashes,
                adminFeedbacks,
                userNames,
                timestamps,
                userInfos,
              ] = requestsData;

              console.log(
                "Processing verification requests:",
                userAddresses.length
              );

              for (let i = 0; i < userAddresses.length; i++) {
                console.log(`Processing request ${i}:`, userNames[i]);
                verificationRequests.push({
                  userAddress: userAddresses[i],
                  requestedRole: Number(requestedRoles[i]),
                  verificationDocIpfsHash: verificationDocIpfsHashes[i],
                  adminFeedback: adminFeedbacks[i],
                  userName: userNames[i],
                  timestamp: Number(timestamps[i]),
                  requestTimestamp: Number(timestamps[i]),
                  status: RequestStatus.Pending,
                  userInfo: {
                    name: userInfos[i].name || "",
                    email: userInfos[i].email || "",
                    dateOfBirth: Number(userInfos[i].dateOfBirth) || 0,
                    identityNumber: userInfos[i].identityNumber || "",
                    contactNumber: userInfos[i].contactNumber || "",
                    bio: userInfos[i].bio || "",
                    profileImageIpfsHash:
                      userInfos[i].profileImageIpfsHash || "",
                    supportiveLinks: Array.isArray(userInfos[i].supportiveLinks)
                      ? userInfos[i].supportiveLinks
                      : [],
                  },
                });
              }
            } else {
              console.log(
                "No verification requests found or invalid response format"
              );
            }
          } catch (functionError) {
            console.error(
              "Error calling getPendingVerificationRequests:",
              functionError
            );

            // Fallback: Try using getVerificationRequestsForDashboard instead
            try {
              const dashboardData =
                await contractAny.getVerificationRequestsForDashboard();
              console.log("Dashboard verification data:", dashboardData);

              if (dashboardData && dashboardData.length >= 4) {
                const [recentRequests, recentNames, recentRoles] =
                  dashboardData;

                for (let i = 0; i < recentRequests.length; i++) {
                  verificationRequests.push({
                    userAddress: recentRequests[i],
                    requestedRole: Number(recentRoles[i]),
                    verificationDocIpfsHash: "",
                    adminFeedback: "",
                    userName: recentNames[i],
                    timestamp: Date.now(),
                    requestTimestamp: Date.now(),
                    status: RequestStatus.Pending,
                    userInfo: {
                      name: recentNames[i] || "",
                      email: "",
                      dateOfBirth: 0,
                      identityNumber: "",
                      contactNumber: "",
                      bio: "",
                      profileImageIpfsHash: "",
                      supportiveLinks: [],
                    },
                  });
                }
              }
            } catch (fallbackError) {
              console.error("Fallback method also failed:", fallbackError);
            }
          }
        } else {
          console.log("User is not admin, skipping verification requests");
        }
      } catch (error) {
        console.error(
          "Error in admin verification or fetching requests:",
          error
        );
      }

      // Get campaign statistics
      const nextId = await contract.nextCampaignId();
      const totalCampaigns = Number(nextId) - 1;
      let activeCampaigns = 0;
      let completedCampaigns = 0;

      for (let i = 1; i <= totalCampaigns; i++) {
        try {
          const details = await contract.getCampaignDetails(i);
          if (details.isDeleted) continue;

          const start = Number(details.startDate);
          const end = Number(details.endDate);

          if (now >= start && now < end && details.isOpen) {
            activeCampaigns++;
          } else if (now >= end || !details.isOpen) {
            completedCampaigns++;
          }
        } catch (error) {
          console.error(`Error fetching campaign ${i}:`, error);
          continue;
        }
      }

      return {
        currentCampaign,
        participantStats,
        voteStats: {
          votedCount: Number(voteStats.votedCount),
          notVotedCount: Number(voteStats.notVotedCount),
          totalVoters: Number(voteStats.totalVoters),
        },
        monthlyCampaigns,
        candidates,
        voters,
        verificationRequests,
        totalCampaigns,
        campaignList: campaignList.map((campaign) => ({
          ...campaign,
          status:
            typeof campaign.status === "bigint"
              ? Number(campaign.status)
              : campaign.status,
        })),
        activeCampaigns,
        selectedCampaignId: targetCampaignId,
        completedCampaigns,
      } as AdminDashboardData;
    } catch (error) {
      console.error("Failed to fetch admin dashboard data:", error);
      const errorMessage = handleContractError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const selectCampaign = createAsyncThunk(
  "admin/selectCampaign",
  async (
    {
      campaignId,
      signer,
      provider,
    }: { campaignId: number; signer: ethers.Signer; provider: ethers.Provider },
    { dispatch, rejectWithValue }
  ) => {
    try {
      if (!provider) {
        throw new Error("No provider available from signer");
      }

      if (!signer) {
        throw new Error("Signer not available");
      }

      // Validate campaign exists and user has permission to view it
      const contract = new ethers.Contract(
        VOTING_CONTRACT_ADDRESS,
        VOTING_CONTRACT_ABI,
        provider
      );

      const isValidContract = await validateContract(contract);
      if (!isValidContract) {
        return rejectWithValue("Contract not found or invalid");
      }

      // Check if campaign exists
      try {
        const campaignDetails = await contract.getCampaignDetails(campaignId);
        if (campaignDetails.isDeleted) {
          return rejectWithValue("Selected campaign has been deleted");
        }
      } catch {
        return rejectWithValue("Campaign not found");
      }

      // Fetch dashboard data for the selected campaign
      await dispatch(fetchAdminDashboardData({ campaignId, signer, forceRefresh: true }));
      return campaignId;
    } catch (error) {
      console.error("Failed to select campaign:", error);
      const errorMessage = handleContractError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Helper function to get empty dashboard data
function getEmptyDashboardData(): AdminDashboardData {
  return {
    currentCampaign: null,
    campaignList: [],
    selectedCampaignId: 0,
    participantStats: { candidateCount: 0, voterCount: 0 },
    voteStats: { votedCount: 0, notVotedCount: 0, totalVoters: 0 },
    monthlyCampaigns: {
      campaignIds: [],
      titles: [],
      startDates: [],
      endDates: [],
      statuses: [],
      winners: [],
    },
    candidates: [],
    voters: [],
    verificationRequests: [],
    totalCampaigns: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
  };
}

// Add this helper function
export async function validateCampaignSwitch(
  contract: ethers.Contract,
  fromCampaignId: number,
  toCampaignId: number
): Promise<boolean> {
  const [fromCampaign, toCampaign] = await Promise.all([
    contract.getCampaignDetails.staticCall(fromCampaignId),
    contract.getCampaignDetails.staticCall(toCampaignId),
  ]);

  // Don't allow switching from active campaign if it's not completed
  if (
    fromCampaign.status === 1 && // Active
    !fromCampaign.isDeleted &&
    Number(fromCampaign.endDate) > Math.floor(Date.now() / 1000)
  ) {
    throw new Error("Cannot switch from active campaign before completion");
  }

  // Validate target campaign
  if (toCampaign.isDeleted) {
    throw new Error("Cannot switch to deleted campaign");
  }

  return true;
}
export const fetchAllCampaignIds = createAsyncThunk(
  "admin/fetchAllCampaignIds",
  async ({ provider }: { provider: ethers.Provider }, { rejectWithValue }) => {
    try {
      const contract = new ethers.Contract(
        VOTING_CONTRACT_ADDRESS,
        VOTING_CONTRACT_ABI,
        provider
      );

      const isValidContract = await validateContract(contract);
      if (!isValidContract) {
        return rejectWithValue("Contract not found or invalid");
      }

      const nextId = await contract.nextCampaignId.staticCall();
      const totalCampaigns = Number(nextId) - 1;
      const campaigns = [];

      for (let i = 1; i <= totalCampaigns; i++) {
        const details = await contract.getCampaignDetails.staticCall(i);
        if (!details.isDeleted) {
          campaigns.push({
            id: i,
            title: details.title,
            description: details.description,
            status:
              typeof details.status === "bigint"
                ? Number(details.status)
                : details.status,
          });
        }
      }

      return campaigns;
    } catch (error) {
      console.error("Failed to fetch campaign IDs:", error);
      return rejectWithValue(handleContractError(error));
    }
  }
);

export const adminCreateCampaign = createAsyncThunk(
  "admin/createCampaign",
  async (
    {
      startDate,
      endDate,
      detailsIpfsHash,
      title,
      description,
      signer,
    }: {
      startDate: number;
      endDate: number;
      detailsIpfsHash: string;
      title: string;
      description: string;
      signer: ethers.Signer;
    },
    { rejectWithValue }
  ) => {
    if (!signer) {
      return rejectWithValue(
        "Wallet not connected - please connect your wallet first"
      );
    }

    try {
      const contract = new ethers.Contract(
        VOTING_CONTRACT_ADDRESS,
        VOTING_CONTRACT_ABI,
        signer
      );

      // Validate contract
      const isValidContract = await validateContract(contract);
      if (!isValidContract) {
        return rejectWithValue(
          "Contract not found or invalid. Please check the contract address and deployment."
        );
      }

      const signerAddress = await signer.getAddress();
      const contractAdmin = await contract.admin.staticCall();

      if (signerAddress.toLowerCase() !== contractAdmin.toLowerCase()) {
        return rejectWithValue(
          "Access denied: Only admin can create campaigns"
        );
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

      const gasEstimate = await contract.createCampaign.estimateGas(
        startDate,
        endDate,
        detailsIpfsHash,
        title,
        description
      );
      const tx = await contract.createCampaign(
        startDate,
        endDate,
        detailsIpfsHash,
        title,
        description,
        {
          gasLimit: (gasEstimate * 120n) / 100n,
        }
      );

      const receipt = await tx.wait();

      let campaignId = 0;
      try {
        const campaignCreatedEvent = receipt.logs.find((log: ethers.Log) => {
          try {
            const parsed = contract.interface.parseLog(log);
            return parsed !== null && parsed.name === "CampaignCreated";
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
  async (
    { campaignId, signer }: { campaignId: number; signer: ethers.Signer },
    { rejectWithValue }
  ) => {
    if (!signer) {
      return rejectWithValue("Wallet not connected");
    }

    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      signer
    );

    try {
      // Validate contract
      const isValidContract = await validateContract(contract);
      if (!isValidContract) {
        return rejectWithValue(
          "Contract not found or invalid. Please check the contract address and deployment."
        );
      }

      const result = (await contract.getCampaignDetails.staticCall(
        campaignId
      )) as CampaignDetailsResponse;

      if (!result.isOpen || result.isDeleted) {
        return rejectWithValue("Campaign is already closed or deleted");
      }

      const now = Math.floor(Date.now() / 1000);
      if (now >= Number(result.startDate)) {
        return rejectWithValue(
          "Cannot delete campaign that has already started"
        );
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

async function getCampaignList(contract: ethers.Contract) {
  const nextId = await contract.nextCampaignId.staticCall();
  const totalCampaigns = Number(nextId) - 1;
  const campaigns = [];

  for (let i = 1; i <= totalCampaigns; i++) {
    try {
      const details = await contract.getCampaignDetails.staticCall(i);
      if (!details.isDeleted) {
        campaigns.push({
          id: i,
          title: details.title,
          startDate: Number(details.startDate),
          endDate: Number(details.endDate),
          status: details.status,
        });
      }
    } catch (error) {
      console.error(`Error fetching campaign ${i}:`, error);
      continue;
    }
  }

  return campaigns;
}

export const adminManualCloseCampaign = createAsyncThunk(
  "admin/manualCloseCampaign",
  async (
    { campaignId, signer }: { campaignId: number; signer: ethers.Signer },
    { rejectWithValue }
  ) => {
    if (!signer) {
      return rejectWithValue("Wallet not connected");
    }

    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      signer
    );

    try {
      // Validate contract
      const isValidContract = await validateContract(contract);
      if (!isValidContract) {
        return rejectWithValue(
          "Contract not found or invalid. Please check the contract address and deployment."
        );
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
  async (
    {
      userAddress,
      approved,
      feedback = "",
      signer,
    }: {
      userAddress: string;
      approved: boolean;
      feedback?: string;
      signer: ethers.Signer;
    },
    { rejectWithValue }
  ) => {
    if (!signer) {
      return rejectWithValue("Wallet not connected");
    }

    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      signer
    );

    try {
      // Validate contract
      const isValidContract = await validateContract(contract);
      if (!isValidContract) {
        return rejectWithValue(
          "Contract not found or invalid. Please check the contract address and deployment."
        );
      }

      const tx = await contract.processVerification(
        userAddress,
        approved,
        feedback
      );
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
  async (
    {
      userAddress,
      provider,
    }: { userAddress: string; provider: ethers.Provider },
    { rejectWithValue }
  ) => {
    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      provider
    );

    try {
      // Validate contract
      const isValidContract = await validateContract(contract);
      if (!isValidContract) {
        return rejectWithValue(
          "Contract not found or invalid. Please check the contract address and deployment."
        );
      }

      const request = await contract.verificationRequests.staticCall(
        userAddress
      );
      const userDetails = await contract.userDetails.staticCall(userAddress);

      return {
        userAddress: request.userAddress,
        requestedRole: Number(request.requestedRole),
        status: Number(request.status),
        verificationDocIpfsHash: request.verificationDocIpfsHash,
        adminFeedback: request.adminFeedback,
        timestamp: Number(request.requestTimestamp),
        userName: request.userName,
        requestTimestamp: Number(request.requestTimestamp),
        userInfo: {
          name: userDetails.name,
          email: userDetails.email,
          dateOfBirth: Number(userDetails.dateOfBirth),
          identityNumber: userDetails.identityNumber,
          contactNumber: userDetails.contactNumber,
          bio: userDetails.bio,
          profileImageIpfsHash: userDetails.profileImageIpfsHash,
          supportiveLinks: userDetails.supportiveLinks,
        },
      };
    } catch (error) {
      console.error("Failed to get verification request details:", error);
      const errorMessage = handleContractError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchVerificationRequests = createAsyncThunk(
  "admin/fetchVerificationRequests",
  async ({ signer }: { signer: ethers.Signer }, { rejectWithValue }) => {
    try {
      if (!signer) {
        return rejectWithValue("Wallet not connected");
      }

      const contract = new ethers.Contract(
        VOTING_CONTRACT_ADDRESS,
        VOTING_CONTRACT_ABI,
        signer
      );

      // Validate contract
      const isValidContract = await validateContract(contract);
      if (!isValidContract) {
        return rejectWithValue(
          "Contract not found or invalid. Please check the contract address and deployment."
        );
      }

      // Check if user is admin
      const signerAddress = await signer.getAddress();
      const contractAdmin = await contract.admin.staticCall();

      if (signerAddress.toLowerCase() !== contractAdmin.toLowerCase()) {
        return rejectWithValue(
          "Access denied: Only admin can fetch verification requests"
        );
      }

      const requestsData =
        await contract.getPendingVerificationRequests.staticCall();
      const verificationRequests: VerificationRequestData[] = [];

      if (requestsData && requestsData.length >= 6) {
        const [
          userAddresses,
          requestedRoles,
          verificationDocIpfsHashes,
          adminFeedbacks,
          userNames,
          timestamps,
        ] = requestsData;

        for (let i = 0; i < userAddresses.length; i++) {
          verificationRequests.push({
            userAddress: userAddresses[i],
            requestedRole: Number(requestedRoles[i]),
            verificationDocIpfsHash: verificationDocIpfsHashes[i],
            adminFeedback: adminFeedbacks[i],
            userName: userNames[i],
            timestamp: Number(timestamps[i]),
            requestTimestamp: Number(timestamps[i]),
            status: RequestStatus.Pending,
            userInfo: {
              name: userNames[i],
              email: "",
              dateOfBirth: 0,
              identityNumber: "",
              contactNumber: "",
              bio: "",
              profileImageIpfsHash: "",
              supportiveLinks: [],
            },
          });
        }
      }

      return verificationRequests;
    } catch (error) {
      console.error("Failed to fetch verification requests:", error);
      const errorMessage = handleContractError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Set public campaign for display
export const setPublicCampaignForDisplay = createAsyncThunk(
  "admin/setPublicCampaignForDisplay",
  async (
    { campaignId, signer }: { campaignId: number; signer: ethers.Signer },
    { rejectWithValue }
  ) => {
    try {
      const contract = new ethers.Contract(
        VOTING_CONTRACT_ADDRESS,
        VOTING_CONTRACT_ABI,
        signer
      );

      // Call the contract function to set the active campaign for public display
      const tx = await contract.switchToCampaign(campaignId);
      await tx.wait();

      toast.success("Public campaign updated successfully!");
      return campaignId;
    } catch (error) {
      console.error("Failed to set public campaign:", error);
      const errorMessage = handleContractError(error);
      toast.error(`Failed to set public campaign: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

// Auto-select urgent campaign
export const checkAndAutoSelectUrgentCampaign = createAsyncThunk(
  "admin/checkAndAutoSelectUrgentCampaign",
  async (_, { getState, dispatch }) => {
    const state = getState() as { 
      admin: { 
        autoSelectUrgent: boolean; 
        campaignList: Array<{
          id: number;
          status: number;
          startDate?: number;
        }>;
      } 
    };
    
    if (!state.admin.autoSelectUrgent) return null;
    
    const now = Math.floor(Date.now() / 1000);
    const urgentThreshold = 2 * 60 * 60; // 2 hours
    
    // Find campaigns starting within 2 hours
    const urgentCampaigns = state.admin.campaignList
      .filter(campaign => {
        const isUpcoming = campaign.status === 0; // Upcoming status
        const timeUntilStart = campaign.startDate ? campaign.startDate - now : Infinity;
        return isUpcoming && timeUntilStart > 0 && timeUntilStart <= urgentThreshold;
      })
      .sort((a, b) => (a.startDate || 0) - (b.startDate || 0)); // Sort by start date
    
    if (urgentCampaigns.length > 0) {
      // Auto-select the most urgent campaign for public display
      const urgentCampaignId = urgentCampaigns[0].id;
      dispatch({ type: "admin/setPublicCampaign", payload: urgentCampaignId });
      return urgentCampaignId;
    }
    
    return null;
  }
);
