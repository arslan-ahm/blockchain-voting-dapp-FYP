import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import type { Campaign } from '../../types';
import { EmptyState } from './EmptyState';

interface CampaignChartsProps {
  campaign?: Campaign | null;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      details?: {
        title: string;
        status: string;
        startDate: string;
        winner: string | null;
      };
    };
  }>;
}

const ChartTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
        <p className="text-white font-medium">{data.details?.title}</p>
        <p className="text-gray-400 text-sm">Status: {data.details?.status}</p>
        <p className="text-gray-400 text-sm">Start: {data.details?.startDate}</p>
        {data.details?.winner && (
          <p className="text-gray-400 text-sm">Winner: {data.details?.winner}</p>
        )}
      </div>
    );
  }
  return null;
};

export const CampaignCharts = ({ campaign }: CampaignChartsProps) => {
  if (!campaign) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent>
            <EmptyState
              icon={BarChart2}
              title="No Participant Data"
              description="Participant statistics will appear here once a campaign is active."
            />
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent>
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

  const participantData = [
    { name: "Candidates", count: campaign.candidates?.length || 0 },
    { name: "Voters", count: campaign.voters?.length || 0 }
  ];

  const voteStatusData = [
    { name: "Voted", value: campaign.voters?.length || 0, color: "#22c55e" },
    { name: "Not Voted", value: campaign.voters?.length || 0, color: "#ef4444" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Participant's Chart */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={participantData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                content={<ChartTooltip />}
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Vote Status Chart */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Voting Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={voteStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {voteStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {voteStatusData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-300">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 