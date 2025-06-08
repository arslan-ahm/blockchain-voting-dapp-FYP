import { createSlice } from "@reduxjs/toolkit";
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
  performUpkeep,
  getCampaignStats,
  getCampaignVoters,
  getMonthlyCampaigns
} from "../thunks/campaignThunks";

export interface CampaignDetails {
  campaignId: string;
  startDate: string;
  endDate: string;
  winner: string;
  isOpen: boolean;
  isDeleted: boolean;
  detailsIpfsHash: string;
  title: string;
  description: string;
  totalVotes: string;
  voterCount: string;
  candidateCount: string;
  status: number;
}

interface CandidateVote {
  candidate: string;
  name?: string;
  votes: string;
}

interface UserRegistration {
  campaignId: number;
  userAddress: string;
  isVoter: boolean;
  isCandidate: boolean;
}

interface UserVote {
  campaignId: number;
  userAddress: string;
  votedCandidate: string | null;
}

interface VoterDetail {
  address: string;
  name: string;
  hasVoted: boolean;
}

interface CampaignStats {
  campaignId: number;
  totalVoters: string;
  votedCount: string;
  notVotedCount: string;
  candidateCount: string;
  voterCount: string;
}

interface MonthlyCampaign {
  campaignId: string;
  startDate: string;
  endDate: string;
  title: string;
  status: number;
  winner: string;
}

interface CampaignState {
  status: "idle" | "pending" | "success" | "error";
  error: string | null;
  
  campaigns: CampaignDetails[];
  nearbyCampaigns: CampaignDetails[];
  activeCampaign: CampaignDetails | null;
  
  voteStatus: "idle" | "pending" | "success" | "error";
  registrationStatus: "idle" | "pending" | "success" | "error";
  
  candidateVotes: { [campaignId: number]: CandidateVote[] };
  userRegistrations: UserRegistration[];
  userVotes: UserVote[];
  campaignVoters: { [campaignId: number]: VoterDetail[] };
  campaignStats: { [campaignId: number]: CampaignStats };
  monthlyCampaigns: { [month: number]: MonthlyCampaign[] };
  
  hasActiveCampaign: boolean;
  activeCampaignId: string;
  transactionHash: string | null;
  
  upkeepNeeded: boolean;
  performData: string | null;
  
  fetchingCampaigns: boolean;
  fetchingNearbyCampaigns: boolean;
  fetchingActiveCampaign: boolean;
  fetchingVotes: boolean;
  fetchingRegistration: boolean;
  fetchingStats: boolean;
  fetchingVoters: boolean;
  fetchingMonthlyCampaigns: boolean;
  creatingCampaign: boolean;
  deletingCampaign: boolean;
  castingVote: boolean;
  closingCampaign: boolean;
  performingUpkeep: boolean;
  checkingUpkeep: boolean;
}

const initialState: CampaignState = {
  status: "idle",
  error: null,
  
  campaigns: [],
  nearbyCampaigns: [],
  activeCampaign: null,
  
  voteStatus: "idle",
  registrationStatus: "idle",
  
  candidateVotes: {},
  userRegistrations: [],
  userVotes: [],
  campaignVoters: {},
  campaignStats: {},
  monthlyCampaigns: {},
  
  hasActiveCampaign: false,
  activeCampaignId: "0",
  transactionHash: null,
  
  upkeepNeeded: false,
  performData: null,
  
  fetchingCampaigns: false,
  fetchingNearbyCampaigns: false,
  fetchingActiveCampaign: false,
  fetchingVotes: false,
  fetchingRegistration: false,
  fetchingStats: false,
  fetchingVoters: false,
  fetchingMonthlyCampaigns: false,
  creatingCampaign: false,
  deletingCampaign: false,
  castingVote: false,
  closingCampaign: false,
  performingUpkeep: false,
  checkingUpkeep: false,
};

