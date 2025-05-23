import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI } from "../../constants/contract";
import { toast } from "sonner";
import type { UserDetails } from "../../types";
import type { RootState } from "../store";


export const fetchUserDetails = createAsyncThunk(
  "user/fetchUserDetails",
  async (account: string, { getState, rejectWithValue }) => {
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


      const adminFunction = VOTING_CONTRACT_ABI.find(item => item.name === 'admin' && item.type === 'function');
      const userDetailsFunction = VOTING_CONTRACT_ABI.find(item => item.name === 'userDetails' && item.type === 'function');
      const userRolesFunction = VOTING_CONTRACT_ABI.find(item => item.name === 'userRoles' && item.type === 'function');

      if (!adminFunction) {
        throw new Error("admin() function not found in ABI");
      }
      if (!userDetailsFunction) {
        throw new Error("userDetails() function not found in ABI");
      }
      if (!userRolesFunction) {
        throw new Error("userRoles() function not found in ABI");
      }


      let provider: ethers.JsonRpcProvider;
      const state = getState() as RootState;

      if (state.user.provider) {

        if (state.user.provider instanceof ethers.JsonRpcProvider) {
          provider = state.user.provider;
        } else {

          const rpcUrl = import.meta.env.VITE_RPC_URL;
          if (!rpcUrl) {
            throw new Error("VITE_RPC_URL environment variable not set");
          }
          provider = new ethers.JsonRpcProvider(rpcUrl);
        }
      } else {
        const rpcUrl = import.meta.env.VITE_RPC_URL;
        if (!rpcUrl) {
          throw new Error("VITE_RPC_URL environment variable not set");
        }
        provider = new ethers.JsonRpcProvider(rpcUrl);
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
  async (details: UserDetails, { getState }) => {
    const state = getState() as RootState;
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