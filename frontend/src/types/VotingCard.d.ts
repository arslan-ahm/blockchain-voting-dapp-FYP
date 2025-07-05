export interface VotingCardProps {
  candidate: {
    address: string;
    name: string;
    votes: string;
    type: string;
  };
  campaignId: number;
  userVotingStatus: {
    canVote: boolean | undefined;
    hasVoted: boolean;
    votedFor: string | null | undefined;
    isRegistered: boolean;
    isCandidate: boolean;
    isVoter: boolean;
  };
  onVote: (
    campaignId: number,
    candidateAddress: string
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
  isVoting: boolean;
}
