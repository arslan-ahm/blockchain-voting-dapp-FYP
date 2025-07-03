import { BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { EmptyState } from './EmptyState';
import type { CampaignChartsProps, ChartTooltipProps, PieTooltipProps } from '../../types/chart';
import type { AdminDashboardData } from '../../types';

const ChartTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="text-white font-medium">{data.name}: {data.count || data.value}</p>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: PieTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="text-white font-medium">{data.name}: {data.value}</p>
        <p className="text-gray-400 text-sm">
          {((data.value / (data.payload.totalVoters || 1)) * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

export const CampaignCharts = ({ campaign, adminDashboard }: CampaignChartsProps & { adminDashboard?: AdminDashboardData }) => {
  if (!campaign && !adminDashboard) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 md:p-6">
            <EmptyState
              icon={BarChart2}
              title="No Participant Data"
              description="Participant statistics will appear here once a campaign is active."
            />
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 md:p-6">
            <EmptyState
              icon={PieChartIcon}
              title="No Voting Data"
              description="Voting statistics will appear here once voting begins."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const participantStats = adminDashboard?.participantStats;
  const voteStats = adminDashboard?.voteStats;
  const campaignStatus = campaign?.status || 'Unknown';

  const participantData = [
    { name: "Candidates", count: participantStats?.candidateCount || 0 },
    { name: "Voters", count: participantStats?.voterCount || 0 }
  ];

  const totalVoters = voteStats?.totalVoters || 0;
  const votedCount = voteStats?.votedCount || 0;
  const notVotedCount = totalVoters - votedCount;

  // Dynamic colors based on campaign status
  const getStatusColors = () => {
    if (campaignStatus === 'Active') {
      return {
        voted: "rgba(34, 197, 94, 0.8)", // Green with transparency
        notVoted: "rgba(156, 163, 175, 0.6)" // Gray with transparency
      };
    } else if (campaignStatus === 'Completed') {
      return {
        voted: "rgba(34, 197, 94, 0.9)", // More solid green
        notVoted: "rgba(239, 68, 68, 0.8)" // Red with transparency
      };
    } else {
      return {
        voted: "rgba(59, 130, 246, 0.6)", // Blue with transparency
        notVoted: "rgba(156, 163, 175, 0.4)" // Light gray
      };
    }
  };

  const statusColors = getStatusColors();

  const voteStatusData = [
    { 
      name: "Voted", 
      value: votedCount, 
      color: statusColors.voted,
      totalVoters: totalVoters
    },
    { 
      name: "Not Voted", 
      value: notVotedCount, 
      color: statusColors.notVoted,
      totalVoters: totalVoters
    }
  ];

  const hasVotingData = totalVoters > 0;
  const shouldShowPieChart = campaignStatus === 'Active' || campaignStatus === 'Completed' || hasVotingData;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {/* Participant's Chart */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-white text-lg md:text-xl pt-4">Participants</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
          <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
            <BarChart data={participantData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9CA3AF" 
                fontSize={12}
                className="md:text-sm"
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                className="md:text-sm"
                allowDecimals={false}
                domain={[0, 'dataMax + 1']}
              />
              <Tooltip 
                content={<ChartTooltip />}
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <Bar 
                dataKey="count" 
                fill="#3B82F6" 
                maxBarSize={60}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Vote Status Chart */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-white text-lg md:text-xl pt-4">Voting Status</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
          {shouldShowPieChart && hasVotingData ? (
            <>
              <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                <PieChart>
                  <Pie
                    data={voteStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {voteStatusData?.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke={entry.color}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-4">
                {voteStatusData?.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 justify-center sm:justify-start">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs sm:text-sm text-gray-300">
                      {item?.name}: {item?.value}
                      <span className="text-gray-400 ml-1">
                        ({totalVoters > 0 ? ((item.value / totalVoters) * 100).toFixed(1) : 0}%)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-[250px] md:h-[300px]">
              <EmptyState
                icon={PieChartIcon}
                title="No Voting Data"
                description={
                  !hasVotingData 
                    ? "Voting statistics will appear here once voters are registered."
                    : "Campaign needs to be active or completed to show voting data."
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};