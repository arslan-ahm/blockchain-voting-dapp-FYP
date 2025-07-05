import {
  MapPin,
  Calendar,
  Users,
  Vote,
  Bookmark,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { formatAddress } from "../../utils/formatters";
import { EmptyState } from "../../components/admin/EmptyState";
import { useCampaignList } from "./useCampaignList";
import VotingCard from "../../components/VotingCard";
import { getCampaignStatusBadgeColor } from "../../utils/helpers";
import { mapCampaignStatus } from "../../utils/helpers";
import { cn } from "../../utils/cn";

interface CampaignListProps {
  userAddress?: string;
}

export const CampaignList = ({ userAddress }: CampaignListProps) => {
  const {
    campaigns: nearbyCampaigns,
    loading: fetchingNearbyCampaigns,
    error,
    getCampaignCandidates,
    getCampaignVoters,
    getUserVotingStatus,
    handleVoteSubmission,
    getCampaignStatus,
    castingVote,
  } = useCampaignList({ userAddress });

  if (fetchingNearbyCampaigns) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center text-gray-400 py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          Loading nearby campaign...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent>
            <EmptyState
              icon={MapPin}
              title="Error Loading Campaigns"
              description={error}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (nearbyCampaigns.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent>
            <EmptyState
              icon={MapPin}
              title="No Nearby Campaigns"
              description="There are currently no campaigns in your area. Check back later or create a new campaign."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto py-12 space-y-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-blue-400">
          Nearby Campaign
        </h2>

        {nearbyCampaigns.map((campaign) => {
          const statusInfo = getCampaignStatus(campaign);
          return (
            <Card
              key={campaign.id?.toString()}
              className="bg-gray-800 border-gray-700 py-2"
            >
              {/* Campaign Header */}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-blue-400 mb-2">
                      {campaign.title}
                    </CardTitle>
                    <p className="text-gray-300 mb-4">{campaign.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span>
                          {new Date(
                            campaign?.startDate * 1000
                          ).toLocaleDateString()}{" "}
                          -
                          {new Date(
                            campaign?.endDate * 1000
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-blue-400" />
                        <span>{campaign.voterCount} voters</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Vote className="h-4 w-4 text-blue-400" />
                        <span>{campaign.totalVotes} votes cast</span>
                      </div>
                    </div>
                  </div>

                  <Badge className={cn("select-none", getCampaignStatusBadgeColor(mapCampaignStatus(statusInfo)))}>
                    {statusInfo.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Candidates Section */}
                {getCampaignCandidates(campaign.id).length > 0 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getCampaignCandidates(campaign.id).length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-6">
                            <Bookmark className="h-5 w-5 text-yellow-400" />
                            <h3 className="text-lg font-semibold text-white">
                              Candidates
                            </h3>
                            <Badge
                              variant="outline"
                              className="border-gray-500 text-gray-400"
                            >
                              {getCampaignCandidates(campaign.id).length}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {getCampaignCandidates(campaign.id).map(
                              (candidate) => (
                                <VotingCard
                                  key={candidate.address}
                                  candidate={candidate}
                                  campaignId={campaign.id}
                                  userVotingStatus={getUserVotingStatus(
                                    campaign.id
                                  )}
                                  onVote={handleVoteSubmission}
                                  isVoting={castingVote}
                                />
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Voters Section */}
                {getCampaignVoters(campaign.id).length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">
                        Registered Voters
                      </h3>
                      <Badge
                        variant="outline"
                        className="border-gray-500 text-gray-400"
                      >
                        {getCampaignVoters(campaign.id).length}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {getCampaignVoters(campaign.id).map((voter) => (
                        <Card
                          key={voter.address}
                          className="bg-gray-700 border-gray-600"
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-white truncate">
                                  {voter.name || formatAddress(voter.address)}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                  {formatAddress(voter.address)}
                                </p>
                              </div>

                              {voter.hasVoted && (
                                <CheckCircle className="h-4 w-4 text-green-400 ml-2" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}

                {/* Registration Status */}
                {userAddress && (
                  <div className="pt-4 border-t border-gray-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Your Status:</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getUserVotingStatus(campaign.id).isVoter && (
                            <Badge
                              variant="outline"
                              className="border-green-500 text-green-400"
                            >
                              Registered Voter
                            </Badge>
                          )}
                          {getUserVotingStatus(campaign.id).isCandidate && (
                            <Badge
                              variant="outline"
                              className="border-yellow-500 text-yellow-400"
                            >
                              Candidate
                            </Badge>
                          )}
                          {getUserVotingStatus(campaign.id).hasVoted && (
                            <Badge
                              variant="outline"
                              className="border-blue-500 text-blue-400"
                            >
                              Voted
                            </Badge>
                          )}
                          {!getUserVotingStatus(campaign.id).isRegistered && (
                            <Badge
                              variant="outline"
                              className="border-gray-500 text-gray-400"
                            >
                              Not Registered
                            </Badge>
                          )}
                        </div>
                      </div>

                      {!getUserVotingStatus(campaign.id).isRegistered &&
                        statusInfo !== "ended" && (
                          <Button variant="outline" size="sm">
                            Register for Campaign
                          </Button>
                        )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ErrorBoundary>
  );
};
