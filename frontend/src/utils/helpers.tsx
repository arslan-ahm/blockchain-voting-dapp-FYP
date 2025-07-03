import type { CampaignStatus } from "../types";

export const mapCampaignStatus = (status: number | string): CampaignStatus => {
    if (typeof status === 'string') {
      return status as CampaignStatus;
    }
    
    switch (status) {
      case 0: return "Upcoming";
      case 1: return "Active";
      case 2: return "Completed";
      case 3: return "Deleted";
      default: return "Upcoming";
    }
  };

  export function getStatusAsNumber(status: string): number {
    switch(status) {
      case 'Upcoming': return 0;
      case 'Active': return 1;
      case 'Completed': return 2;
      case 'Deleted': return 3;
      default: return 0;
    }
  }