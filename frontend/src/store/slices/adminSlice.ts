import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Campaign } from "../../types";
import { 
  fetchCampaigns, 
  fetchNearbyCampaigns,
  createCampaign, 
  deleteCampaign, 
  getActiveCampaign,
  hasActiveCampaign,
  registerForCampaign,
  checkUserRegistration,
  getCandidateVotes,
  getAllCandidateVotes,
  castVote,
  getUserVote,
  manualCloseCampaign,
  checkUpkeep,
  performUpkeep
} from "../thunks/campaignThunks";
import {
  fetchAdminDashboardData,
  adminCreateCampaign,
  adminDeleteCampaign,
  adminManualCloseCampaign,
  adminProcessVerification,
  getVerificationRequestDetails
} from "../thunks/adminThunks";

interface UserRegistration {
  campaignId: number;
  userAddress: string;
  isVoter: boolean;
  isCandidate: boolean;
}

interface CandidateVoteData {
  campaignId: number;
  candidateAddress: string;
  votes: number;
}

interface CampaignVoteData {
  campaignId: number;
  candidateVotes: { [address: string]: number };
}

interface UserVoteData {
  campaignId: number;
  userAddress: string;
  votedFor: string | null;
}

interface UpkeepData {
  campaignId: number;
  upkeepNeeded: boolean;
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

export interface VerificationRequestData {
  userAddress: string;
  requestedRole: number;
  verificationDocIpfsHash: string;
  adminFeedback: string;
  userName: string;
  timestamp: number;
  status: number;
}

interface AdminDashboardData {
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

interface CampaignState {
  campaigns: Campaign[];
  nearbyCampaigns: Campaign[];
  activeCampaign: Campaign | null;
  hasActive: boolean;
  loading: boolean;
  error: string | null;
  
  // Registration related state
  registrationLoading: boolean;
  registrationError: string | null;
  userRegistrations: UserRegistration[];
  
  // Voting related state
  votingLoading: boolean;
  votingError: string | null;
  candidateVotes: CandidateVoteData[];
  campaignVotes: CampaignVoteData[];
  userVotes: UserVoteData[];
  
  // Upkeep related state
  upkeepData: UpkeepData | null;
  upkeepLoading: boolean;
  
  // Admin dashboard state
  adminDashboard: AdminDashboardData | null;
  adminLoading: boolean;
  adminError: string | null;
  
  // Verification state
  verificationRequests: VerificationRequestData[];
  verificationLoading: boolean;
  verificationError: string | null;
  
  // UI state
  fetchingNearby: boolean;
  closingCampaign: boolean;
  deletingCampaign: boolean;
  creatingCampaign: boolean;
  checkingRegistration: boolean;
  fetchingVotes: boolean;
  processingVerification: boolean;
}

const initialState: CampaignState = {
  campaigns: [],
  nearbyCampaigns: [],
  activeCampaign: null,
  hasActive: false,
  loading: false,
  error: null,
  
  registrationLoading: false,
  registrationError: null,
  userRegistrations: [],
  
  votingLoading: false,
  votingError: null,
  candidateVotes: [],
  campaignVotes: [],
  userVotes: [],
  
  upkeepData: null,
  upkeepLoading: false,
  
  adminDashboard: null,
  adminLoading: false,
  adminError: null,
  
  verificationRequests: [],
  verificationLoading: false,
  verificationError: null,
  
  fetchingNearby: false,
  closingCampaign: false,
  deletingCampaign: false,
  creatingCampaign: false,
  checkingRegistration: false,
  fetchingVotes: false,
  processingVerification: false,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRegistrationError: (state) => {
      state.registrationError = null;
    },
    clearVotingError: (state) => {
      state.votingError = null;
    },
    clearAdminError: (state) => {
      state.adminError = null;
    },
    clearVerificationError: (state) => {
      state.verificationError = null;
    },
    resetCampaignState: () => {
      return initialState;
    },
    updateCampaignStatus: (state, action: PayloadAction<{ campaignId: number; isOpen: boolean; winner?: string }>) => {
      const { campaignId, isOpen, winner } = action.payload;
      
      // Update in campaigns array
      const campaignIndex = state.campaigns.findIndex(c => c.id === campaignId);
      if (campaignIndex !== -1) {
        state.campaigns[campaignIndex].isOpen = isOpen;
        if (winner) {
          state.campaigns[campaignIndex].winner = winner;
        }
      }
      
      // Update in nearby campaigns array
      const nearbyCampaignIndex = state.nearbyCampaigns.findIndex(c => c.id === campaignId);
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
          state.hasActive = false;
        }
      }
      
