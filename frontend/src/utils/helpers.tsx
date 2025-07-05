import { CampaignStatus, Role } from "../types";

export const mapCampaignStatus = (status: number | string): CampaignStatus => {
  if (typeof status === "string") {
    switch (status) {
      case 'upcoming':
        return "Upcoming";
      case 'active':
        return "Active";
      case 'completed':
        return "Completed";
      case 'deleted':
        return "Deleted";
      default:
        return "Upcoming";
    }
  }

  switch (status) {
    case 0:
      return "Upcoming";
    case 1:
      return "Active";
    case 2:
      return "Completed";
    case 3:
      return "Deleted";
    default:
      return "Upcoming";
  }
};

export function getStatusAsNumber(status: string): number {
  switch (status) {
    case "Upcoming":
      return 0;
    case "Active":
      return 1;
    case "Completed":
      return 2;
    case "Deleted":
      return 3;
    default:
      return 0;
  }
}

export const getRoleBadgeColor = (role: Role): string => {
  switch (role) {
    case Role.Candidate:
    case Role.Voter:
      return "bg-green-500/20 border-green-700 text-green-400";
    case Role.PendingVerification:
      return "bg-yellow-500/20 border-yellow-700 text-yellow-400";
    case Role.Unverified:
      return "bg-blue-500/20 border-blue-700 text-blue-400";
    case Role.Admin:
      return "bg-purple-500/20 border-purple-700 text-purple-400";
    default:
      return "bg-gray-500/20 border-gray-700 text-gray-400";
  }
};


export const getCampaignStatusBadgeColor = (status: CampaignStatus): string => {
  switch (status) {
    case CampaignStatus.Upcoming:
      return "bg-blue-500/20 border-blue-700 text-blue-400";
    case CampaignStatus.Active:
      return "bg-green-500/20 border-green-700 text-green-400";
    case CampaignStatus.Completed:
      return "bg-gray-500/20 border-gray-700 text-gray-400";
    case CampaignStatus.Deleted:
      return "bg-red-500/20 border-red-700 text-red-400";
    default:
      return "bg-gray-500/20 border-gray-700 text-gray-400";
  }
};