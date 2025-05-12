const Role = {
    Unverified: "Unverified",
    Voter: "Voter",
    Candidate: "Candidate",
    Admin: "Admin",
    PendingVerification: "PendingVerification",
} as const;

type Role = typeof Role[keyof typeof Role];

const RequestStatus = {
    Pending: "Pending",
    Approved: "Approved",
    Rejected: "Rejected",
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