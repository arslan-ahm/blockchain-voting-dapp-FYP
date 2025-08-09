import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { 
  fetchNearbyCampaigns,
  checkUserRegistration,
  getCampaignStats,
  getAllCandidateVotes,
  registerForCampaign,
  getCampaignParticipants,
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
    transactionHash,
    campaignParticipants,
    fetchingParticipants 
  } = useAppSelector((state) => state.campaign);

  // Fetch nearby campaigns
  const fetchCampaigns = useCallback(() => {
    if (!provider) return;
    
    dispatch(fetchNearbyCampaigns());
  }, [dispatch, provider]);

  // Fetch detailed data for a specific campaign
  const fetchCampaignDetails = useCallback((campaignId: number) => {
    if (!provider) {
      console.warn("Provider not connected, skipping campaign details fetch");
      return;
    }
    
    // dispatch(getCampaignVoters({ campaignId, provider }));
    dispatch(getCampaignStats({ campaignId, provider }));
    dispatch(getAllCandidateVotes({ campaignId, provider }));
    dispatch(getCampaignParticipants({ campaignId, provider }));
    
    if (userAddress) {
      dispatch(checkUserRegistration({ campaignId, userAddress, provider }));
    }
  }, [dispatch, userAddress, provider]);

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
  }, [dispatch, userAddress, fetchCampaignDetails, signer]);

  // Get candidates for a campaign
  const getCampaignCandidates = useCallback((campaignId: number) => {
    const participants = campaignParticipants[campaignId];
    return participants?.candidates || [];
  }, [campaignParticipants]);

  // Get voters for a campaign
  const getCampaignVoters = useCallback((campaignId: number) => {
    const participants = campaignParticipants[campaignId];
    return participants?.voters || [];
  }, [campaignParticipants]);

  // Cast vote for candidate
  const voteForCandidate = useCallback(async (campaignId: number, candidateAddress: string) => {
    if (!userAddress) throw new Error("User address is required");
    if (!signer) throw new Error("Signer not connected");
    
    try {
      const result = await dispatch(castVote({
        campaignId,
        candidate: candidateAddress,
        signer
      })).unwrap();
      
      // Refresh campaign data after successful vote
      fetchCampaignDetails(campaignId);
      
      return result;
    } catch (error) {
      console.error('Failed to cast vote:', error);
      throw error;
    }
  }, [dispatch, userAddress, fetchCampaignDetails, signer]);
  
  // Handle vote submission
  const handleVoteSubmission = useCallback(async (campaignId: number, candidateAddress: string) => {
    try {
      await voteForCandidate(campaignId, candidateAddress);
      return { success: true, message: 'Vote cast successfully!' };
    } catch (error) {
      if(error instanceof Error){
        return { success: false, message: error.message || 'Failed to cast vote' };
      }
      throw error;
    }
  }, [voteForCandidate]);

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
    const campaign = nearbyCampaigns.find(c => c.id === campaignId);
    
    return (
      registration?.isVoter &&
      !vote?.votedCandidate &&
      campaign?.isOpen &&
      campaign.endDate > Math.floor(Date.now() / 1000)
    );
  }, [getUserRegistration, getUserVote, nearbyCampaigns]);

  // Get campaign status
  const getCampaignStatus = useCallback((campaign: typeof nearbyCampaigns[0]) => {
    const now = Math.floor(Date.now() / 1000);
    const startDate = campaign.startDate;
    const endDate = campaign.endDate;

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

  // Fetch detailed data for all nearby campaigns - FIXED: Only run when provider is available
  useEffect(() => {
    if (!provider || nearbyCampaigns.length === 0) return;
    
    nearbyCampaigns.forEach(campaign => {
      fetchCampaignDetails(campaign.id);
    });
  }, [nearbyCampaigns, fetchCampaignDetails, provider]);

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

  // Get user's voting status for a campaign
  const getUserVotingStatus = useCallback((campaignId: number) => {
    const registration = getUserRegistration(campaignId);
    const vote = getUserVote(campaignId);
    const campaign = nearbyCampaigns.find(c => c.id === campaignId);
    const status = campaign ? getCampaignStatus(campaign) : 'ended';
    
    return {
      canVote: registration?.isVoter && !vote?.votedCandidate && status === 'active',
      hasVoted: !!vote?.votedCandidate,
      votedFor: vote?.votedCandidate,
      isRegistered: !!registration,
      isCandidate: !!registration?.isCandidate,
      isVoter: !!registration?.isVoter
    };
  }, [getUserRegistration, getUserVote, nearbyCampaigns, getCampaignStatus]);

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
    campaignParticipants,
    
    // Loading states
    loading: fetchingNearbyCampaigns,
    castingVote,
    fetchingParticipants,
    
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
    getCampaignStatus,
    getCampaignCandidates,
    getCampaignVoters,
    getUserVotingStatus,
    handleVoteSubmission
  };
};