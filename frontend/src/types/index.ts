const Role = {
  Unverified: 0,
  Voter: 1,
  Candidate: 2,
  Admin: 3,
  PendingVerification: 4,
} as const;

type Role = typeof Role[keyof typeof Role];

const RequestStatus = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
} as const;

type RequestStatus = typeof RequestStatus[keyof typeof RequestStatus];

interface UserDetails {
  name: string;
  email: string;
  dateOfBirth: number;
  identityNumber: string;
  contactNumber: string;
  bio: string;
  profileImageIpfsHash: string;
  supportiveLinks: string[];
}

interface VerificationRequest {
  userAddress: string;
  requestedRole: Role;
  status: RequestStatus;
  verificationDocIpfsHash: string;
  adminFeedback: string;
}

interface Campaign {
  id: number;
  startDate: number;
  endDate: number;
  winner: string;
  isOpen: boolean;
  detailsIpfsHash: string;
  voters: string[];
  candidates: string[];
}

declare global {
  interface Window {
    ethereum?: import("@metamask/providers").MetaMaskInpageProvider;
  }
}

export { Role, RequestStatus };
export type { UserDetails, VerificationRequest, Campaign };