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
import { useAppSelector } from "../../hooks/useRedux";
import { Role } from "../../types";

interface CampaignListProps {
  userAddress?: string;
}

// Extended interface for voters with profile data
interface ExtendedVoter {
  address: string;
  name: string;
  hasVoted: boolean;
  type: string;
  profileImageIpfsHash?: string;
  email?: string;
  contactNumber?: string;
  bio?: string;
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

  // Get current user role from Redux store
  const userRole = useAppSelector((state) => state.user.role);
  const isAdmin = userRole === Role.Admin;

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
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-400">
            Nearby Campaign{isAdmin ? " (Admin View)" : ""}
          </h2>
          {isAdmin && (
            <p className="text-sm text-gray-400 mt-2">
              You are viewing this as an administrator - voters section is visible to you only
            </p>
          )}
        </div>

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

                          <div className="flex items-center gap-6">
                            {getCampaignCandidates(campaign.id).map(
                              (candidate) => {
                                const allCandidates = getCampaignCandidates(campaign.id);
                                return (
                                  <VotingCard
                                    key={candidate.address}
                                    candidate={candidate}
                                    campaignId={campaign.id}
                                    userVotingStatus={getUserVotingStatus(
                                      campaign.id
                                    )}
                                    onVote={handleVoteSubmission}
                                    isVoting={castingVote}
                                    allCandidates={allCandidates}
                                    campaignStatus={statusInfo}
                                  />
                                );
                              }
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Voters Section - Only visible to Admin */}
                {isAdmin && getCampaignVoters(campaign.id).length > 0 && (
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getCampaignVoters(campaign.id).map((voter) => {
                        // Type assertion to access extended voter properties
                        const extendedVoter = voter as ExtendedVoter;
                        return (
                          <Card
                            key={voter.address}
                            className="group bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 hover:scale-105 transform-gpu"
                          >
                            <CardContent className="p-6">
                              <div className="flex flex-col items-center text-center space-y-4">
                                {/* Profile Image */}
                                <div className="relative">
                                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 shadow-lg">
                                    <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                      {extendedVoter.profileImageIpfsHash ? (
                                        <img
                                          src={`https://gateway.pinata.cloud/ipfs/${extendedVoter.profileImageIpfsHash}`}
                                          alt={voter.name || "Voter"}
                                          className="w-full h-full object-cover rounded-full"
                                        />
                                      ) : (
                                        <Users className="w-8 h-8 text-blue-400" />
                                      )}
                                    </div>
                                  </div>
                                  {/* Voting Status Indicator */}
                                  {voter.hasVoted && (
                                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full p-2 shadow-lg ring-4 ring-gray-800">
                                      <CheckCircle className="h-4 w-4 text-white" />
                                    </div>
                                  )}
                                </div>

                                {/* Voter Info */}
                                <div className="flex-1 min-w-0 space-y-3">
                                  <div>
                                    <h4 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors duration-200 truncate">
                                      {voter.name || "Anonymous Voter"}
                                    </h4>
                                    <p className="text-sm text-gray-400 font-mono bg-gray-800 px-3 py-1 rounded-full">
                                      {formatAddress(voter.address)}
                                    </p>
                                  </div>
                                  
                                  {/* Voting Status Badges */}
                                  <div className="flex flex-wrap gap-2 justify-center">
                                    <Badge 
                                      variant="outline" 
                                      className="border-blue-400 text-blue-300 bg-blue-500/10 px-3 py-1 text-xs font-medium"
                                    >
                                      <Users className="w-3 h-3 mr-1" />
                                      Voter
                                    </Badge>
                                    {voter.hasVoted ? (
                                      <Badge 
                                        variant="outline" 
                                        className="border-green-400 text-green-300 bg-green-500/10 px-3 py-1 text-xs font-medium"
                                      >
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Voted
                                      </Badge>
                                    ) : (
                                      <Badge 
                                        variant="outline" 
                                        className="border-yellow-400 text-yellow-300 bg-yellow-500/10 px-3 py-1 text-xs font-medium animate-pulse"
                                      >
                                        <Vote className="w-3 h-3 mr-1" />
                                        Pending
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {/* Additional voter details for admin (if available) */}
                                {extendedVoter.email && (
                                  <div className="w-full pt-4 border-t border-gray-700">
                                    <div className="bg-blue-500/5 rounded-lg p-3 border border-blue-500/20">
                                      <p className="text-xs text-blue-300 font-medium">
                                        <span className="opacity-75">Contact:</span> {extendedVoter.email}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Registration Status - Only visible to non-Admin users */}
                {userAddress && !isAdmin && (
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
