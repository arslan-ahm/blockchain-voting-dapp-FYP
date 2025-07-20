import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { 
  fetchNearbyCampaigns,
  checkUserRegistration,
  getCampaignStats,
  getAllCandidateVotes,
  registerForCampaign,
  getCampaignParticipants,
  castVoteWithRoleCheck
} from "../../store/thunks/campaignThunks";
import { resetVoteStatus, clearError } from "../../store/slices/campaignSlice";
import { selectPublicCampaignId, selectPublicCampaign } from "../../store/slices/adminSlice";
import { useWallet } from "../../hooks/useWallet";
import { Role } from "../../types";

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

  // Get user's global role for enhanced voting logic
  const userRole = useAppSelector((state) => state.user.role);
  
  // Get admin-selected public campaign
  const publicCampaignId = useAppSelector(selectPublicCampaignId);
  const publicCampaign = useAppSelector(selectPublicCampaign);

  // Filter campaigns based on admin selection
  const getDisplayCampaigns = useCallback(() => {
    if (publicCampaignId && publicCampaign) {
      // If admin has selected a specific campaign for public display, show only that one
      const publicCampaignDetails = nearbyCampaigns.find(c => c.id === publicCampaignId);
      return publicCampaignDetails ? [publicCampaignDetails] : nearbyCampaigns;
    }
    // Otherwise, show all nearby campaigns
    return nearbyCampaigns;
  }, [nearbyCampaigns, publicCampaignId, publicCampaign]);

  // Get the campaigns to display
  const displayCampaigns = getDisplayCampaigns();

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

  // Cast vote for candidate with enhanced role checking
  const voteForCandidate = useCallback(async (campaignId: number, candidateAddress: string) => {
    if (!userAddress) throw new Error("User address is required");
    if (!signer) throw new Error("Signer not connected");
    
    try {
      // Use enhanced voting with role check and auto-registration
      const result = await dispatch(castVoteWithRoleCheck({
        campaignId,
        candidate: candidateAddress,
        signer,
        userAddress
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

  // Refresh campaign participants when campaigns are loaded or user role changes
  useEffect(() => {
    if (displayCampaigns.length > 0 && provider) {
      displayCampaigns.forEach(campaign => {
        fetchCampaignDetails(campaign.id);
      });
    }
  }, [displayCampaigns, provider, userRole, fetchCampaignDetails]);

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

  // Get user's voting status for a campaign with enhanced role-based logic
  const getUserVotingStatus = useCallback((campaignId: number) => {
    const registration = getUserRegistration(campaignId);
    const vote = getUserVote(campaignId);
    const campaign = nearbyCampaigns.find(c => c.id === campaignId);
    const status = campaign ? getCampaignStatus(campaign) : 'ended';
    
    // Enhanced voting permissions based on role
    const hasVoterRole = userRole === Role.Voter;
    const hasCandidateRole = userRole === Role.Candidate;
    const isAdminRole = userRole === Role.Admin;
    const isVerifiedUser = hasVoterRole || hasCandidateRole || isAdminRole;
    
    // Admin users cannot vote but should not see registration messages
    if (isAdminRole) {
      return {
        canVote: false,
        hasVoted: false,
        votedFor: null,
        isRegistered: true, // Admins are always "registered" 
        isCandidate: false,
        isVoter: false,
        hasVerifiedRole: true,
        userRole: userRole,
        requiresVerification: false,
        isPendingVerification: false,
        isAdmin: true
      };
    }
    
    // Primary voting logic: Verified voters can vote during active campaigns
    // No need for explicit campaign registration - system handles auto-registration
    const canVoteBasedOnRole = hasVoterRole && status === 'active' && !vote?.votedCandidate;
    
    // Legacy registration-based voting (for backwards compatibility)
    const canVoteBasedOnRegistration = registration?.isVoter && !vote?.votedCandidate && status === 'active';
    
    // Verified voters should always be able to vote during active campaigns
    const finalCanVote = canVoteBasedOnRole || canVoteBasedOnRegistration;
    
    return {
      canVote: finalCanVote,
      hasVoted: !!vote?.votedCandidate,
      votedFor: vote?.votedCandidate,
      isRegistered: !!registration || hasVoterRole, // Consider verified voters as "registered"
      isCandidate: !!registration?.isCandidate || hasCandidateRole,
      isVoter: !!registration?.isVoter || hasVoterRole,
      hasVerifiedRole: isVerifiedUser,
      userRole: userRole,
      requiresVerification: !isVerifiedUser && userRole === Role.Unverified,
      isPendingVerification: userRole === Role.PendingVerification,
      isAdmin: false
    };
  }, [getUserRegistration, getUserVote, nearbyCampaigns, getCampaignStatus, userRole]);

  return {
    // Data
    campaigns: displayCampaigns,
    activeCampaigns,
    upcomingCampaigns,
    endedCampaigns,
    campaignVoters,
    campaignStats,
    candidateVotes,
    userRegistrations,
    userVotes,
    campaignParticipants,
    publicCampaignId,
    publicCampaign,
    
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