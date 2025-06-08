import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI } from "../../constants/contract";
import { toast } from "sonner";
import type { UserDetails } from "../../types";

export const fetchUserDetails = createAsyncThunk(
  "user/fetchUserDetails",
  async ({account, provider}: {account: string, provider: ethers.Provider}, { rejectWithValue }) => {
    try {
      if (!account || !ethers.isAddress(account)) {
        throw new Error(`Invalid account address: ${account}`);
      }

      if (!VOTING_CONTRACT_ADDRESS || !ethers.isAddress(VOTING_CONTRACT_ADDRESS)) {
        throw new Error(`Invalid contract address: ${VOTING_CONTRACT_ADDRESS}`);
      }

      if (!VOTING_CONTRACT_ABI || !Array.isArray(VOTING_CONTRACT_ABI) || VOTING_CONTRACT_ABI.length === 0) {
        throw new Error("Invalid contract ABI - must be a non-empty array");
      }

      // Validate required functions in ABI
      const adminFunction = VOTING_CONTRACT_ABI.find(item => item.name === 'admin' && item.type === 'function');
      const userDetailsFunction = VOTING_CONTRACT_ABI.find(item => item.name === 'userDetails' && item.type === 'function');
      const userRolesFunction = VOTING_CONTRACT_ABI.find(item => item.name === 'userRoles' && item.type === 'function');
      const userDetailsLockedFunction = VOTING_CONTRACT_ABI.find(item => item.name === 'isUserDetailsLocked' && item.type === 'function');

      if (!adminFunction) {
        throw new Error("admin() function not found in ABI");
      }
      if (!userDetailsFunction) {
        throw new Error("userDetails() function not found in ABI");
      }
      if (!userRolesFunction) {
        throw new Error("userRoles() function not found in ABI");
      }
      if (!userDetailsLockedFunction) {
        throw new Error("isUserDetailsLocked() function not found in ABI");
      }

      try {
        const network = await provider.getNetwork();
        console.log("✓ Connected to network:", {
          name: network.name,
          chainId: network.chainId.toString()
        });

        const blockNumber = await provider.getBlockNumber();
        console.log("✓ Latest block number:", blockNumber);
      } catch (networkError) {
        console.error("✗ Provider connection failed:", networkError);
        throw new Error(
          `Failed to connect to blockchain network: ${
            networkError instanceof Error ? networkError.message : String(networkError)
          }`
        );
      }

      const contract = new ethers.Contract(
        VOTING_CONTRACT_ADDRESS,
        VOTING_CONTRACT_ABI,
        provider
      );

      try {
        const bytecode = await provider.getCode(VOTING_CONTRACT_ADDRESS);
        
        if (bytecode === "0x") {
          throw new Error(`No contract deployed at address ${VOTING_CONTRACT_ADDRESS}. Please check:
1. The contract address is correct
2. You're connected to the right network
3. The contract is actually deployed`);
        }
      } catch (bytecodeError) {
        console.error("✗ Contract deployment check failed:", bytecodeError);
        throw bytecodeError;
      }

      try {
        const admin = await contract.admin();
        if (!admin || admin === ethers.ZeroAddress) {
          console.warn("⚠ Admin address is zero or empty");
        }
      } catch (adminError) {
        console.error("✗ Admin call failed:", adminError);
        throw new Error(`Contract admin() call failed: ${(adminError as Error).message}. This suggests:
1. The contract ABI doesn't match the deployed contract
2. The contract address is wrong
3. The network is incorrect`);
      }

      let details;
      try {
        details = await contract.userDetails(account);
      } catch (detailsError) {
        console.error("✗ User details fetch failed:", detailsError);
        throw new Error(
          `Failed to fetch user details: ${
            detailsError instanceof Error ? detailsError.message : "Unknown error"
          }`
        );
      }

      let role;
      try {
        role = await contract.userRoles(account);
      } catch (roleError) {
        console.error("✗ User role fetch failed:", roleError);
        if (roleError instanceof Error) {
          throw new Error(`Failed to fetch user role: ${roleError.message}`);
        } else {
          throw new Error("Failed to fetch user role: Unknown error");
        }
      }

      let isDetailsLocked = false;
      try {
        isDetailsLocked = await contract.isUserDetailsLocked(account);
      } catch (lockedError) {
        console.warn("⚠ Could not fetch user details lock status:", lockedError);
        // Don't throw error, just set default value
      }

      const userDetails = {
        name: details.name || "",
        email: details.email || "",
        dateOfBirth: Number(details.dateOfBirth) || 0,
        identityNumber: details.identityNumber || "",
        contactNumber: details.contactNumber || "",
        bio: details.bio || "",
        profileImageIpfsHash: details.profileImageIpfsHash || "",
        supportiveLinks: Array.isArray(details.supportiveLinks)
          ? details.supportiveLinks
          : [],
      };

      const userRole = Number(role);
      
      return {
        details: userDetails,
        role: userRole,
        isDetailsLocked,
      };

    } catch (error) {
      console.error("=== fetchUserDetails Error ===");
      console.error("Error:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        if ("code" in error) {
          console.error("Error code:", (error as { code?: unknown }).code);
        }

        let errorMessage = "Failed to fetch user details";

        if (error.message?.includes("No contract deployed")) {
          errorMessage = error.message;
        } else if (error.message?.includes("admin() function not found")) {
          errorMessage = "Contract ABI mismatch - admin function missing";
        } else if (error.message?.includes("userDetails() function not found")) {
          errorMessage = "Contract ABI mismatch - userDetails function missing";
        } else if (error.message?.includes("userRoles() function not found")) {
          errorMessage = "Contract ABI mismatch - userRoles function missing";
        } else if (error.message?.includes("isUserDetailsLocked() function not found")) {
          errorMessage = "Contract ABI mismatch - isUserDetailsLocked function missing";
        } else if (error.message?.includes("VITE_RPC_URL")) {
          errorMessage = "RPC URL not configured in environment variables";
        } else if (error.message?.includes("Invalid account address")) {
          errorMessage = error.message;
        } else if (error.message?.includes("Invalid contract address")) {
          errorMessage = error.message;
        } else if (error.message?.includes("network")) {
          errorMessage = `Network connection error: ${error.message}`;
        } else if (
          typeof (error as { code?: unknown }).code === "string" &&
          (error as { code?: unknown }).code === "CALL_EXCEPTION"
        ) {
          errorMessage = "Contract call failed - check contract address and network";
        } else if (
          typeof (error as { code?: unknown }).code === "string" &&
          (error as { code?: unknown }).code === "BAD_DATA"
        ) {
          errorMessage = "Contract returned invalid data - likely wrong network or address";
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast.error(errorMessage);
        return rejectWithValue(errorMessage);
      }
    }
  }
);

