import { createSlice } from "@reduxjs/toolkit";
import { Role, type UserDetails } from "../../types";
import { 
  fetchUserDetails, 
  updateUserDetails, 
  requestVerification, 
  fetchNearbyCampaigns,
  registerForCampaign 
} from "../thunks/userThunks";
import type { ethers } from "ethers";

interface Campaign {
  id: number;
  startDate: number;
  endDate: number;
  winner: string;
  isOpen: boolean;
  detailsIpfsHash: string;
  voters: string[];
  candidates: string[];
}

interface UserState {
  account: string | null;
  details: UserDetails | null;
  role: Role;
  loading: boolean;
  error: string | null;
  providerConnected: boolean;
  signerConnected: boolean;
  provider: ethers.Provider | null;
  signer: ethers.Signer | null;
  isDetailsLocked: boolean;
  nearbyCampaigns: Campaign[];
  campaignsLoading: boolean;
  verificationLoading: boolean;
  registrationLoading: boolean;
}

const initialState: UserState = {
  account: null,
  details: null,
  role: Role.Unverified,
  loading: false,
  error: null,
  providerConnected: false,
  signerConnected: false,
  provider: null,
  signer: null,
  isDetailsLocked: false,
  nearbyCampaigns: [],
  campaignsLoading: false,
  verificationLoading: false,
  registrationLoading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.account = action.payload.account;
      state.provider = action.payload.provider;
      state.signer = action.payload.signer;
      state.providerConnected = !!action.payload.provider;
      state.signerConnected = !!action.payload.signer;
      
      console.log('Redux user updated:', {
        account: state.account,
        providerConnected: state.providerConnected,
        signerConnected: state.signerConnected
      });
    },
    clearUser(state) {
      state.account = null;
      state.details = null;
      state.role = Role.Unverified;
      state.providerConnected = false;
      state.signerConnected = false;
      state.provider = null;
      state.signer = null;
      state.isDetailsLocked = false;
      state.nearbyCampaigns = [];
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Details
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        if (action.payload) {
          state.details = action.payload.details;
          state.role = action.payload.role as Role;
          state.isDetailsLocked = action.payload.isDetailsLocked;
        }
        console.log("User details fetched successfully 👍");
        state.loading = false;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch user details";
      })
      
      // Update User Details
      .addCase(updateUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserDetails.fulfilled, (state, action) => {
        state.details = action.payload;
        state.loading = false;
        console.log("User details updated successfully 👍");
      })
      .addCase(updateUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to update user details";
      })
      
      // Request Verification
      .addCase(requestVerification.pending, (state) => {
        state.verificationLoading = true;
        state.error = null;
      })
      .addCase(requestVerification.fulfilled, (state) => {
        state.verificationLoading = false;
        state.role = Role.PendingVerification;
        console.log("Verification request submitted successfully 👍");
      })
      .addCase(requestVerification.rejected, (state, action) => {
        state.verificationLoading = false;
        state.error = action.payload as string || "Failed to request verification";
      })
      
      // Fetch Nearby Campaigns
      .addCase(fetchNearbyCampaigns.pending, (state) => {
        state.campaignsLoading = true;
        state.error = null;
      })
      .addCase(fetchNearbyCampaigns.fulfilled, (state, action) => {
        state.nearbyCampaigns = action.payload;
        state.campaignsLoading = false;
        console.log("Nearby campaigns fetched successfully 👍");
      })
      .addCase(fetchNearbyCampaigns.rejected, (state, action) => {
        state.campaignsLoading = false;
        state.error = action.payload as string || "Failed to fetch nearby campaigns";
      })
      
      // Register for Campaign
      .addCase(registerForCampaign.pending, (state) => {
        state.registrationLoading = true;
        state.error = null;
      })
      .addCase(registerForCampaign.fulfilled, (state, action) => {
        state.registrationLoading = false;
        console.log(`Successfully registered for campaign ${action.payload} 👍`);
      })
      .addCase(registerForCampaign.rejected, (state, action) => {
        state.registrationLoading = false;
        state.error = action.payload as string || "Failed to register for campaign";
      });
  },
});

export const { setUser, clearUser, clearError } = userSlice.actions;
export default userSlice.reducer;