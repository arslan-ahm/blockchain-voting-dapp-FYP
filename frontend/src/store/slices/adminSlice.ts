import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  AdminDashboardData,
  VerificationRequestData,
  CampaignState,
  UserVote,
} from "../../types";
import {
  fetchAdminDashboardData,
  selectCampaign,
  fetchAllCampaignIds,
  adminCreateCampaign,
  adminDeleteCampaign,
  adminManualCloseCampaign,
  adminProcessVerification,
  getVerificationRequestDetails,
  fetchVerificationRequests,
  setPublicCampaignForDisplay,
  checkAndAutoSelectUrgentCampaign,
  fetchPublicCampaign,
} from "../thunks/adminThunks";
import { getStatusAsNumber, mapCampaignStatus } from "../../utils/helpers";

interface AdminState extends CampaignState {
  adminDashboard: AdminDashboardData | null;
  adminLoading: boolean;
  adminError: string | null;
  verificationRequests: VerificationRequestData[];
  verificationError: string | null;
  processingVerification: boolean;
  selectedCampaignId: number;
  publicCampaignId: number; // Campaign selected for public display
  autoSelectUrgent: boolean; // Whether to auto-select urgent campaigns
  campaignList: Array<{
    id: number;
    title: string;
    description?: string;
    status: number;
    startDate?: number;
    endDate?: number;
  }>;
  loading: boolean;
  stats: {
    campaignId: number;
    totalVotes: number;
    voterCount: number;
    candidateCount: number;
    votedCount: number;
    notVotedCount: number;
    totalVoters: number;
  };
  candidates: string[];
  voters: string[];
  creatingCampaign: boolean;
  deletingCampaign: boolean;
  closingCampaign: boolean;
  fetchingVerificationRequests: boolean;
  fetchingVerificationDetails: boolean;
  selectedVerificationRequest: VerificationRequestData | null;
}

const initialState: AdminState = {
  status: "idle",
  error: null,
  campaigns: [],
  nearbyCampaigns: [],
  activeCampaign: null,
  voteStatus: "idle",
  registrationStatus: "idle",
  candidateVotes: [],
  userRegistrations: [],
  userVotes: [],
  campaignVoters: {},
  campaignStats: {},
  monthlyCampaigns: [],
  hasActiveCampaign: false,
  activeCampaignId: "",
  transactionHash: null,
  upkeepNeeded: false,
  performData: null,
  currentCampaign: null,
  loading: false,
  campaignParticipants: [],
  fetchingParticipants: false,
  stats: {
    campaignId: 0,
    totalVotes: 0,
    voterCount: 0,
    candidateCount: 0,
    votedCount: 0,
    notVotedCount: 0,
    totalVoters: 0,
  },
  candidates: [],
  voters: [],
  fetchingCampaigns: false,
  fetchingNearbyCampaigns: false,
  fetchingActiveCampaign: false,
  fetchingVotes: false,
  fetchingRegistration: false,
  fetchingStats: false,
  fetchingVoters: false,
  fetchingMonthlyCampaigns: false,
  castingVote: false,
  performingUpkeep: false,
  checkingUpkeep: false,
  adminDashboard: null,
  adminLoading: false,
  adminError: null,
  verificationRequests: [],
  verificationError: null,
  processingVerification: false,
  selectedCampaignId: 0,
  publicCampaignId: 0,
  autoSelectUrgent: true,
  campaignList: [],
  creatingCampaign: false,
  deletingCampaign: false,
  closingCampaign: false,
  fetchingVerificationRequests: false,
  fetchingVerificationDetails: false,
  selectedVerificationRequest: null,
};