const campaignSlice = createSlice({
  name: "campaign",
  initialState,
  reducers: {
    resetVoteStatus(state) {
      state.voteStatus = "idle";
      state.error = null;
      state.transactionHash = null;
    },
    resetRegistrationStatus(state) {
      state.registrationStatus = "idle";
      state.error = null;
    },
    resetAllStatus(state) {
      state.status = "idle";
      state.voteStatus = "idle";
      state.registrationStatus = "idle";
      state.error = null;
      state.transactionHash = null;
    },
    clearError(state) {
      state.error = null;
    },
    clearTransactionHash(state) {
      state.transactionHash = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.fetchingCampaigns = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.fetchingCampaigns = false;
        state.campaigns = action.payload.map(campaign => ({
          ...campaign,
          campaignId: campaign.campaignId.toString()
        }));
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.fetchingCampaigns = false;
        state.error = action.error.message || "Failed to fetch campaigns";
      })
      
      .addCase(fetchNearbyCampaigns.pending, (state) => {
        state.fetchingNearbyCampaigns = true;
        state.error = null;
      })
      .addCase(fetchNearbyCampaigns.fulfilled, (state, action) => {
        state.fetchingNearbyCampaigns = false;
        state.nearbyCampaigns = action.payload;
      })
      .addCase(fetchNearbyCampaigns.rejected, (state, action) => {
        state.fetchingNearbyCampaigns = false;
        state.error = action.error.message || "Failed to fetch nearby campaigns";
      })
      
      .addCase(createCampaign.pending, (state) => {
        state.creatingCampaign = true;
        state.error = null;
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.creatingCampaign = false;
        state.transactionHash = action.payload.transactionHash;
        
        if (action.payload.campaignId) {
          const newCampaign: CampaignDetails = {
            campaignId: action.payload.campaignId,
            startDate: action.payload.startDate,
            endDate: action.payload.endDate,
            title: action.payload.title,
            description: action.payload.description,
            detailsIpfsHash: action.payload.campaignDetailsIpfsHash,
            winner: "",
            isOpen: true,
            isDeleted: false,
            totalVotes: "0",
            voterCount: "0",
            candidateCount: "0",
            status: 0
          };
          state.campaigns.push(newCampaign);
        }
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.creatingCampaign = false;
        state.error = action.error.message || "Failed to create campaign";
      })
      
      .addCase(deleteCampaign.pending, (state) => {
        state.deletingCampaign = true;
        state.error = null;
      })
      .addCase(deleteCampaign.fulfilled, (state, action) => {
        state.deletingCampaign = false;
        state.transactionHash = action.payload.transactionHash;
        
        const campaignIndex = state.campaigns.findIndex(
          c => c.campaignId === action.payload.campaignId.toString()
        );
        if (campaignIndex >= 0) {
          state.campaigns[campaignIndex].isDeleted = true;
        }
      })
      .addCase(deleteCampaign.rejected, (state, action) => {
        state.deletingCampaign = false;
        state.error = action.error.message || "Failed to delete campaign";
      })
      
      .addCase(getActiveCampaign.pending, (state) => {
        state.fetchingActiveCampaign = true;
        state.error = null;
      })
      .addCase(getActiveCampaign.fulfilled, (state, action) => {
        state.fetchingActiveCampaign = false;
        state.activeCampaign = action.payload;
      })
      .addCase(getActiveCampaign.rejected, (state, action) => {
        state.fetchingActiveCampaign = false;
        state.error = action.error.message || "Failed to fetch active campaign";
      })
      
      .addCase(hasActiveCampaign.fulfilled, (state, action) => {
        state.hasActiveCampaign = action.payload.hasActiveCampaign;
        state.activeCampaignId = action.payload.activeCampaignId;
      })
      .addCase(hasActiveCampaign.rejected, (state, action) => {
        state.error = action.error.message || "Failed to check active campaign";
      })
      
      .addCase(registerForCampaign.pending, (state) => {
        state.registrationStatus = "pending";
        state.error = null;
      })
      .addCase(registerForCampaign.fulfilled, (state, action) => {
        state.registrationStatus = "success";
        state.transactionHash = action.payload.transactionHash;
      })
      .addCase(registerForCampaign.rejected, (state, action) => {
        state.registrationStatus = "error";
        state.error = action.error.message || "Failed to register for campaign";
      })
      
      .addCase(checkUserRegistration.pending, (state) => {
        state.fetchingRegistration = true;
        state.error = null;
      })
      .addCase(checkUserRegistration.fulfilled, (state, action) => {
        state.fetchingRegistration = false;
        const registration = action.payload;
        
        const existingIndex = state.userRegistrations.findIndex(
          r => r.campaignId === registration.campaignId && r.userAddress === registration.userAddress
        );
        
        if (existingIndex >= 0) {
          state.userRegistrations[existingIndex] = registration;
        } else {
          state.userRegistrations.push(registration);
        }
      })
      .addCase(checkUserRegistration.rejected, (state, action) => {
        state.fetchingRegistration = false;
        state.error = action.error.message || "Failed to check user registration";
      })
      
      .addCase(getCandidateVotes.pending, (state) => {
        state.fetchingVotes = true;
        state.error = null;
      })
      .addCase(getCandidateVotes.fulfilled, (state, action) => {
        state.fetchingVotes = false;
        const { campaignId, candidate, votes } = action.payload;
        
        if (!state.candidateVotes[campaignId]) {
          state.candidateVotes[campaignId] = [];
        }
        
        const existingIndex = state.candidateVotes[campaignId].findIndex(
          cv => cv.candidate === candidate
        );
        
        if (existingIndex >= 0) {
          state.candidateVotes[campaignId][existingIndex].votes = votes;
        } else {
          state.candidateVotes[campaignId].push({ candidate, votes });
        }
      })
      .addCase(getCandidateVotes.rejected, (state, action) => {
        state.fetchingVotes = false;
        state.error = action.error.message || "Failed to fetch candidate votes";
      })
      
      .addCase(getAllCandidateVotes.pending, (state) => {
        state.fetchingVotes = true;
        state.error = null;
      })
      .addCase(getAllCandidateVotes.fulfilled, (state, action) => {
        state.fetchingVotes = false;
        const { campaignId, candidateVotes } = action.payload;
        state.candidateVotes[campaignId] = candidateVotes;
      })
      .addCase(getAllCandidateVotes.rejected, (state, action) => {
        state.fetchingVotes = false;
        state.error = action.error.message || "Failed to fetch all candidate votes";
      })
      
      .addCase(castVote.pending, (state) => {
        state.voteStatus = "pending";
        state.castingVote = true;
        state.error = null;
      })
      .addCase(castVote.fulfilled, (state, action) => {
        state.voteStatus = "success";
        state.castingVote = false;
        state.transactionHash = action.payload.transactionHash;
        
        const existingVoteIndex = state.userVotes.findIndex(
          v => v.campaignId === action.payload.campaignId
        );
        
        if (existingVoteIndex >= 0) {
          state.userVotes[existingVoteIndex].votedCandidate = action.payload.candidate;
        } else {
          state.userVotes.push({
            campaignId: action.payload.campaignId,
            userAddress: "",
            votedCandidate: action.payload.candidate
          });
        }
      })
      .addCase(castVote.rejected, (state, action) => {
        state.voteStatus = "error";
        state.castingVote = false;
        state.error = action.error.message || "Failed to cast vote";
      })
      
      .addCase(getUserVote.fulfilled, (state, action) => {
        const userVote = action.payload;
        
        const existingIndex = state.userVotes.findIndex(
          v => v.campaignId === userVote.campaignId && v.userAddress === userVote.userAddress
        );
        
        if (existingIndex >= 0) {
          state.userVotes[existingIndex] = userVote;
        } else {
          state.userVotes.push(userVote);
        }
      })
      .addCase(getUserVote.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch user vote";
      })
      
      .addCase(manualCloseCampaign.pending, (state) => {
        state.closingCampaign = true;
        state.error = null;
      })
      .addCase(manualCloseCampaign.fulfilled, (state, action) => {
        state.closingCampaign = false;
        state.transactionHash = action.payload.transactionHash;
        
        const campaignIndex = state.campaigns.findIndex(
          c => c.campaignId === action.payload.campaignId.toString()
        );
        if (campaignIndex >= 0) {
          state.campaigns[campaignIndex].isOpen = false;
          state.campaigns[campaignIndex].status = 2;
        }
      })
      .addCase(manualCloseCampaign.rejected, (state, action) => {
        state.closingCampaign = false;
        state.error = action.error.message || "Failed to close campaign";
      })
      
      .addCase(checkUpkeep.pending, (state) => {
        state.checkingUpkeep = true;
        state.error = null;
      })
      .addCase(checkUpkeep.fulfilled, (state, action) => {
        state.checkingUpkeep = false;
        state.upkeepNeeded = action.payload.upkeepNeeded;
        state.performData = action.payload.performData;
      })
      .addCase(checkUpkeep.rejected, (state, action) => {
        state.checkingUpkeep = false;
        state.error = action.error.message || "Failed to check upkeep";
      })
      
      .addCase(performUpkeep.pending, (state) => {
        state.performingUpkeep = true;
        state.error = null;
      })
      .addCase(performUpkeep.fulfilled, (state, action) => {
        state.performingUpkeep = false;
        state.transactionHash = action.payload.transactionHash;
        state.upkeepNeeded = false;
        state.performData = null;
      })
      .addCase(performUpkeep.rejected, (state, action) => {
        state.performingUpkeep = false;
        state.error = action.error.message || "Failed to perform upkeep";
      })
      
      .addCase(getCampaignStats.pending, (state) => {
        state.fetchingStats = true;
        state.error = null;
      })
      .addCase(getCampaignStats.fulfilled, (state, action) => {
        state.fetchingStats = false;
        const stats = action.payload;
        state.campaignStats[stats.campaignId] = stats;
      })
      .addCase(getCampaignStats.rejected, (state, action) => {
        state.fetchingStats = false;
        state.error = action.error.message || "Failed to fetch campaign statistics";
      })
      
      .addCase(getCampaignVoters.pending, (state) => {
        state.fetchingVoters = true;
        state.error = null;
      })
      .addCase(getCampaignVoters.fulfilled, (state, action) => {
        state.fetchingVoters = false;
        const { campaignId, voters } = action.payload;
        state.campaignVoters[campaignId] = voters;
      })
      .addCase(getCampaignVoters.rejected, (state, action) => {
        state.fetchingVoters = false;
        state.error = action.error.message || "Failed to fetch campaign voters";
      })
      
      .addCase(getMonthlyCampaigns.pending, (state) => {
        state.fetchingMonthlyCampaigns = true;
        state.error = null;
      })
      .addCase(getMonthlyCampaigns.fulfilled, (state, action) => {
        state.fetchingMonthlyCampaigns = false;
        const { month, campaigns } = action.payload;
        state.monthlyCampaigns[month] = campaigns;
      })
      .addCase(getMonthlyCampaigns.rejected, (state, action) => {
        state.fetchingMonthlyCampaigns = false;
        state.error = action.error.message || "Failed to fetch monthly campaigns";
      });
  },
});

export const { 
  resetVoteStatus, 
  resetRegistrationStatus, 
  resetAllStatus, 
  clearError,
  clearTransactionHash
} = campaignSlice.actions;

export default campaignSlice.reducer;