      // Update admin dashboard current campaign if it matches
      if (state.adminDashboard?.currentCampaign?.id === campaignId) {
        state.adminDashboard.currentCampaign.isOpen = isOpen;
        if (winner) {
          state.adminDashboard.currentCampaign.winner = winner;
        }
        if (!isOpen) {
          state.adminDashboard.currentCampaign.status = 'Completed';
        }
      }
    },
    updateUserVote: (state, action: PayloadAction<UserVoteData>) => {
      const existingIndex = state.userVotes.findIndex(
        vote => vote.campaignId === action.payload.campaignId && 
                vote.userAddress === action.payload.userAddress
      );
      
      if (existingIndex !== -1) {
        state.userVotes[existingIndex] = action.payload;
      } else {
        state.userVotes.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all campaigns
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.campaigns = action.payload.map(campaign => ({
          ...campaign,
          id: campaign.campaignId,
          voters: [],
          candidates: []
        }));
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch campaigns";
      })
      
      // Fetch nearby campaigns
      .addCase(fetchNearbyCampaigns.pending, (state) => {
        state.fetchingNearby = true;
        state.error = null;
      })
      .addCase(fetchNearbyCampaigns.fulfilled, (state, action) => {
        state.nearbyCampaigns = action.payload.map(campaign => ({
          ...campaign,
          id: campaign.campaignId,
          voters: [],
          candidates: []
        }));
        state.fetchingNearby = false;
        state.error = null;
      })
      .addCase(fetchNearbyCampaigns.rejected, (state, action) => {
        state.fetchingNearby = false;
        state.error = action.error.message || "Failed to fetch nearby campaigns";
      })
      
      // Create campaign
      .addCase(createCampaign.pending, (state) => {
        state.creatingCampaign = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        const newCampaign: Campaign = {
          id: Number(action.payload.campaignId),
          startDate: Number(action.payload.startDate),
          endDate: Number(action.payload.endDate),
          winner: "",
          isOpen: true,
          detailsIpfsHash: action.payload.campaignDetailsIpfsHash,
          voters: [],
          candidates: []
        };
        state.campaigns.push(newCampaign);
        state.activeCampaign = newCampaign;
        state.hasActive = true;
        state.creatingCampaign = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.creatingCampaign = false;
        state.loading = false;
        state.error = action.payload as string || "Failed to create campaign";
      })
      
      // Delete campaign
      .addCase(deleteCampaign.pending, (state) => {
        state.deletingCampaign = true;
        state.error = null;
      })
      .addCase(deleteCampaign.fulfilled, (state, action) => {
        const campaignId = Number(action.payload.campaignId);
        state.campaigns = state.campaigns.filter((c) => c.id !== campaignId);
        state.nearbyCampaigns = state.nearbyCampaigns.filter((c) => c.id !== campaignId);
        
        // Clean up related data
        state.userRegistrations = state.userRegistrations.filter(reg => reg.campaignId !== campaignId);
        state.candidateVotes = state.candidateVotes.filter(vote => vote.campaignId !== campaignId);
        state.campaignVotes = state.campaignVotes.filter(vote => vote.campaignId !== campaignId);
        state.userVotes = state.userVotes.filter(vote => vote.campaignId !== campaignId);
        
        if (state.activeCampaign?.id === campaignId) {
          state.activeCampaign = null;
          state.hasActive = false;
        }
        
        state.deletingCampaign = false;
        state.error = null;
      })
      .addCase(deleteCampaign.rejected, (state, action) => {
        state.deletingCampaign = false;
        state.error = action.payload as string || "Failed to delete campaign";
      })
      