export const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAdminError: (state) => {
      state.adminError = null;
    },
    clearVerificationError: (state) => {
      state.verificationError = null;
    },
    resetAdminState: () => initialState,
    updateCampaignStatus: (
      state,
      action: PayloadAction<{
        campaignId: number;
        isOpen: boolean;
        winner?: string;
      }>
    ) => {
      const { campaignId, isOpen, winner } = action.payload;

      // Update in campaigns array
      const campaignIndex = state.campaigns.findIndex(
        (c) => c.id === campaignId
      );
      if (campaignIndex !== -1) {
        state.campaigns[campaignIndex].isOpen = isOpen;
        if (winner) {
          state.campaigns[campaignIndex].winner = winner;
        }
      }

      // Update in nearby campaigns array
      const nearbyCampaignIndex = state.nearbyCampaigns.findIndex(
        (c) => c.id === campaignId
      );
      if (nearbyCampaignIndex !== -1) {
        state.nearbyCampaigns[nearbyCampaignIndex].isOpen = isOpen;
        if (winner) {
          state.nearbyCampaigns[nearbyCampaignIndex].winner = winner;
        }
      }

      // Update active campaign if it matches
      if (state.activeCampaign?.id === campaignId) {
        state.activeCampaign.isOpen = isOpen;
        if (winner) {
          state.activeCampaign.winner = winner;
        }

        // If campaign is closed, it's no longer active
        if (!isOpen) {
          state.activeCampaign = null;
          state.hasActiveCampaign = false;
        }
      }

      // Update admin dashboard current campaign if it matches
      if (state.adminDashboard?.currentCampaign?.id === campaignId) {
        state.adminDashboard.currentCampaign.isOpen = isOpen;
        if (winner) {
          state.adminDashboard.currentCampaign.winner = winner;
        }
        if (!isOpen) {
          state.adminDashboard.currentCampaign.status = "Completed";
        }
      }
    },
    updateUserVote: (state, action: PayloadAction<UserVote>) => {
      const existingIndex = state.userVotes.findIndex(
        (vote) =>
          vote.campaignId === action.payload.campaignId &&
          vote.userAddress === action.payload.userAddress
      );

      if (existingIndex !== -1) {
        state.userVotes[existingIndex] = action.payload;
      } else {
        state.userVotes.push(action.payload);
      }
    },
    setSelectedCampaign: (state, action: PayloadAction<number>) => {
      state.selectedCampaignId = action.payload;
    },
    setPublicCampaign: (state, action: PayloadAction<number>) => {
      state.publicCampaignId = action.payload;
    },
    setAutoSelectUrgent: (state, action: PayloadAction<boolean>) => {
      state.autoSelectUrgent = action.payload;
    },
    autoSelectUrgentCampaign: (state) => {
      if (!state.autoSelectUrgent || state.campaignList.length === 0) return;

      const now = Math.floor(Date.now() / 1000);
      const urgentThreshold = 2 * 60 * 60; // 2 hours

      // Find campaigns starting within 2 hours
      const urgentCampaigns = state.campaignList
        .filter((campaign) => {
          const isUpcoming = campaign.status === 0; // Upcoming status
          const timeUntilStart = campaign.startDate ? campaign.startDate - now : Infinity;
          return (
            isUpcoming &&
            timeUntilStart > 0 &&
            timeUntilStart <= urgentThreshold
          );
        })
        .sort((a, b) => (a.startDate || 0) - (b.startDate || 0)); // Sort by start date

      if (urgentCampaigns.length > 0) {
        state.publicCampaignId = urgentCampaigns[0].id;
      }
    },
    removeVerificationRequest: (state, action: PayloadAction<string>) => {
      state.verificationRequests = state.verificationRequests.filter(
        (req) => req.userAddress !== action.payload
      );
      if (state.adminDashboard) {
        state.adminDashboard.verificationRequests =
          state.adminDashboard.verificationRequests.filter(
            (req) => req.userAddress !== action.payload
          );
      }
    },
    setSelectedVerificationRequest: (
      state,
      action: PayloadAction<VerificationRequestData | null>
    ) => {
      state.selectedVerificationRequest = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch admin dashboard data
      .addCase(fetchAdminDashboardData.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchAdminDashboardData.fulfilled, (state, action) => {
        state.adminDashboard = {
          ...action.payload,
          campaignList: action.payload.campaignList.map((campaign) => {
            const statusValue =
              typeof campaign.status === "bigint"
                ? Number(campaign.status)
                : typeof campaign.status === "string"
                ? getStatusAsNumber(campaign.status)
                : campaign.status;
            return {
              ...campaign,
              status: mapCampaignStatus(statusValue),
            };
          }),
        };
        state.selectedCampaignId = action.payload.selectedCampaignId;
        state.campaignList = action.payload.campaignList.map((campaign) => {
          const statusValue =
            typeof campaign.status === "bigint"
              ? Number(campaign.status)
              : typeof campaign.status === "string"
              ? getStatusAsNumber(campaign.status)
              : campaign.status;

          return {
            ...campaign,
            status: statusValue,
          };
        });
        state.verificationRequests = action.payload.verificationRequests;
        state.adminLoading = false;
        state.adminError = null;
      })
      .addCase(fetchAdminDashboardData.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError =
          (action.payload as string) || "Failed to fetch admin dashboard data";
      })

      // Select campaign
      .addCase(selectCampaign.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(selectCampaign.fulfilled, (state, action) => {
        state.selectedCampaignId = action.payload;
        state.adminLoading = false;
        state.adminError = null;
      })
      .addCase(selectCampaign.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.error.message || "Failed to select campaign";
      })

      // Fetch all campaign IDs
      .addCase(fetchAllCampaignIds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCampaignIds.fulfilled, (state, action) => {
        state.campaignList = action.payload.map((campaign) => ({
          ...campaign,
          status:
            typeof campaign.status === "bigint"
              ? Number(campaign.status)
              : campaign.status,
        }));
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchAllCampaignIds.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to fetch campaign IDs";
      })

      // Admin create campaign
      .addCase(adminCreateCampaign.pending, (state) => {
        state.creatingCampaign = true;
        state.adminError = null;
      })
      .addCase(adminCreateCampaign.fulfilled, (state) => {
        state.creatingCampaign = false;
        state.adminError = null;
        // Add the new campaign to the list if we have the dashboard data
        if (state.adminDashboard) {
          state.adminDashboard.totalCampaigns += 1;
        }
      })
      .addCase(adminCreateCampaign.rejected, (state, action) => {
        state.creatingCampaign = false;
        state.adminError =
          (action.payload as string) || "Failed to create campaign";
      })

      // Admin delete campaign
      .addCase(adminDeleteCampaign.pending, (state) => {
        state.deletingCampaign = true;
        state.adminError = null;
      })
      .addCase(adminDeleteCampaign.fulfilled, (state, action) => {
        state.deletingCampaign = false;
        state.adminError = null;
        const deletedCampaignId = action.payload;

        // Remove from campaign list
        state.campaignList = state.campaignList.filter(
          (c) => c.id !== deletedCampaignId
        );

        // Update admin dashboard if the deleted campaign was selected
        if (state.selectedCampaignId === deletedCampaignId) {
          state.selectedCampaignId = 0;
          if (state.adminDashboard) {
            state.adminDashboard.currentCampaign = null;
            state.adminDashboard.selectedCampaignId = 0;
          }
        }
      })
      .addCase(adminDeleteCampaign.rejected, (state, action) => {
        state.deletingCampaign = false;
        state.adminError =
          (action.payload as string) || "Failed to delete campaign";
      })

      // Admin manual close campaign
      .addCase(adminManualCloseCampaign.pending, (state) => {
        state.closingCampaign = true;
        state.adminError = null;
      })
      .addCase(adminManualCloseCampaign.fulfilled, (state, action) => {
        state.closingCampaign = false;
        state.adminError = null;
        const closedCampaignId = action.payload;

        // Update campaign status in admin dashboard
        if (state.adminDashboard?.currentCampaign?.id === closedCampaignId) {
          state.adminDashboard.currentCampaign.isOpen = false;
          state.adminDashboard.currentCampaign.status = "Completed";
        }
      })
      .addCase(adminManualCloseCampaign.rejected, (state, action) => {
        state.closingCampaign = false;
        state.adminError =
          (action.payload as string) || "Failed to close campaign";
      })

      // Admin process verification
      .addCase(adminProcessVerification.pending, (state) => {
        state.processingVerification = true;
        state.verificationError = null;
      })
      .addCase(adminProcessVerification.fulfilled, (state, action) => {
        state.processingVerification = false;
        state.verificationError = null;
        const { userAddress } = action.payload;

        // Remove the processed request from the list
        state.verificationRequests = state.verificationRequests.filter(
          (req) => req.userAddress !== userAddress
        );

        if (state.adminDashboard) {
          state.adminDashboard.verificationRequests =
            state.adminDashboard.verificationRequests.filter(
              (req) => req.userAddress !== userAddress
            );
        }

        // Clear selected request if it was the processed one
        if (state.selectedVerificationRequest?.userAddress === userAddress) {
          state.selectedVerificationRequest = null;
        }
      })
      .addCase(adminProcessVerification.rejected, (state, action) => {
        state.processingVerification = false;
        state.verificationError =
          (action.payload as string) || "Failed to process verification";
      })

      // Get verification request details
      .addCase(getVerificationRequestDetails.pending, (state) => {
        state.fetchingVerificationDetails = true;
        state.verificationError = null;
      })
      .addCase(getVerificationRequestDetails.fulfilled, (state, action) => {
        state.fetchingVerificationDetails = false;
        state.verificationError = null;
        state.selectedVerificationRequest = action.payload;
      })
      .addCase(getVerificationRequestDetails.rejected, (state, action) => {
        state.fetchingVerificationDetails = false;
        state.verificationError =
          (action.payload as string) ||
          "Failed to get verification request details";
      })

      // Fetch verification requests
      .addCase(fetchVerificationRequests.pending, (state) => {
        state.fetchingVerificationRequests = true;
        state.verificationError = null;
      })
      .addCase(fetchVerificationRequests.fulfilled, (state, action) => {
        state.fetchingVerificationRequests = false;
        state.verificationError = null;
        state.verificationRequests = action.payload;
      })
      .addCase(fetchVerificationRequests.rejected, (state, action) => {
        state.fetchingVerificationRequests = false;
        state.verificationError =
          (action.payload as string) || "Failed to fetch verification requests";
      })

      // Set public campaign for display
      .addCase(setPublicCampaignForDisplay.fulfilled, (state, action) => {
        state.publicCampaignId = action.payload;
      })

      // Auto-select urgent campaign - only affects publicCampaignId, not selectedCampaignId
      .addCase(checkAndAutoSelectUrgentCampaign.fulfilled, (state, action) => {
        if (action.payload !== null) {
          // Only update the public campaign, don't touch selectedCampaignId
          state.publicCampaignId = action.payload;
        }
      })
      
      // Fetch public campaign
      .addCase(fetchPublicCampaign.fulfilled, (state, action) => {
        state.publicCampaignId = action.payload;
      });
  },
});

