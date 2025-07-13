// ======================
// Core Enums and Constants
// ======================

export const Role = {
  Unverified: 0,
  Voter: 1,
  Candidate: 2,
  Admin: 3,
  PendingVerification: 4,
} as const;

export type Role = number;

export const RequestStatus = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
} as const;

export type RequestStatus = number;

export const CampaignStatus = {
  Upcoming: "Upcoming",
  Active: "Active",
  Completed: "Completed",
  Deleted: "Deleted",
} as const;

export type CampaignStatus = typeof CampaignStatus[keyof typeof CampaignStatus];

// ======================
// Core Data Types
// ======================

export interface UserDetails {
  name: string;
  email: string;
  dateOfBirth: number;
  identityNumber: string;
  contactNumber: string;
  bio: string;
  profileImageIpfsHash: string;
  supportiveLinks: string[];
}

export interface UserInfo {
  name: string;
  email: string;
  dateOfBirth: number;
  identityNumber: string;
  contactNumber: string;
  bio: string;
  profileImageIpfsHash: string;
  supportiveLinks: string[];
}

export interface VerificationRequestData {
  userAddress: string;
  requestedRole: Role;
  status: RequestStatus;
  verificationDocIpfsHash: string;
  adminFeedback: string;
  requestTimestamp: number;
  userName: string;
  timestamp: number;
  userInfo: UserInfo;
}

export interface CampaignListItem {
  id: number;
  title: string;
  startDate: number;
  endDate: number;
  status: CampaignStatus;
}


export interface Campaign {
  id: number;
  title: string;
  description: string;
  startDate: number;
  endDate: number;
  winner: string;
  isOpen: boolean;
  isDeleted?: boolean;
  detailsIpfsHash: string;
  voters?: string[];
  candidates?: string[];
  status: CampaignStatus;
  totalVotes?: number;
  voterCount?: number;
  candidateCount?: number;
  creationTimestamp?: number;
  duration?: number;
}

// ======================
// Dashboard & UI Types
// ======================

export interface CandidateData {
  address: string;
  name: string;
  voteCount: number;
  role: string;
  profileImageIpfsHash?: string;
  email?: string;
  contactNumber?: string;
  bio?: string;
  supportiveLinks?: string[];
}

export interface VoterData {
  address: string;
  name: string;
  hasVoted: boolean;
  role: string;
  profileImageIpfsHash?: string;
  email?: string;
  contactNumber?: string;
  bio?: string;
}

export interface AdminDashboardData {
  currentCampaign: (Campaign & { duration: number }) | null;
  participantStats: {
    candidateCount: number;
    voterCount: number;
  };
  campaignList: CampaignListItem[];
  selectedCampaignId: number;
  voteStats: {
    votedCount: number;
    notVotedCount: number;
    totalVoters: number;
  };
  monthlyCampaigns: {
    campaignIds: number[];
    titles: string[];
    startDates: number[];
    endDates: number[];
    statuses: string[];
    winners: string[];
  };
  candidates: CandidateData[];
  voters: VoterData[];
  verificationRequests: VerificationRequestData[];
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
}

// ======================
// Voting Related Types
// ======================

export interface CandidateVote {
  candidate: string;
  name?: string;
  votes: string;
}

export interface UserRegistration {
  campaignId: number;
  userAddress: string;
  isVoter: boolean;
  isCandidate: boolean;
}

export interface UserVote {
  campaignId: number;
  userAddress: string;
  votedCandidate: string | null;
}

export interface VoterDetail {
  address: string;
  name: string;
  hasVoted: boolean;
}

export interface CampaignVoteData {
  campaignId: number;
  totalVotes: number;
  voterCount: number;
  candidates: CandidateVoteData[];
}

export interface CandidateVoteData {
  candidateAddress: string;
  voteCount: number;
  candidateName: string;
}

export interface UserVoteData {
  voter: string;
  hasVoted: boolean;
  votedCandidate?: string;
  timestamp?: number;
}

// ======================
// State Management Types
// ======================

export interface CampaignStats {
  campaignId: number;
  totalVoters: number;
  votedCount: number;
  notVotedCount: number;
  candidateCount: number;
  voterCount: number;
  totalVotes: number;
}

export interface MonthlyCampaign {
  [month: number]: Array<{
    campaignId: string;
    startDate: string;
    endDate: string;
    title: string;
    status: number;
    winner: string;
  }>;
}

export interface AdminState {
  dashboardData: AdminDashboardData | null;
  isLoading: boolean;
  error: string | null;
  verificationRequests: VerificationRequestData[];
  candidates: CandidateData[];
  voters: VoterData[];
  creatingCampaign: boolean;
  deletingCampaign: boolean;
  closingCampaign: boolean;
  processingVerification: boolean;
  checkingUpkeep: boolean;
  upkeepNeeded: boolean;
  performData: string | null;
  fetchingVotes: boolean;
  fetchingRegistration: boolean;
  fetchingStats: boolean;
  fetchingVoters: boolean;
  fetchingMonthlyCampaigns: boolean;
}


export interface CampaignState {
  status: "idle" | "pending" | "success" | "error";
  error: string | null;
  campaigns: Campaign[];
  currentCampaign: Campaign | null;
  nearbyCampaigns: Campaign[];
  activeCampaign: Campaign | null;
  voteStatus: "idle" | "pending" | "success" | "error";
  registrationStatus: "idle" | "pending" | "success" | "error";
  candidateVotes: Record<number, CandidateVote[]>;
  userRegistrations: UserRegistration[];
  campaignVoters: Record<number, VoterDetail[]>;
  campaignStats: Record<number, CampaignStats>;
  monthlyCampaigns: MonthlyCampaign;
  hasActiveCampaign: boolean;
  userVotes: UserVote[]
  activeCampaignId: string;
  campaignParticipants: Record<number, {
    candidates: Array<{
      address: string;
      name: string;
      votes: string;
      type: string;
    }>;
    voters: Array<{
      address: string;
      name: string;
      hasVoted: boolean;
      type: string;
    }>;
  }>;
  fetchingParticipants: boolean;
  transactionHash: string | null;
  upkeepNeeded: boolean;
  performData: string | null;
  fetchingCampaigns: boolean;
  fetchingNearbyCampaigns: boolean;
  fetchingActiveCampaign: boolean;
  fetchingVotes: boolean;
  fetchingRegistration: boolean;
  fetchingStats: boolean;
  fetchingVoters: boolean;
  fetchingMonthlyCampaigns: boolean;
  creatingCampaign: boolean;
  deletingCampaign: boolean;
  castingVote: boolean;
  closingCampaign: boolean;
  performingUpkeep: boolean;
  checkingUpkeep: boolean;
}

// ======================
// Global Type Extensions
// ======================

declare global {
  interface Window {
    ethereum?: import("@metamask/providers").MetaMaskInpageProvider;
  }
}