      // Get active campaign
      .addCase(getActiveCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveCampaign.fulfilled, (state, action) => {
        if (action.payload) {
          state.activeCampaign = {
            id: Number(action.payload.campaignId),
            startDate: Number(action.payload.startDate),
            endDate: Number(action.payload.endDate),
            winner: action.payload.winner,
            isOpen: action.payload.isOpen,
            detailsIpfsHash: action.payload.detailsIpfsHash,
            voters: [],
            candidates: []
          };
          state.hasActive = true;
        } else {
          state.activeCampaign = null;
          state.hasActive = false;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(getActiveCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to get active campaign";
      })
      
      // Check if has active campaign
      .addCase(hasActiveCampaign.pending, () => {
        // Optional: add loading state if needed
      })
      .addCase(hasActiveCampaign.fulfilled, (state, action) => {
        state.hasActive = action.payload.hasActiveCampaign;
        if (!action.payload.hasActiveCampaign) {
          state.activeCampaign = null;
        }
      })
      .addCase(hasActiveCampaign.rejected, (state, action) => {
        state.error = action.error.message || "Failed to check active campaign";
      })
      
      // Register for campaign
      .addCase(registerForCampaign.pending, (state) => {
        state.registrationLoading = true;
        state.registrationError = null;
      })
      .addCase(registerForCampaign.fulfilled, (state) => {
        state.registrationLoading = false;
        state.registrationError = null;
      })
      .addCase(registerForCampaign.rejected, (state, action) => {
        state.registrationLoading = false;
        state.registrationError = action.payload as string || "Failed to register for campaign";
      })
      
      // Check user registration
      .addCase(checkUserRegistration.pending, (state) => {
        state.checkingRegistration = true;
      })
      .addCase(checkUserRegistration.fulfilled, (state, action) => {
        const existingIndex = state.userRegistrations.findIndex(
          reg => reg.campaignId === action.payload.campaignId && 
                 reg.userAddress === action.payload.userAddress
        );
        
        if (existingIndex !== -1) {
          state.userRegistrations[existingIndex] = action.payload;
        } else {
          state.userRegistrations.push(action.payload);
        }
        
        state.checkingRegistration = false;
      })
      .addCase(checkUserRegistration.rejected, (state, action) => {
        state.checkingRegistration = false;
        state.error = action.error.message || "Failed to check user registration";
      })
      
      // Get candidate votes
      .addCase(getCandidateVotes.pending, (state) => {
        state.fetchingVotes = true;
      })
      .addCase(getCandidateVotes.fulfilled, (state, action) => {
        const candidateVoteData: CandidateVoteData = {
          campaignId: action.payload.campaignId,
          candidateAddress: action.payload.candidate,
          votes: Number(action.payload.votes)
        };
        
        const existingIndex = state.candidateVotes.findIndex(
          vote => vote.campaignId === candidateVoteData.campaignId && 
                  vote.candidateAddress === candidateVoteData.candidateAddress
        );
        
        if (existingIndex !== -1) {
          state.candidateVotes[existingIndex] = candidateVoteData;
        } else {
          state.candidateVotes.push(candidateVoteData);
        }
        
        state.fetchingVotes = false;
      })
      .addCase(getCandidateVotes.rejected, (state, action) => {
        state.fetchingVotes = false;
        state.error = action.error.message || "Failed to get candidate votes";
      })
      
      // Get all candidate votes for a campaign
      .addCase(getAllCandidateVotes.pending, (state) => {
        state.fetchingVotes = true;
      })
      .addCase(getAllCandidateVotes.fulfilled, (state, action) => {
        const existingIndex = state.campaignVotes.findIndex(
          vote => vote.campaignId === action.payload.campaignId
        );
        
        if (existingIndex !== -1) {
          state.campaignVotes[existingIndex] = action.payload;
        } else {
          state.campaignVotes.push(action.payload);
        }
        
        state.fetchingVotes = false;
      })
      .addCase(getAllCandidateVotes.rejected, (state, action) => {
        state.fetchingVotes = false;
        state.error = action.error.message || "Failed to get campaign votes";
      })
      
      // Get user vote
      .addCase(getUserVote.pending, (state) => {
        state.fetchingVotes = true;
      })
      .addCase(getUserVote.fulfilled, (state, action) => {
        const userVoteData: UserVoteData = {
          campaignId: action.payload.campaignId,
          userAddress: action.payload.userAddress,
          votedFor: action.payload.votedCandidate
        };
        
        const existingIndex = state.userVotes.findIndex(
          vote => vote.campaignId === userVoteData.campaignId && 
                  vote.userAddress === userVoteData.userAddress
        );
        
        if (existingIndex !== -1) {
          state.userVotes[existingIndex] = userVoteData;
        } else {
          state.userVotes.push(userVoteData);
        }
        
        state.fetchingVotes = false;
      })
      .addCase(getUserVote.rejected, (state, action) => {
        state.fetchingVotes = false;
        state.error = action.error.message || "Failed to get user vote";
      })
      
      // Cast vote
      .addCase(castVote.pending, (state) => {
        state.votingLoading = true;
        state.votingError = null;
      })
      .addCase(castVote.fulfilled, (state, action) => {
        state.votingLoading = false;
        state.votingError = null;
        
        const { campaignId, candidate } = action.payload;
        
        // Update vote count for the candidate in the campaign votes
        const campaignVoteIndex = state.campaignVotes.findIndex(
          vote => vote.campaignId === campaignId
        );
        
        if (campaignVoteIndex !== -1) {
          const currentVotes = state.campaignVotes[campaignVoteIndex].candidateVotes[candidate] || 0;
          state.campaignVotes[campaignVoteIndex].candidateVotes[candidate] = currentVotes + 1;
        }
        
        // Update individual candidate vote record
        const candidateVoteIndex = state.candidateVotes.findIndex(
          vote => vote.campaignId === campaignId && 
                  vote.candidateAddress === candidate
        );
        
        if (candidateVoteIndex !== -1) {
          state.candidateVotes[candidateVoteIndex].votes += 1;
        }
        
        // Update user vote record
        const userVoteData: UserVoteData = {
          campaignId,
          userAddress: candidate, // Since we don't have voter address, use candidate for now
          votedFor: candidate
        };
        
        const userVoteIndex = state.userVotes.findIndex(
          vote => vote.campaignId === userVoteData.campaignId && 
                  vote.userAddress === userVoteData.userAddress
        );
        
        if (userVoteIndex !== -1) {
          state.userVotes[userVoteIndex] = userVoteData;
        } else {
          state.userVotes.push(userVoteData);
        }
      })
      .addCase(castVote.rejected, (state, action) => {
        state.votingLoading = false;
        state.votingError = action.payload as string || "Failed to cast vote";
      })
      
      // Manual close campaign
      .addCase(manualCloseCampaign.pending, (state) => {
        state.closingCampaign = true;
        state.error = null;
      })
      .addCase(manualCloseCampaign.fulfilled, (state, action) => {
        const campaignId = Number(action.payload.campaignId);
        
        // Update campaign status to closed
        const campaignIndex = state.campaigns.findIndex(c => c.id === campaignId);
        if (campaignIndex !== -1) {
          state.campaigns[campaignIndex].isOpen = false;
        }
        
        // Update nearby campaigns
        const nearbyCampaignIndex = state.nearbyCampaigns.findIndex(c => c.id === campaignId);
        if (nearbyCampaignIndex !== -1) {
          state.nearbyCampaigns[nearbyCampaignIndex].isOpen = false;
        }
        
        // Update active campaign if it matches
        if (state.activeCampaign?.id === campaignId) {
          state.activeCampaign.isOpen = false;
          state.activeCampaign = null;
          state.hasActive = false;
        }
        
        state.closingCampaign = false;
        state.error = null;
      })
      .addCase(manualCloseCampaign.rejected, (state, action) => {
        state.closingCampaign = false;
        state.error = action.payload as string || "Failed to close campaign";
      })
      
      // Check upkeep
      .addCase(checkUpkeep.pending, (state) => {
        state.upkeepLoading = true;
      })
      .addCase(checkUpkeep.fulfilled, (state, action) => {
        state.upkeepData = {
          campaignId: Number(action.payload.performData),
          upkeepNeeded: action.payload.upkeepNeeded
        };
        state.upkeepLoading = false;
      })
      .addCase(checkUpkeep.rejected, (state, action) => {
        state.upkeepData = null;
        state.upkeepLoading = false;
        state.error = action.error.message || "Failed to check upkeep";
      })
      
      // Perform upkeep
      .addCase(performUpkeep.pending, (state) => {
        state.upkeepLoading = true;
      })
      .addCase(performUpkeep.fulfilled, (state, action) => {
        const campaignId = Number(action.payload.performData);
        
        // Campaign has been closed via upkeep
        const campaignIndex = state.campaigns.findIndex(c => c.id === campaignId);
        if (campaignIndex !== -1) {
          state.campaigns[campaignIndex].isOpen = false;
        }
        
        // Update nearby campaigns
        const nearbyCampaignIndex = state.nearbyCampaigns.findIndex(c => c.id === campaignId);
        if (nearbyCampaignIndex !== -1) {
          state.nearbyCampaigns[nearbyCampaignIndex].isOpen = false;
        }
        
        if (state.activeCampaign?.id === campaignId) {
          state.activeCampaign.isOpen = false;
          state.activeCampaign = null;
          state.hasActive = false;
        }
        
        // Clear upkeep data
        state.upkeepData = null;
        state.upkeepLoading = false;
      })
      .addCase(performUpkeep.rejected, (state, action) => {
        state.upkeepLoading = false;
        state.error = action.payload as string || "Failed to perform upkeep";
      })
      
      // Admin Dashboard Data
      .addCase(fetchAdminDashboardData.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchAdminDashboardData.fulfilled, (state, action) => {
        state.adminDashboard = {
          ...action.payload,
          verificationRequests: action.payload.verificationRequests.map(request => ({
            ...request,
            requestedRole: Number(request.requestedRole),
            status: Number(request.status)
          }))
        };
        state.adminLoading = false;
        state.adminError = null;
      })
      .addCase(fetchAdminDashboardData.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload as string || "Failed to fetch admin dashboard data";
      })
      
      // Admin Create Campaign
      .addCase(adminCreateCampaign.pending, (state) => {
        state.creatingCampaign = true;
        state.adminError = null;
      })
      .addCase(adminCreateCampaign.fulfilled, (state) => {
        state.creatingCampaign = false;
        state.adminError = null;
        // Campaign ID is returned, refresh dashboard data will be needed
      })
      .addCase(adminCreateCampaign.rejected, (state, action) => {
        state.creatingCampaign = false;
        state.adminError = action.payload as string || "Failed to create campaign";
      })
      
      // Admin Delete Campaign
      .addCase(adminDeleteCampaign.pending, (state) => {
        state.deletingCampaign = true;
        state.adminError = null;
      })
      .addCase(adminDeleteCampaign.fulfilled, (state, action) => {
        state.deletingCampaign = false;
        state.adminError = null;
        
        // Remove from campaigns array
        state.campaigns = state.campaigns.filter((c) => c.id !== action.payload);
        state.nearbyCampaigns = state.nearbyCampaigns.filter((c) => c.id !== action.payload);
        
        // Clean up related data
        state.userRegistrations = state.userRegistrations.filter(reg => reg.campaignId !== action.payload);
        state.candidateVotes = state.candidateVotes.filter(vote => vote.campaignId !== action.payload);
        state.campaignVotes = state.campaignVotes.filter(vote => vote.campaignId !== action.payload);
        state.userVotes = state.userVotes.filter(vote => vote.campaignId !== action.payload);
        
        if (state.activeCampaign?.id === action.payload) {
          state.activeCampaign = null;
          state.hasActive = false;
        }
        
        // Update admin dashboard if current campaign was deleted
        if (state.adminDashboard?.currentCampaign?.id === action.payload) {
          if (state.adminDashboard) {
            state.adminDashboard.currentCampaign = null;
          }
        }
      })
      .addCase(adminDeleteCampaign.rejected, (state, action) => {
        state.deletingCampaign = false;
        state.adminError = action.payload as string || "Failed to delete campaign";
      })
      
      // Admin Manual Close Campaign
      .addCase(adminManualCloseCampaign.pending, (state) => {
        state.closingCampaign = true;
        state.adminError = null;
      })
      .addCase(adminManualCloseCampaign.fulfilled, (state, action) => {
        state.closingCampaign = false;
        state.adminError = null;
        
        // Update campaign status to closed
        const campaignIndex = state.campaigns.findIndex(c => c.id === action.payload);
        if (campaignIndex !== -1) {
          state.campaigns[campaignIndex].isOpen = false;
        }
        
        // Update nearby campaigns
        const nearbyCampaignIndex = state.nearbyCampaigns.findIndex(c => c.id === action.payload);
        if (nearbyCampaignIndex !== -1) {
          state.nearbyCampaigns[nearbyCampaignIndex].isOpen = false;
        }
        
        // Update active campaign if it matches
        if (state.activeCampaign?.id === action.payload) {
          const activeCampaign = state.activeCampaign;
          if (activeCampaign) {
            activeCampaign.isOpen = false;
          }
          state.activeCampaign = null;
          state.hasActive = false;
        }
        
        // Update admin dashboard current campaign if it matches
        if (state.adminDashboard?.currentCampaign?.id === action.payload) {
          const currentCampaign = state.adminDashboard?.currentCampaign;
          if (currentCampaign) {
            currentCampaign.isOpen = false;
            currentCampaign.status = 'Completed';
          }
        }
      })
      .addCase(adminManualCloseCampaign.rejected, (state, action) => {
        state.closingCampaign = false;
        state.adminError = action.payload as string || "Failed to close campaign";
      })
      
      // Admin Process Verification
      .addCase(adminProcessVerification.pending, (state) => {
        state.processingVerification = true;
        state.verificationError = null;
      })
      .addCase(adminProcessVerification.fulfilled, (state, action) => {
        state.processingVerification = false;
        state.verificationError = null;
        
        // Remove processed request from verification requests
        state.verificationRequests = state.verificationRequests.filter(
          req => req.userAddress !== action.payload.userAddress
        );
        
        // Also remove from admin dashboard verification requests if exists
        if (state.adminDashboard) {
          state.adminDashboard.verificationRequests = state.adminDashboard.verificationRequests.filter(
            req => req.userAddress !== action.payload.userAddress
          );
        }
      })
      .addCase(adminProcessVerification.rejected, (state, action) => {
        state.processingVerification = false;
        state.verificationError = action.payload as string || "Failed to process verification";
      })
      
      // Get Verification Request Details
      .addCase(getVerificationRequestDetails.pending, (state) => {
        state.verificationLoading = true;
        state.verificationError = null;
      })
      .addCase(getVerificationRequestDetails.fulfilled, (state) => {
        state.verificationLoading = false;
        state.verificationError = null;
        // Details are returned in payload, can be handled by component
      })
      .addCase(getVerificationRequestDetails.rejected, (state, action) => {
        state.verificationLoading = false;
        state.verificationError = action.payload as string || "Failed to get verification request details";
      });
  },
});

