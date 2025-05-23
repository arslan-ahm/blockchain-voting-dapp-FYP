import { createSlice } from "@reduxjs/toolkit";
import type { VerificationRequest } from "../../types";
import { fetchVerificationRequests, processVerification, requestVerification } from "../thunks/verificationThunks";

interface VerificationState {
  requests: VerificationRequest[];
  status: "idle" | "pending" | "fulfilled" | "rejected";
  error: string | null;
}

const initialState: VerificationState = {
  requests: [],
  status: "idle",
  error: null,
};

const verificationSlice = createSlice({
  name: "verification",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVerificationRequests.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchVerificationRequests.fulfilled, (state, action) => {
        state.requests = action.payload as unknown as VerificationRequest[];
        state.status = "fulfilled";
      })
      .addCase(fetchVerificationRequests.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message || "Failed to fetch verification requests";
      })
      .addCase(requestVerification.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(requestVerification.fulfilled, (state) => {
        state.status = "fulfilled";
      })
      .addCase(requestVerification.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message || "Failed to request verification";
      })
      .addCase(processVerification.fulfilled, (state, action) => {
        state.requests = state.requests.filter((r) => r.userAddress !== action.payload.userAddress);
      });
  },
});

export default verificationSlice.reducer;