import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { Role, RequestStatus } from "../../types";
import { toast } from "sonner";
import {
  VOTING_CONTRACT_ABI,
  VOTING_CONTRACT_ADDRESS,
} from "../../constants/contract";

interface VerificationRequestPayload {
  role: Role;
  docIpfsHash: string;
  signer: ethers.Signer;
}

export const requestVerification = createAsyncThunk(
  "user/requestVerification",
  async ({ role, docIpfsHash, signer }: VerificationRequestPayload) => {
    if (!signer) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      signer
    );

    try {
      const tx = await contract.requestVerification(role, docIpfsHash);
      await tx.wait();
      toast.success("Verification requested successfully");
      return { role, docIpfsHash };
    } catch (error) {
      toast.error("Failed to request verification");
      throw error;
    }
  }
);

export const fetchVerificationRequests = createAsyncThunk(
  "verification/fetchVerificationRequests",
  async ({ signer }: { signer: ethers.Signer }) => {
    if (!signer) throw new Error("Admin wallet not connected");

    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      signer
    );

    try {
      // Get all the data returned by the smart contract function
      const [
        userAddresses,
        requestedRoles,
        verificationDocIpfsHashes,
        adminFeedbacks,
        userNames,
        timestamps
      ] = await contract.getPendingVerificationRequests();

      // Map the returned data to the expected format
      const requests = userAddresses.map((address: string, index: number) => ({
        userAddress: address,
        requestedRole: Number(requestedRoles[index]), // Convert BigInt to number
        status: RequestStatus.Pending,
        verificationDocIpfsHash: verificationDocIpfsHashes[index],
        adminFeedback: adminFeedbacks[index],
        userName: userNames[index], // Include user name
        requestTimestamp: Number(timestamps[index]) // Convert BigInt to number
      }));

      return requests;
    } catch (error) {
      console.error("Error fetching verification requests:", error);
      toast.error("Failed to fetch verification requests");
      throw error;
    }
  }
);

export const processVerification = createAsyncThunk(
  "verification/processVerification",
  async ({
    userAddress,
    approved,
    feedback,
    signer,
  }: {
    userAddress: string;
    approved: boolean;
    feedback: string;
    signer: ethers.Signer;
  }) => {
    if (!signer) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      signer
    );

    try {
      // Remove the extra 'signer' parameter - the contract method only takes 3 parameters
      const tx = await contract.processVerification(
        userAddress,
        approved,
        feedback
      );
      await tx.wait();
      toast.success(`Verification ${approved ? "approved" : "rejected"}`);
      return { userAddress };
    } catch (error) {
      console.error("Error processing verification:", error);
      toast.error("Failed to process verification");
      throw error;
    }
  }
);

// New thunk for updating user details (separate from verification request)
export const updateUserDetails = createAsyncThunk(
  "user/updateUserDetails",
  async (
    {
      name,
      email,
      dateOfBirth,
      identityNumber,
      contactNumber,
      bio,
      profileImageIpfsHash,
      supportiveLinks,
      signer
    }: {
      name: string;
      email: string;
      dateOfBirth: number;
      identityNumber: string;
      contactNumber: string;
      bio: string;
      profileImageIpfsHash: string;
      supportiveLinks: string[];
      signer: ethers.Signer;
    }
  ) => {
    if (!signer) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      signer
    );

    try {
      const tx = await contract.updateUserDetails(
        name,
        email,
        dateOfBirth,
        identityNumber,
        contactNumber,
        bio,
        profileImageIpfsHash,
        supportiveLinks
      );
      await tx.wait();
      toast.success("User details updated successfully");
      return {
        name,
        email,
        dateOfBirth,
        identityNumber,
        contactNumber,
        bio,
        profileImageIpfsHash,
        supportiveLinks,
      };
    } catch (error) {
      toast.error("Failed to update user details");
      throw error;
    }
  }
);

// New thunk to check if user details are locked
export const checkUserDetailsLocked = createAsyncThunk(
  "user/checkUserDetailsLocked",
  async ({userAddress, provider}: {userAddress: string, provider: ethers.Provider}) => {
    if (!provider) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      provider
    );

    try {
      const isLocked = await contract.isUserDetailsLocked(userAddress);
      return { userAddress, isLocked };
    } catch (error) {
      toast.error("Failed to check user details lock status");
      throw error;
    }
  }
);

// New thunk to get user details from contract
export const fetchUserDetails = createAsyncThunk(
  "user/fetchUserDetails",
  async ({userAddress, provider}: {userAddress: string, provider: ethers.Provider}) => {
    if (!provider) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      provider
    );

    try {
      const userDetails = await contract.userDetails(userAddress);
      return {
        userAddress,
        name: userDetails.name,
        email: userDetails.email,
        dateOfBirth: userDetails.dateOfBirth.toString(),
        identityNumber: userDetails.identityNumber,
        contactNumber: userDetails.contactNumber,
        bio: userDetails.bio,
        profileImageIpfsHash: userDetails.profileImageIpfsHash,
        supportiveLinks: userDetails.supportiveLinks,
      };
    } catch (error) {
      toast.error("Failed to fetch user details");
      throw error;
    }
  }
);

// New thunk to get user role
export const fetchUserRole = createAsyncThunk(
  "user/fetchUserRole",
  async ({userAddress, provider}: {userAddress: string, provider: ethers.Provider}) => {
    if (!provider) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      provider
    );

    try {
      const role = await contract.userRoles(userAddress);
      return { userAddress, role };
    } catch (error) {
      toast.error("Failed to fetch user role");
      throw error;
    }
  }
);