export const { 
  clearError, 
  clearRegistrationError, 
  clearVotingError,
  clearAdminError,
  clearVerificationError,
  resetCampaignState,
  updateCampaignStatus,
  updateUserVote
} = adminSlice.actions;

export default adminSlice.reducer;

// Update selector types
export const selectCampaigns = (state: { admin: CampaignState }) => state.admin.campaigns;
export const selectNearbyCampaigns = (state: { admin: CampaignState }) => state.admin.nearbyCampaigns;
export const selectActiveCampaign = (state: { admin: CampaignState }) => state.admin.activeCampaign;
export const selectHasActiveCampaign = (state: { admin: CampaignState }) => state.admin.hasActive;
export const selectCampaignLoading = (state: { admin: CampaignState }) => state.admin.loading;
export const selectCampaignError = (state: { admin: CampaignState }) => state.admin.error;

// Registration selectors
export const selectRegistrationLoading = (state: { admin: CampaignState }) => state.admin.registrationLoading;
export const selectRegistrationError = (state: { admin: CampaignState }) => state.admin.registrationError;
export const selectUserRegistrations = (state: { admin: CampaignState }) => state.admin.userRegistrations;
export const selectCheckingRegistration = (state: { admin: CampaignState }) => state.admin.checkingRegistration;

