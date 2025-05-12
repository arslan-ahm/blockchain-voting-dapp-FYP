import { createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import { VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI } from '../../constants/contract';
import { toast } from 'sonner';
import type { Role, VerificationRequest } from '../../types';
import { RequestStatus } from '../../types';
import { useWallet } from '../../hooks/useWallet';

export const requestVerification = createAsyncThunk(
  'verification/requestVerification',
  async ({ role, docIpfsHash }: { role: Role; docIpfsHash: string }) => {
    const { signer } = useWallet();
    if (!signer) throw new Error('Wallet not connected');

    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

    try {
      const tx = await contract.requestVerification(role, docIpfsHash);
      await tx.wait();
      toast.success('Verification requested');
    } catch (error) {
      toast.error('Failed to request verification');
      throw error;
    }
  }
);

export const fetchVerificationRequests = createAsyncThunk(
  'verification/fetchVerificationRequests',
  async () => {
    const { provider } = useWallet();
    const fallbackProvider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, provider || fallbackProvider);

    try {
      const [userAddresses, requestedRoles, verificationDocIpfsHashes, adminFeedbacks] = await contract.getPendingVerificationRequests();
      const requests: VerificationRequest[] = userAddresses.map((address: string, index: number) => ({
        userAddress: address,
        requestedRole: requestedRoles[index],
        status: RequestStatus.Pending,
        verificationDocIpfsHash: verificationDocIpfsHashes[index],
        adminFeedback: adminFeedbacks[index],
      }));
      return requests;
    } catch (error) {
      toast.error('Failed to fetch verification requests');
      throw error;
    }
  }
);

export const processVerification = createAsyncThunk(
  'verification/processVerification',
  async ({ userAddress, approved, feedback }: { userAddress: string; approved: boolean; feedback: string }) => {
    const { signer } = useWallet();
    if (!signer) throw new Error('Wallet not connected');

    const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

    try {
      const tx = await contract.processVerification(userAddress, approved, feedback);
      await tx.wait();
      toast.success(`Verification ${approved ? 'approved' : 'rejected'}`);
      return { userAddress };
    } catch (error) {
      toast.error('Failed to process verification');
      throw error;
    }
  }
);