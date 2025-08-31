import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  TrendingUp,
  AlertCircle,
  Calendar,
  Clock,
  Trophy,
  FileText,
  ExternalLink,
  FileImage,
} from "lucide-react";
import type { Campaign } from "../../types";
import { EmptyState } from "./EmptyState";
import { cn } from "../../utils/cn";
import { getCampaignStatusBadgeColor } from "../../utils/helpers";
import {
  formatDuration,
  getCampaignRelativeTime,
} from "../../utils/formatters";

export const CampaignStats = ({ campaign }: { campaign?: Campaign | null }) => {

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

  // Helper function to check if winner exists
  const hasWinner =
    campaign.winner &&
    campaign.winner !== "0x0000000000000000000000000000000000000000";

  // Helper function to get file type from IPFS hash or URL
  const getFileType = (hash: string) => {
    if (!hash) return null;
    // Simple check for common extensions
    const lowerHash = hash.toLowerCase();
    if (lowerHash.includes(".pdf") || lowerHash.includes("pdf")) return "pdf";
    if (
      lowerHash.includes(".jpg") ||
      lowerHash.includes(".jpeg") ||
      lowerHash.includes(".png") ||
      lowerHash.includes(".gif")
    )
      return "image";
    return "unknown";
  };

  const fileType = getFileType(campaign.detailsIpfsHash);
  const ipfsUrl = campaign.detailsIpfsHash
    ? `https://ipfs.io/ipfs/${campaign.detailsIpfsHash}`
    : null;

  const handleViewDetails = () => {
    if (!ipfsUrl) return;

    // Always open in new tab for all file types
    window.open(ipfsUrl, "_blank");
  };

  return (
    <Card className="bg-gray-800 border-gray-700 shadow-xl">
      <CardHeader className="pb-4 relative">
        <CardTitle className="text-white flex items-center gap-2 pt-4 text-xl">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          Campaign Details
        </CardTitle>
        {/* Status Badge - Top Right Corner */}
        <div className="absolute top-4 right-4">
          <Badge
            className={cn(
              "px-3 py-1 text-xs font-medium",
              getCampaignStatusBadgeColor(campaign.status)
            )}
          >
            {campaign.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Campaign Title with ID and Description */}
        <div className="space-y-3">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {campaign.title} (# ID: {campaign.id})
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              {campaign.description}
            </p>
          </div>
        </div>

        {/* Campaign Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-green-400" />
              <span className="text-gray-300 text-sm font-medium">
                Start Date
              </span>
            </div>
            <p className="text-white font-semibold">
              {new Date(Number(campaign.startDate) * 1000).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }
              )}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {new Date(Number(campaign.startDate) * 1000).toLocaleTimeString(
                "en-US",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </p>
          </div>

          {/* End Date */}
          <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-red-400" />
              <span className="text-gray-300 text-sm font-medium">
                End Date
              </span>
            </div>
            <p className="text-white font-semibold">
              {new Date(Number(campaign.endDate) * 1000).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }
              )}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {new Date(Number(campaign.endDate) * 1000).toLocaleTimeString(
                "en-US",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </p>
          </div>

          {/* Duration */}
          <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300 text-sm font-medium">
                Duration
              </span>
            </div>
            <p className="text-white font-semibold">
              {formatDuration(campaign.startDate, campaign.endDate)}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {getCampaignRelativeTime(campaign.startDate, "start")}
            </p>
          </div>

          {/* Campaign Status */}
          <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={cn(
                  "w-4 h-4 rounded-full",
                  campaign.isOpen ? "bg-green-400" : "bg-red-400"
                )}
              />
              <span className="text-gray-300 text-sm font-medium">
                Campaign Status
              </span>
            </div>
            <p className="text-white font-semibold">
              {campaign.isOpen ? "Open" : "Closed"}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {campaign.isOpen ? "Accepting votes" : "Voting closed"}
            </p>
          </div>
        </div>

        {/* Winner Section - Only show if there's a winner */}
        {hasWinner && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-4 border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-300 font-medium">Winner</span>
            </div>
            <p className="text-white font-mono text-sm break-all bg-gray-800 rounded p-2 border">
              {campaign.winner}
            </p>
          </div>
        )}

        {/* Campaign Details Button */}
        {campaign.detailsIpfsHash && (
          <div className="pt-4 border-t border-gray-600">
            <Button
              onClick={handleViewDetails}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {fileType === "pdf" ? (
                <>
                  <FileText className="w-4 h-4" />
                  View Campaign Contract (PDF)
                  <ExternalLink className="w-4 h-4" />
                </>
              ) : (
                <>
                  <FileImage className="w-4 h-4" />
                  View Campaign Details
                  <ExternalLink className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