// Voting selectors
export const selectVotingLoading = (state: { admin: CampaignState }) => state.admin.votingLoading;
export const selectVotingError = (state: { admin: CampaignState }) => state.admin.votingError;
export const selectCandidateVotes = (state: { admin: CampaignState }) => state.admin.candidateVotes;
export const selectCampaignVotes = (state: { admin: CampaignState }) => state.admin.campaignVotes;
export const selectUserVotes = (state: { admin: CampaignState }) => state.admin.userVotes;
export const selectFetchingVotes = (state: { admin: CampaignState }) => state.admin.fetchingVotes;

// Upkeep selectors
export const selectUpkeepData = (state: { admin: CampaignState }) => state.admin.upkeepData;
export const selectUpkeepLoading = (state: { admin: CampaignState }) => state.admin.upkeepLoading;

// Admin dashboard selectors
export const selectAdminDashboard = (state: { admin: CampaignState }) => state.admin.adminDashboard;
export const selectAdminLoading = (state: { admin: CampaignState }) => state.admin.adminLoading;
export const selectAdminError = (state: { admin: CampaignState }) => state.admin.adminError;

// Verification selectors
export const selectVerificationRequests = (state: { admin: CampaignState }) => state.admin.verificationRequests;
export const selectVerificationLoading = (state: { admin: CampaignState }) => state.admin.verificationLoading;
export const selectVerificationError = (state: { admin: CampaignState }) => state.admin.verificationError;
export const selectProcessingVerification = (state: { admin: CampaignState }) => state.admin.processingVerification;

