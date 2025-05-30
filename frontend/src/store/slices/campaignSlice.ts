import { createSlice } from "@reduxjs/toolkit";
import type { Campaign } from "../../types";
import { fetchCampaigns, createCampaign, deleteCampaign } from "../thunks/campaignThunks";

interface CampaignState {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
}

const initialState: CampaignState = {
  campaigns: [],
  loading: false,
  error: null,
};

const campaignSlice = createSlice({
  name: "campaign",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.campaigns.push(action.payload);
      })
      .addCase(deleteCampaign.fulfilled, (state, action) => {
        state.campaigns = state.campaigns.filter((c) => c.id !== action.payload);
      });
  },
});

export default campaignSlice.reducer;