export const {
  clearError,
  clearAdminError,
  clearVerificationError,
  resetAdminState,
  updateCampaignStatus,
  updateUserVote,
  setSelectedCampaign,
  setPublicCampaign,
  setAutoSelectUrgent,
  autoSelectUrgentCampaign,
  removeVerificationRequest,
  setSelectedVerificationRequest,
} = adminSlice.actions;

export default adminSlice.reducer;

// Selectors
export const selectAdminDashboard = (state: { admin: AdminState }) =>
  state.admin.adminDashboard;
export const selectAdminLoading = (state: { admin: AdminState }) =>
  state.admin.adminLoading;
export const selectAdminError = (state: { admin: AdminState }) =>
  state.admin.adminError;
export const selectVerificationRequests = (state: { admin: AdminState }) =>
  state.admin.verificationRequests;
export const selectVerificationError = (state: { admin: AdminState }) =>
  state.admin.verificationError;
export const selectProcessingVerification = (state: { admin: AdminState }) =>
  state.admin.processingVerification;
export const selectSelectedCampaignId = (state: { admin: AdminState }) =>
  state.admin.selectedCampaignId;
export const selectPublicCampaignId = (state: { admin: AdminState }) =>
  state.admin.publicCampaignId;
export const selectAutoSelectUrgent = (state: { admin: AdminState }) =>
  state.admin.autoSelectUrgent;