// UI state selectors
export const selectFetchingNearby = (state: { admin: CampaignState }) => state.admin.fetchingNearby;
export const selectClosingCampaign = (state: { admin: CampaignState }) => state.admin.closingCampaign;
export const selectDeletingCampaign = (state: { admin: CampaignState }) => state.admin.deletingCampaign;
export const selectCreatingCampaign = (state: { admin: CampaignState }) => state.admin.creatingCampaign;

// Helper selectors for specific data lookups
export const selectUserRegistrationForCampaign = (state: { admin: CampaignState }, campaignId: number, userAddress: string) => 
  state.admin.userRegistrations.find(reg => 
    reg.campaignId === campaignId && reg.userAddress.toLowerCase() === userAddress.toLowerCase()
  );

export const selectCandidateVotesForCampaign = (state: { admin: CampaignState }, campaignId: number) => 
  state.admin.candidateVotes.filter(vote => vote.campaignId === campaignId);

export const selectCampaignVotesById = (state: { admin: CampaignState }, campaignId: number) => 
  state.admin.campaignVotes.find(vote => vote.campaignId === campaignId);

export const selectUserVoteForCampaign = (state: { admin: CampaignState }, campaignId: number, userAddress: string) => 
  state.admin.userVotes.find(vote => 
    vote.campaignId === campaignId && vote.userAddress.toLowerCase() === userAddress.toLowerCase()
  );

