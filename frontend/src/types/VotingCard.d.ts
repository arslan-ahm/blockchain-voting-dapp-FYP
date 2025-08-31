export interface VotingCardProps {
  candidate: {
    address: string;
    name: string;
    votes: string;
    type: string;
    profileImageIpfsHash?: string;
    bio?: string;
    email?: string;
    contactNumber?: string;
    supportiveLinks?: string[];
  };
  campaignId: number;
  userVotingStatus: {
    canVote: boolean | undefined;
    hasVoted: boolean;
    votedFor: string | null | undefined;
    isRegistered: boolean;
    isCandidate: boolean;
    isVoter: boolean;
    hasVerifiedRole?: boolean;
    userRole?: number;
    requiresVerification?: boolean;
    isPendingVerification?: boolean;
    isAdmin?: boolean;
  };
  onVote: (
    campaignId: number,
    candidateAddress: string
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
  campaignStatus?: string;
  allCandidates?: Array<{
    address: string;
    votes: string;
  }>;
}
