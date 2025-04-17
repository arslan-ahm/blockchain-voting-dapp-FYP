import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import { getContract } from '../../utils/web3';

// Thunks for async operations
export const connectWallet = createAsyncThunk(
  'voting/connectWallet',
  async (_, { rejectWithValue }) => {
    try {
      if (!window.ethereum) throw new Error('MetaMask not installed');
      
      // Check if already connected
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      const votingContract = await getContract();

      // Fetch role
      let role = 'Unverified';
      try {
        const roleId = await votingContract.userRoles(address);
        const roles = ['Unverified', 'Voter', 'Candidate', 'Admin', 'PendingVerification'];
        role = roles[Number(roleId)] || 'Unverified';
      } catch (e) {
        console.error(`Failed to fetch user role: ${e.message}`);
      }

      // Check admin
      try {
        const adminAddress = await votingContract.admin();
        if (address.toLowerCase() === adminAddress.toLowerCase()) {
          role = 'Admin';
        }
      } catch (e) {
        console.error(`Failed to fetch admin address: ${e.message}`);
      }

      return {
        account: address,
        contract: votingContract,
        role,
        network: { name: network.name, chainId: network.chainId },
      };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchCampaigns = createAsyncThunk(
  'voting/fetchCampaigns',
  async (userAddress, { getState, rejectWithValue }) => {
    try {
      const { voting } = getState();
      const contract = voting.contract;
      if (!contract) throw new Error('Contract not initialized');

      let nextId;
      try {
        nextId = Number(await contract.nextCampaignId());
      } catch (e) {
        console.error(`Failed to fetch nextCampaignId: ${e.message}`);
        return rejectWithValue('Could not fetch campaign IDs');
      }

      const campaignList = [];
      const votedStatus = {};
      for (let i = 1; i < nextId; i++) {
        try {
          const details = await contract.getCampaignDetails(i);
          campaignList.push({
            id: i,
            startDate: Number(details.startDate),
            endDate: Number(details.endDate),
            isOpen: details.isOpen,
            winner: details.winner,
            detailsIpfsHash: details.detailsIpfsHash,
            voters: details.voters || [],
            candidates: details.candidates || [],
          });
          if (userAddress && details.isOpen) {
            try {
              const voted = await contract.hasVoted(i, userAddress);
              votedStatus[i] = voted;
            } catch {
              votedStatus[i] = false;
            }
          }
        } catch (e) {
          console.log(`Campaign ${i} not found: ${e.message}`);
        }
      }
      return { campaigns: campaignList, hasVoted: votedStatus };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchPendingRequests = createAsyncThunk(
  'voting/fetchPendingRequests',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { voting } = getState();
      const contract = voting.contract;
      if (!contract) throw new Error('Contract not initialized');

      const [userAddresses, requestedRoles, docHashes, feedbacks] =
        await contract.getPendingVerificationRequests();
      const requests = userAddresses.map((addr, i) => ({
        userAddress: addr,
        requestedRole: ['Unverified', 'Voter', 'Candidate', 'Admin', 'PendingVerification'][Number(requestedRoles[i]) || 0],
        docHash: docHashes[i] || '',
        feedback: feedbacks[i] || '',
      }));
      return requests;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const createCampaign = createAsyncThunk(
  'voting/createCampaign',
  async ({ startDate, endDate, ipfsHash }, { getState, dispatch, rejectWithValue }) => {
    try {
      const { voting } = getState();
      const contract = voting.contract;
      if (!contract) throw new Error('Contract not initialized');

      const start = Math.floor(new Date(startDate).getTime() / 1000);
      const end = Math.floor(new Date(endDate).getTime() / 1000);
      if (end <= start) throw new Error('End date must be after start date');

      const tx = await contract.createCampaign(start, end, ipfsHash || 'Qm...');
      await tx.wait();
      await dispatch(fetchCampaigns(voting.account));
      return true;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const requestVerification = createAsyncThunk(
  'voting/requestVerification',
  async ({ verificationRole, verificationDoc }, { getState, rejectWithValue }) => {
    try {
      const { voting } = getState();
      const contract = voting.contract;
      if (!contract) throw new Error('Contract not initialized');
      if (!verificationDoc) throw new Error('Provide verification document IPFS hash');

      const roleId = verificationRole === 'Voter' ? 1 : 2;
      const tx = await contract.requestVerification(roleId, verificationDoc);
      await tx.wait();
      return true;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const processVerification = createAsyncThunk(
  'voting/processVerification',
  async ({ verificationUser, approveVerification, verificationFeedback }, { getState, dispatch, rejectWithValue }) => {
    try {
      const { voting } = getState();
      const contract = voting.contract;
      if (!contract) throw new Error('Contract not initialized');
      if (!verificationUser) throw new Error('Provide user address');
      if (!ethers.isAddress(verificationUser)) throw new Error('Invalid user address');

      const tx = await contract.processVerification(
        verificationUser,
        approveVerification,
        verificationFeedback || ''
      );
      await tx.wait();
      await dispatch(fetchPendingRequests());
      return true;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const registerForCampaign = createAsyncThunk(
  'voting/registerForCampaign',
  async (campaignId, { getState, dispatch, rejectWithValue }) => {
    try {
      const { voting } = getState();
      const contract = voting.contract;
      if (!contract) throw new Error('Contract not initialized');
      if (!campaignId) throw new Error('Provide campaign ID');

      const tx = await contract.registerForCampaign(campaignId);
      await tx.wait();
      await dispatch(fetchCampaigns(voting.account));
      return true;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const vote = createAsyncThunk(
  'voting/vote',
  async ({ campaignId, candidateAddress }, { getState, rejectWithValue }) => {
    try {
      const { voting } = getState();
      const contract = voting.contract;
      if (!contract) throw new Error('Contract not initialized');
      if (!campaignId || !candidateAddress) throw new Error('Provide campaign ID and candidate address');
      if (!ethers.isAddress(candidateAddress)) throw new Error('Invalid candidate address');

      const tx = await contract.vote(campaignId, candidateAddress);
      await tx.wait();
      return campaignId;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const closeCampaign = createAsyncThunk(
  'voting/closeCampaign',
  async (campaignId, { getState, dispatch, rejectWithValue }) => {
    try {
      const { voting } = getState();
      const contract = voting.contract;
      if (!contract) throw new Error('Contract not initialized');
      if (!campaignId) throw new Error('Provide campaign ID');

      const tx = await contract.performUpkeep(ethers.toUtf8Bytes(campaignId.toString()));
      await tx.wait();
      await dispatch(fetchCampaigns(voting.account));
      return true;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

// Slice
const votingSlice = createSlice({
  name: 'voting',
  initialState: {
    contract: null,
    account: '',
    role: 'Unverified',
    campaigns: [],
    pendingRequests: [],
    hasVoted: {},
    isConnected: false,
    network: null,
    status: 'idle',
    error: '',
  },
  reducers: {
    clearError(state) {
      state.error = '';
    },
    resetState(state) {
      state.contract = null;
      state.account = '';
      state.role = 'Unverified';
      state.campaigns = [];
      state.pendingRequests = [];
      state.hasVoted = {};
      state.isConnected = false;
      state.network = null;
      state.status = 'idle';
      state.error = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // connectWallet
      .addCase(connectWallet.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.account = action.payload.account;
        state.contract = action.payload.contract;
        state.role = action.payload.role;
        state.isConnected = true;
        state.network = action.payload.network;
        state.error = '';
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to connect wallet';
      })
      // fetchCampaigns
      .addCase(fetchCampaigns.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.campaigns = action.payload.campaigns;
        state.hasVoted = action.payload.hasVoted;
        state.error = '';
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch campaigns';
      })
      // fetchPendingRequests
      .addCase(fetchPendingRequests.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pendingRequests = action.payload;
        state.error = '';
      })
      .addCase(fetchPendingRequests.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch pending requests';
      })
      // createCampaign
      .addCase(createCampaign.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createCampaign.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = '';
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to create campaign';
      })
      // requestVerification
      .addCase(requestVerification.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(requestVerification.fulfilled, (state) => {
        state.status = 'succeeded';
        state.role = 'PendingVerification';
        state.error = '';
      })
      .addCase(requestVerification.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to request verification';
      })
      // processVerification
      .addCase(processVerification.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(processVerification.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = '';
      })
      .addCase(processVerification.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to process verification';
      })
      // registerForCampaign
      .addCase(registerForCampaign.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(registerForCampaign.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = '';
      })
      .addCase(registerForCampaign.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to register for campaign';
      })
      // vote
      .addCase(vote.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(vote.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.hasVoted[action.payload] = true;
        state.error = '';
      })
      .addCase(vote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to vote';
      })
      // closeCampaign
      .addCase(closeCampaign.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(closeCampaign.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = '';
      })
      .addCase(closeCampaign.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to close campaign';
      });
  },
});

export const { clearError, resetState } = votingSlice.actions;
export default votingSlice.reducer;