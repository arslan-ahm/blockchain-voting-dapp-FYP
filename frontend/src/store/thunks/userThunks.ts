import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { JsonRpcProvider } from "ethers/providers";
import { VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI } from "../../constants/contract";
import { toast } from "sonner";
import type { UserDetails } from "../../types";

export const fetchUserDetails = createAsyncThunk(
  "user/fetchUserDetails",
  async (account: string, { getState }) => {
    const state = getState() as { user: { provider?: ethers.JsonRpcProvider; signer?: ethers.Signer } };
    const provider = state.user.provider || new JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, provider);

    const details = await contract.userDetails(account);
    const role = await contract.userRoles(account);

    return {
      details: {
        name: details.name,
        email: details.email,
        dateOfBirth: Number(details.dateOfBirth),
        identityNumber: details.identityNumber,
        contactNumber: details.contactNumber,
        bio: details.bio,
        profileImageIpfsHash: details.profileImageIpfsHash,
        supportiveLinks: details.supportiveLinks,
      },
      role,
    };
  }
);

export const updateUserDetails = createAsyncThunk(
  "user/updateUserDetails",
  async (details: UserDetails, { getState }) => {
    const state = getState() as { user: { signer?: ethers.Signer } };
    const signer = state.user.signer;
    if (!signer) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

    try {
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
      toast.success("User details updated");
      return details;
    } catch (error) {
      toast.error("Failed to update user details");
      throw error;
    }
  }
);