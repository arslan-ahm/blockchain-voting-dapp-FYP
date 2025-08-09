export interface CampaignChartsProps {
  campaign?: Campaign | null;
  adminDashboard?: AdminDashboardData;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      count?: number;
      value?: number;
      details?: {
        title: string;
        status: string;
        startDate: string;
        winner: string | null;
      };
    };
  }>;
}

export interface PieTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      totalVoters: number;
    };
  }>;
}