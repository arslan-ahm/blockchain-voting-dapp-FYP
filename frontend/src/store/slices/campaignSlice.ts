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
  castVoteWithRoleCheck,
  getUserVote,
  manualCloseCampaign,
  checkUpkeep,
  performUpkeep,
  getCampaignStats,
  getCampaignVoters,
  getMonthlyCampaigns,
  getCampaignParticipants,
  getCampaignWithParticipants
} from "../thunks/campaignThunks";
import type {
  Campaign,
  CampaignState,
  CampaignStatus
} from "../../types";
import { mapCampaignStatus } from "../../utils/helpers";


const initialState: CampaignState = {
  status: "idle",
  error: null,
  
  campaigns: [],
  nearbyCampaigns: [],
  activeCampaign: null,
  currentCampaign: null,
  voteStatus: "idle",
  registrationStatus: "idle",
  
  candidateVotes: {},
  userRegistrations: [],
  userVotes: [],
  campaignVoters: {},
  campaignStats: {},
  monthlyCampaigns: {},
  campaignParticipants: {}, // Add this line
  
  fetchingParticipants: false,
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
          campaignId: campaign.id.toString()
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

      .addCase(getCampaignParticipants.pending, (state) => {
        state.fetchingParticipants = true;
        state.error = null;
      })
      .addCase(getCampaignParticipants.fulfilled, (state, action) => {
        state.fetchingParticipants = false;
        const { campaignId, candidates, voters } = action.payload;
        state.campaignParticipants[campaignId] = { candidates, voters };
      })
      .addCase(getCampaignParticipants.rejected, (state, action) => {
        state.fetchingParticipants = false;
        state.error = action.error.message || "Failed to fetch campaign participants";
      })
      
      .addCase(getCampaignWithParticipants.pending, (state) => {
        state.fetchingCampaigns = true;
        state.fetchingParticipants = true;
        state.error = null;
      })
      .addCase(getCampaignWithParticipants.fulfilled, (state, action) => {
        state.fetchingCampaigns = false;
        state.fetchingParticipants = false;
        const { id, candidates, voters, ...campaignDetails } = action.payload;
        
        // Update or add campaign details
        const existingIndex = state.campaigns.findIndex(
          c => c.id === id
        );
        
        if (existingIndex >= 0) {
          state.campaigns[existingIndex] = {
            ...state.campaigns[existingIndex],
            ...campaignDetails,
            id: id
          };
        } else {
          state.campaigns.push({
            ...campaignDetails,
            id: id
          });
        }
        
        // Update participants
        state.campaignParticipants[id] = { candidates, voters };
      })
      .addCase(getCampaignWithParticipants.rejected, (state, action) => {
        state.fetchingCampaigns = false;
        state.fetchingParticipants = false;
        state.error = action.error.message || "Failed to fetch campaign with participants";
      })
      
      .addCase(createCampaign.pending, (state) => {
        state.creatingCampaign = true;
        state.error = null;
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.creatingCampaign = false;
        state.transactionHash = action.payload.transactionHash;
        
        if (action.payload.campaignId) {
          const newCampaign: Campaign = {  // Change from CampaignDetails to Campaign
            id: action.payload.campaignId,
            startDate: action.payload.startDate,
            endDate: action.payload.endDate,
            title: action.payload.title,
            description: action.payload.description,
            detailsIpfsHash: action.payload.campaignDetailsIpfsHash,
            winner: "",
            isOpen: true,
            isDeleted: false,
            totalVotes: 0,
            voterCount: 0,
            candidateCount: 0,
            status: "Active" as CampaignStatus
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
          c => c.id === action.payload.campaignId
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
        state.activeCampaignId = action.payload.activeCampaignId.toString();
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
      .addCase(castVote.rejected, (state) => {
        state.voteStatus = "error";
        state.castingVote = false;
        // Don't set error state - errors are handled in component with toast
      })
      
      // Enhanced role-based voting
      .addCase(castVoteWithRoleCheck.pending, (state) => {
        state.voteStatus = "pending";
        state.castingVote = true;
        state.error = null;
      })
      .addCase(castVoteWithRoleCheck.fulfilled, (state, action) => {
        state.voteStatus = "success";
        state.castingVote = false;
        state.transactionHash = action.payload.transactionHash;
        
        const existingVoteIndex = state.userVotes.findIndex(
          v => v.campaignId === action.payload.campaignId && v.userAddress === action.payload.userAddress
        );
        
        if (existingVoteIndex >= 0) {
          state.userVotes[existingVoteIndex].votedCandidate = action.payload.candidate;
        } else {
          state.userVotes.push({
            campaignId: action.payload.campaignId,
            userAddress: action.payload.userAddress,
            votedCandidate: action.payload.candidate
          });
        }
      })
      .addCase(castVoteWithRoleCheck.rejected, (state) => {
        state.voteStatus = "error";
        state.castingVote = false;
        // Don't set error state - errors are handled in component with toast
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
      .addCase(getUserVote.rejected, (_, action) => {
        // Don't set error state - just log to console
        console.error("Failed to fetch user vote:", action.error.message);
      })
      
      .addCase(manualCloseCampaign.pending, (state) => {
        state.closingCampaign = true;
        state.error = null;
      })
      .addCase(manualCloseCampaign.fulfilled, (state, action) => {
        state.closingCampaign = false;
        state.transactionHash = action.payload.transactionHash;
        
        const campaignIndex = state.campaigns.findIndex(
          c => c.id === action.payload.campaignId
        );
        if (campaignIndex >= 0) {
          state.campaigns[campaignIndex].isOpen = false;
          state.campaigns[campaignIndex].status = mapCampaignStatus(2);
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