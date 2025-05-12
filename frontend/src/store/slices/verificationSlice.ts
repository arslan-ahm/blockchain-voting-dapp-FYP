import { createSlice } from "@reduxjs/toolkit";
import { requestVerification, fetchVerificationRequests, processVerification } from "../thunks/verificationThunks";
import type { VerificationRequest } from "../../types";

interface VerificationState {
  requests: VerificationRequest[];
  status: "idle" | "pending" | "success" | "error";
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
      .addCase(requestVerification.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(requestVerification.fulfilled, (state) => {
        state.status = "success";
      })
      .addCase(requestVerification.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message || "Failed to request verification";
      })
      .addCase(fetchVerificationRequests.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchVerificationRequests.fulfilled, (state, action) => {
        state.requests = action.payload;
        state.status = "success";
      })
      .addCase(fetchVerificationRequests.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message || "Failed to fetch verification requests";
      })
      .addCase(processVerification.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(processVerification.fulfilled, (state, action) => {
        state.requests = state.requests.filter((req) => req.userAddress !== action.payload.userAddress);
        state.status = "success";
      })
      .addCase(processVerification.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message || "Failed to process verification";
      });
  },
});

export default verificationSlice.reducer;