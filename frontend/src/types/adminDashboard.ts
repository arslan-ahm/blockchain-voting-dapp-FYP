export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

export interface LineChartDataPoint {
  date: string;
  campaigns: number;
  participants: number;
  votes: number;
  active?: number;
  completed?: number;
}