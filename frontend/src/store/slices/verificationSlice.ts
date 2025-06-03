import { createSlice } from "@reduxjs/toolkit";
import type { VerificationRequest, UserDetails, Role } from "../../types";
import { 
  fetchVerificationRequests, 
  processVerification, 
  requestVerification,
  updateUserDetails,
  checkUserDetailsLocked,
  fetchUserDetails,
  fetchUserRole
} from "../thunks/verificationThunks";

interface VerificationState {
  requests: VerificationRequest[];
  status: "idle" | "pending" | "fulfilled" | "rejected";
  error: string | null;
  userDetails: UserDetails | null;
  userRole: Role | null;
  isUserDetailsLocked: boolean;
  updateDetailsStatus: "idle" | "pending" | "fulfilled" | "rejected";
}

const initialState: VerificationState = {
  requests: [],
  status: "idle",
  error: null,
  userDetails: null,
  userRole: null,
  isUserDetailsLocked: false,
  updateDetailsStatus: "idle",
};

const verificationSlice = createSlice({
  name: "verification",
  initialState,
  reducers: {
    clearVerificationError: (state) => {
      state.error = null;
    },
    resetVerificationStatus: (state) => {
      state.status = "idle";
      state.updateDetailsStatus = "idle";
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch verification requests
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
      
      // Request verification
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
      
      // Process verification
      .addCase(processVerification.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(processVerification.fulfilled, (state, action) => {
        state.requests = state.requests.filter((r) => r.userAddress !== action.payload.userAddress);
        state.status = "fulfilled";
      })
      .addCase(processVerification.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message || "Failed to process verification";
      })
      
      // Update user details
      .addCase(updateUserDetails.pending, (state) => {
        state.updateDetailsStatus = "pending";
        state.error = null;
      })
      .addCase(updateUserDetails.fulfilled, (state, action) => {
        state.updateDetailsStatus = "fulfilled";
        // Update the stored user details if they exist
        if (state.userDetails) {
          state.userDetails = {
            ...state.userDetails,
            ...action.payload
          };
        }
      })
      .addCase(updateUserDetails.rejected, (state, action) => {
        state.updateDetailsStatus = "rejected";
        state.error = action.error.message || "Failed to update user details";
      })
      
      // Check user details locked status
      .addCase(checkUserDetailsLocked.fulfilled, (state, action) => {
        state.isUserDetailsLocked = action.payload.isLocked;
      })
      .addCase(checkUserDetailsLocked.rejected, (state, action) => {
        state.error = action.error.message || "Failed to check lock status";
      })
      
      // Fetch user details
      .addCase(fetchUserDetails.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.userDetails = {
          name: action.payload.name,
          email: action.payload.email,
          dateOfBirth: parseInt(action.payload.dateOfBirth),
          identityNumber: action.payload.identityNumber,
          contactNumber: action.payload.contactNumber,
          bio: action.payload.bio,
          profileImageIpfsHash: action.payload.profileImageIpfsHash,
          supportiveLinks: action.payload.supportiveLinks
        };
        state.status = "fulfilled";
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message || "Failed to fetch user details";
      })
      
      // Fetch user role
      .addCase(fetchUserRole.fulfilled, (state, action) => {
        state.userRole = action.payload.role;
      })
      .addCase(fetchUserRole.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch user role";
      });
  },
});

export const { clearVerificationError, resetVerificationStatus } = verificationSlice.actions;
export default verificationSlice.reducer;