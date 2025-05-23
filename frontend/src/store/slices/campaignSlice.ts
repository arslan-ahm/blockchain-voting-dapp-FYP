import { createSlice } from "@reduxjs/toolkit";
import type { Campaign } from "../../types";
import { 
  fetchCampaigns, 
  createCampaign, 
  deleteCampaign, 
  getActiveCampaign,
  hasActiveCampaign 
} from "../thunks/campaignThunks";

interface CampaignState {
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  hasActive: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: CampaignState = {
  campaigns: [],
  activeCampaign: null,
  hasActive: false,
  loading: false,
  error: null,
};

const campaignSlice = createSlice({
  name: "campaign",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
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
        state.campaigns = action.payload;
        state.loading = false;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch campaigns";
      })
      
      // Create campaign
      .addCase(createCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.campaigns.push(action.payload);
        state.activeCampaign = action.payload;
        state.hasActive = true;
        state.loading = false;
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create campaign";
      })
      
      // Delete campaign
      .addCase(deleteCampaign.fulfilled, (state, action) => {
        state.campaigns = state.campaigns.filter((c) => c.id !== action.payload);
        if (state.activeCampaign?.id === action.payload) {
          state.activeCampaign = null;
          state.hasActive = false;
        }
      })
      
      // Get active campaign
      .addCase(getActiveCampaign.fulfilled, (state, action) => {
        state.activeCampaign = action.payload;
        state.hasActive = action.payload !== null;
      })
      
      // Check if has active campaign
      .addCase(hasActiveCampaign.fulfilled, (state, action) => {
        state.hasActive = action.payload;
        if (!action.payload) {
          state.activeCampaign = null;
        }
      });
  },
});

export const { clearError } = campaignSlice.actions;
export default campaignSlice.reducer;