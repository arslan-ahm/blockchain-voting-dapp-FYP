import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { 
  fetchNearbyCampaigns,
  checkUserRegistration,
  getCampaignVoters,
  getCampaignStats,
  getAllCandidateVotes,
  registerForCampaign,
  castVote
} from "../../store/thunks/campaignThunks";
import { resetVoteStatus, clearError } from "../../store/slices/campaignSlice";
import { useWallet } from "../../hooks/useWallet";

interface UseCampaignListProps {
  userAddress?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useCampaignList = ({ 
  userAddress, 
  autoRefresh = false, 
  refreshInterval = 30000 
}: UseCampaignListProps = {}) => {
  const dispatch = useAppDispatch();
  const { provider, signer } = useWallet();
  
  const {
    nearbyCampaigns,
    fetchingNearbyCampaigns,
    error,
    campaignVoters,
    campaignStats,
    candidateVotes,
    userRegistrations,
    userVotes,
    voteStatus,
    registrationStatus,
    castingVote,
    transactionHash
  } = useAppSelector((state) => state.campaign);

  // Fetch nearby campaigns
  const fetchCampaigns = useCallback(() => {
    dispatch(fetchNearbyCampaigns());
  }, [dispatch]);

  // Fetch detailed data for a specific campaign
  const fetchCampaignDetails = useCallback((campaignId: number) => {
    if (!provider) throw new Error("Provider not connected");
    
    dispatch(getCampaignVoters({ campaignId, provider }));
    dispatch(getCampaignStats({ campaignId, provider }));
    dispatch(getAllCandidateVotes({ campaignId, provider }));
    
    if (userAddress) {
      dispatch(checkUserRegistration({ campaignId, userAddress, provider }));
    }
  }, [dispatch, userAddress]);

  // Register user for campaign
  const registerUser = useCallback(async (campaignId: number) => {
    if (!userAddress) throw new Error("User address is required");
    if (!signer) throw new Error("Signer not connected");
    
    const result = await dispatch(registerForCampaign({
      campaignId,
      signer
    })).unwrap();
    
    // Refresh campaign data after successful registration
    fetchCampaignDetails(campaignId);
    
    return result;
  }, [dispatch, userAddress, fetchCampaignDetails]);

  // Cast vote for candidate
  const voteForCandidate = useCallback(async (campaignId: number, candidateAddress: string) => {
    if (!userAddress) throw new Error("User address is required");
    if (!signer) throw new Error("Signer not connected");
    
    const result = await dispatch(castVote({
      campaignId,
      candidate: candidateAddress,
      signer
    })).unwrap();
    
    // Refresh campaign data after successful vote
    fetchCampaignDetails(campaignId);
    
    return result;
  }, [dispatch, userAddress, fetchCampaignDetails, signer]);

  // Get user registration status for a campaign
  const getUserRegistration = useCallback((campaignId: number) => {
    return userRegistrations.find(
      reg => reg.campaignId === campaignId && reg.userAddress === userAddress
    );
  }, [userRegistrations, userAddress]);

  // Get user vote for a campaign
  const getUserVote = useCallback((campaignId: number) => {
    return userVotes.find(
      vote => vote.campaignId === campaignId && vote.userAddress === userAddress
    );
  }, [userVotes, userAddress]);

  // Check if user can vote in a campaign
  const canUserVote = useCallback((campaignId: number) => {
    const registration = getUserRegistration(campaignId);
    const vote = getUserVote(campaignId);
    const campaign = nearbyCampaigns.find(c => parseInt(c.campaignId) === campaignId);
    
    return (
      registration?.isVoter &&
      !vote?.votedCandidate &&
      campaign?.isOpen &&
      parseInt(campaign.endDate) > Math.floor(Date.now() / 1000)
    );
  }, [getUserRegistration, getUserVote, nearbyCampaigns]);

  // Get campaign status
  const getCampaignStatus = useCallback((campaign: typeof nearbyCampaigns[0]) => {
    const now = Math.floor(Date.now() / 1000);
    const startDate = parseInt(campaign.startDate);
    const endDate = parseInt(campaign.endDate);

    if (now < startDate) return 'upcoming';
    if (now > endDate || !campaign.isOpen) return 'ended';
    return 'active';
  }, []);

  // Clear error state
  const clearErrorState = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Reset vote status
  const resetVoteState = useCallback(() => {
    dispatch(resetVoteStatus());
  }, [dispatch]);

  // Initial fetch
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Fetch detailed data for all nearby campaigns
  useEffect(() => {
    nearbyCampaigns.forEach(campaign => {
      fetchCampaignDetails(parseInt(campaign.campaignId));
    });
  }, [nearbyCampaigns, fetchCampaignDetails]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchCampaigns();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchCampaigns]);

  // Filter campaigns by status
  const activeCampaigns = nearbyCampaigns.filter(campaign => 
    getCampaignStatus(campaign) === 'active'
  );
  
  const upcomingCampaigns = nearbyCampaigns.filter(campaign => 
    getCampaignStatus(campaign) === 'upcoming'
  );
  
  const endedCampaigns = nearbyCampaigns.filter(campaign => 
    getCampaignStatus(campaign) === 'ended'
  );

  return {
    // Data
    campaigns: nearbyCampaigns,
    activeCampaigns,
    upcomingCampaigns,
    endedCampaigns,
    campaignVoters,
    campaignStats,
    candidateVotes,
    userRegistrations,
    userVotes,
    
    // Loading states
    loading: fetchingNearbyCampaigns,
    castingVote,
    
    // Status
    voteStatus,
    registrationStatus,
    error,
    transactionHash,
    
    // Actions
    fetchCampaigns,
    fetchCampaignDetails,
    registerUser,
    voteForCandidate,
    clearErrorState,
    resetVoteState,
    
    // Helpers
    getUserRegistration,
    getUserVote,
    canUserVote,
    getCampaignStatus
  };
};