export const updateUserDetails = createAsyncThunk(
  "user/updateUserDetails",
  async ({details, signer}: {details: UserDetails, signer: ethers.Signer}, { rejectWithValue }) => {
    try {
      if (!signer) throw new Error("Wallet not connected");

      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

      // Check if user details are locked
      const account = await signer.getAddress();
      const isLocked = await contract.isUserDetailsLocked(account);
      
      if (isLocked) {
        throw new Error("User details are locked after verification and cannot be updated");
      }

      const tx = await contract.updateUserDetails(
        details.name,
        details.email,
        details.dateOfBirth,
        details.identityNumber,
        details.contactNumber,
        details.bio,
        details.profileImageIpfsHash,
        details.supportiveLinks
      );
      
      await tx.wait();
      toast.success("User details updated successfully");
      return details;
    } catch (error) {
      console.error("Update user details error:", error);
      
      let errorMessage = "Failed to update user details";
      
      if (error instanceof Error) {
        if (error.message.includes("Cannot modify details after verification")) {
          errorMessage = "Cannot modify details after verification";
        } else if (error.message.includes("User details are locked")) {
          errorMessage = "User details are locked after verification";
        } else if (error.message.includes("Wallet not connected")) {
          errorMessage = "Wallet not connected";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const requestVerification = createAsyncThunk(
  "user/requestVerification",
  async ({ role, verificationDocHash, signer }: { role: number; verificationDocHash: string, signer: ethers.Signer }, { rejectWithValue }) => {
    try {
      if (!signer) throw new Error("Wallet not connected");

      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

      const tx = await contract.requestVerification(role, verificationDocHash);
      await tx.wait();
      
      toast.success("Verification request submitted successfully");
      return { role, verificationDocHash };
    } catch (error) {
      console.error("Request verification error:", error);
      
      let errorMessage = "Failed to request verification";
      
      if (error instanceof Error) {
        if (error.message.includes("Invalid role requested")) {
          errorMessage = "Invalid role requested";
        } else if (error.message.includes("Already verified or pending")) {
          errorMessage = "Already verified or verification pending";
        } else if (error.message.includes("Please update user details first")) {
          errorMessage = "Please update user details first";
        } else if (error.message.includes("Wallet not connected")) {
          errorMessage = "Wallet not connected";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchNearbyCampaigns = createAsyncThunk(
  "user/fetchNearbyCampaigns",
  async ({ provider }: { provider: ethers.Provider }, { rejectWithValue }) => {
    try {
      if (!provider) throw new Error("Provider not connected");
      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, provider);
      
      const campaignIds = await contract.getNearbyCampaigns();
      const campaigns = [];

      for (const campaignId of campaignIds) {
        try {
          const campaignDetails = await contract.getCampaignDetails(campaignId);
          campaigns.push({
            id: Number(campaignId),
            startDate: Number(campaignDetails.startDate),
            endDate: Number(campaignDetails.endDate),
            winner: campaignDetails.winner,
            isOpen: campaignDetails.isOpen,
            detailsIpfsHash: campaignDetails.detailsIpfsHash,
            voters: campaignDetails.voters,
            candidates: campaignDetails.candidates
          });
        } catch (detailsError) {
          console.warn(`Failed to fetch details for campaign ${campaignId}:`, detailsError);
        }
      }

      return campaigns;
    } catch (error) {
      console.error("Fetch nearby campaigns error:", error);
      
      let errorMessage = "Failed to fetch nearby campaigns";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const registerForCampaign = createAsyncThunk(
  "user/registerForCampaign",
  async ({campaignId, provider}: {campaignId: number, provider: ethers.Provider}, { rejectWithValue }) => {
    try {
      if (!provider) throw new Error("Provider not connected");

      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, provider);

      const tx = await contract.registerForCampaign(campaignId);
      await tx.wait();
      
      toast.success("Successfully registered for campaign");
      return campaignId;
    } catch (error) {
      console.error("Register for campaign error:", error);
      
      let errorMessage = "Failed to register for campaign";
      
      if (error instanceof Error) {
        if (error.message.includes("Campaign does not exist")) {
          errorMessage = "Campaign does not exist";
        } else if (error.message.includes("Campaign closed")) {
          errorMessage = "Campaign is closed";
        } else if (error.message.includes("Campaign ended")) {
          errorMessage = "Campaign has ended";
        } else if (error.message.includes("Campaign is not available for registration")) {
          errorMessage = "Campaign is not available for registration";
        } else if (error.message.includes("Already registered")) {
          errorMessage = "Already registered for this campaign";
        } else if (error.message.includes("Cannot register after campaign starts")) {
          errorMessage = "Cannot register as candidate after campaign starts";
        } else if (error.message.includes("Invalid role for registration")) {
          errorMessage = "Invalid role for registration";
        } else if (error.message.includes("Wallet not connected")) {
          errorMessage = "Wallet not connected";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);