export const selectPublicCampaign = (state: { admin: AdminState }) => {
  const publicCampaignId = state.admin.publicCampaignId;
  return state.admin.campaignList.find(campaign => campaign.id === publicCampaignId) || null;
};
export const selectCampaignList = (state: { admin: AdminState }) =>
  state.admin.campaignList;
export const selectCreatingCampaign = (state: { admin: AdminState }) =>
  state.admin.creatingCampaign;
export const selectDeletingCampaign = (state: { admin: AdminState }) =>
  state.admin.deletingCampaign;
export const selectClosingCampaign = (state: { admin: AdminState }) =>
  state.admin.closingCampaign;
export const selectFetchingVerificationRequests = (state: {
  admin: AdminState;
}) => state.admin.fetchingVerificationRequests;
export const selectFetchingVerificationDetails = (state: {
  admin: AdminState;
}) => state.admin.fetchingVerificationDetails;
export const selectSelectedVerificationRequest = (state: {
  admin: AdminState;
}) => state.admin.selectedVerificationRequest;

export const selectCurrentCampaign = (state: { admin: AdminState }) =>
  state.admin.adminDashboard?.currentCampaign;
export const selectCandidates = (state: { admin: AdminState }) =>
  state.admin.adminDashboard?.candidates || [];
export const selectVoters = (state: { admin: AdminState }) =>
  state.admin.adminDashboard?.voters || [];
export const selectParticipantStats = (state: { admin: AdminState }) =>
  state.admin.adminDashboard?.participantStats;
export const selectVoteStats = (state: { admin: AdminState }) =>
  state.admin.adminDashboard?.voteStats;
export const selectMonthlyCampaigns = (state: { admin: AdminState }) =>
  state.admin.adminDashboard?.monthlyCampaigns;
export const selectTotalCampaigns = (state: { admin: AdminState }) =>
  state.admin.adminDashboard?.totalCampaigns || 0;
export const selectActiveCampaigns = (state: { admin: AdminState }) =>
  state.admin.adminDashboard?.activeCampaigns || 0;
export const selectCompletedCampaigns = (state: { admin: AdminState }) =>
  state.admin.adminDashboard?.completedCampaigns || 0;

export const selectIsUserCandidateForCampaign = (
  state: { admin: AdminState },
  campaignId: number,
  userAddress: string
) => {
  const registration = state.admin.userRegistrations.find(
    (reg) =>
      reg.campaignId === campaignId &&
      reg.userAddress.toLowerCase() === userAddress.toLowerCase()
  );
  return registration?.isCandidate || false;
};

export const selectIsUserVoterForCampaign = (
  state: { admin: AdminState },
  campaignId: number,
  userAddress: string
) => {
  const registration = state.admin.userRegistrations.find(
    (reg) =>
      reg.campaignId === campaignId &&
      reg.userAddress.toLowerCase() === userAddress.toLowerCase()
  );
  return registration?.isVoter || false;
};