export const selectCampaignById = (state: { admin: CampaignState }, campaignId: number) => 
  state.admin.campaigns.find(campaign => campaign.id === campaignId);

export const selectNearbyCampaignById = (state: { admin: CampaignState }, campaignId: number) => 
  state.admin.nearbyCampaigns.find(campaign => campaign.id === campaignId);

// Computed selectors
export const selectTotalVotesForCampaign = (state: { admin: CampaignState }, campaignId: number) => {
  const campaignVotes = state.admin.campaignVotes.find(vote => vote.campaignId === campaignId);
  if (!campaignVotes) return 0;
  
  return Object.values(campaignVotes.candidateVotes).reduce((total, votes) => total + votes, 0);
};

export const selectHasUserVoted = (state: { admin: CampaignState }, campaignId: number, userAddress: string) => {
  const userVote = state.admin.userVotes.find(vote => 
    vote.campaignId === campaignId && vote.userAddress.toLowerCase() === userAddress.toLowerCase()
  );
  return userVote?.votedFor !== null && userVote?.votedFor !== undefined;
};

export const selectIsUserRegisteredForCampaign = (state: { admin: CampaignState }, campaignId: number, userAddress: string) => {
  const registration = state.admin.userRegistrations.find(reg => 
    reg.campaignId === campaignId && reg.userAddress.toLowerCase() === userAddress.toLowerCase()
  );
  return registration !== undefined;
};

export const selectIsUserCandidateForCampaign = (state: { admin: CampaignState }, campaignId: number, userAddress: string) => {
  const registration = state.admin.userRegistrations.find(reg => 
    reg.campaignId === campaignId && reg.userAddress.toLowerCase() === userAddress.toLowerCase()
  );
  return registration?.isCandidate || false;
};

export const selectIsUserVoterForCampaign = (state: { admin: CampaignState }, campaignId: number, userAddress: string) => {
  const registration = state.admin.userRegistrations.find(reg => 
    reg.campaignId === campaignId && reg.userAddress.toLowerCase() === userAddress.toLowerCase()
  );
  return registration?.isVoter || false;
};