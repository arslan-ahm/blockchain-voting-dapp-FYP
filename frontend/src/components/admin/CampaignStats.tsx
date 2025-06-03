import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, AlertCircle } from 'lucide-react';
import type { Campaign } from '../../types';
import { EmptyState } from './EmptyState';

interface CampaignStatsProps {
  campaign?: Campaign | null;
}

export const CampaignStats = ({ campaign }: CampaignStatsProps) => {
  if (!campaign) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent>
          <EmptyState
            icon={AlertCircle}
            title="No Active Campaign"
            description="There are no active campaigns at the moment. Create a new campaign to get started."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Current Campaign
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-gray-700 rounded-lg">
            <h3 className="font-medium text-white mb-3">Campaign-{campaign.id}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Start Date:</span>
                <span className="text-white">
                  {new Date(Number(campaign.startDate) * 1000).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">End Date:</span>
                <span className="text-white">
                  {new Date(Number(campaign.endDate) * 1000).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <Badge variant={campaign.isOpen ? 'default' : 'secondary'}>
                  {campaign.isOpen ? 'Active' : 'Closed'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Winner:</span>
                <span className="text-white">{campaign.winner || "TBD"}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 