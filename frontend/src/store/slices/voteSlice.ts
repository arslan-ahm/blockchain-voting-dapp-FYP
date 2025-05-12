import { createSlice } from "@reduxjs/toolkit";
import { submitVote, registerForCampaign } from "../thunks/voteThunks";

interface VoteState {
  status: "idle" | "pending" | "success" | "error";
  error: string | null;
  transactionHash: string | null;
}

const initialState: VoteState = {
  status: "idle",
  error: null,
  transactionHash: null,
};

const voteSlice = createSlice({
  name: "vote",
  initialState,
  reducers: {
    resetVoteStatus(state) {
      state.status = "idle";
      state.error = null;
      state.transactionHash = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitVote.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(submitVote.fulfilled, (state, action) => {
        state.status = "success";
        state.transactionHash = action.payload;
      })
      .addCase(submitVote.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message || "Failed to submit vote";
        state.transactionHash = null;
      })
      .addCase(registerForCampaign.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(registerForCampaign.fulfilled, (state) => {
        state.status = "success";
      })
      .addCase(registerForCampaign.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message || "Failed to register for campaign";
      });
  },
});

export const { resetVoteStatus } = voteSlice.actions;
export default voteSlice.reducer;