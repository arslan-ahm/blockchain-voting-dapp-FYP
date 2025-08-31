import {
  MapPin,
  Calendar,
  Users,
  Vote,
  Bookmark,
  CheckCircle,
  Clock10,
  FileText,
} from "lucide-react";
import { useMemo, useCallback, memo } from "react";
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
import CountdownTimer from "../../components/CountdownTimer";
import { getCampaignStatusBadgeColor } from "../../utils/helpers";
import { mapCampaignStatus } from "../../utils/helpers";
import { cn } from "../../utils/cn";
import { useAppSelector } from "../../hooks/useRedux";
import { useWallet } from "../../hooks/useWallet";
import { Role } from "../../types";
import { getTimeUrgencyLevel, getUrgencyColors } from "../../utils/timeUrgency";

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

// Memoized Voter Card Component to prevent unnecessary re-renders
const VoterCard = memo(({ voter }: { voter: ExtendedVoter }) => {
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
});

VoterCard.displayName = 'VoterCard';

export const CampaignList = memo(({ userAddress }: CampaignListProps) => {
  // Get wallet connection for user address
  const { account } = useWallet();
  
  // Use wallet account if userAddress prop is not provided
  const effectiveUserAddress = userAddress || account || undefined;
  
  const {
    campaigns,
    loading: fetchingNearbyCampaigns,
    error,
    getCampaignCandidates,
    getCampaignVoters,
    getUserVotingStatus,
    handleVoteSubmission,
    getCampaignStatus,
    publicCampaignId,
  } = useCampaignList({ userAddress: effectiveUserAddress });

  // Get current user role from Redux store
  const userRole = useAppSelector((state) => state.user.role);
  const isAdmin = userRole === Role.Admin;

  // Memoized expensive operations
  const campaignData = useMemo(() => {
    if (!campaigns?.length) return null;
    const campaign = campaigns[0];
    
    return {
      campaign,
      candidates: getCampaignCandidates(campaign.id),
      voters: getCampaignVoters(campaign.id),
      userStatus: effectiveUserAddress ? getUserVotingStatus(campaign.id) : null,
      status: getCampaignStatus(campaign), // Pass the campaign object, not just ID
    };
  }, [campaigns, getCampaignCandidates, getCampaignVoters, getUserVotingStatus, getCampaignStatus, effectiveUserAddress]);

  // Memoized handlers
  const handleViewDocument = useCallback((ipfsHash: string) => {
    const pinataUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    window.open(pinataUrl, '_blank', 'noopener,noreferrer');
  }, []);

  const handleVoteWrapper = useCallback(async (campaignId: number, candidateAddress: string) => {
    return await handleVoteSubmission(campaignId, candidateAddress);
  }, [handleVoteSubmission]);

  // Use memoized campaign data
  if (fetchingNearbyCampaigns) {
    return (
      <div className="w-full min-h-screen bg-gray-900 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full sm:max-w-full md:max-w-6xl lg:max-w-7xl xl:max-w-7xl">
          <div className="text-center text-gray-400 py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            Loading campaign...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gray-900 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full sm:max-w-full md:max-w-6xl lg:max-w-7xl xl:max-w-7xl">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent>
              <EmptyState
                icon={MapPin}
                title="Error Loading Campaign"
                description={error}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if wallet is connected
  if (!effectiveUserAddress) {
    return (
      <div className="w-full min-h-screen bg-gray-900 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full sm:max-w-full md:max-w-6xl lg:max-w-7xl xl:max-w-7xl">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent>
              <EmptyState
                icon={Vote}
                title="Wallet Not Connected"
                description="Please connect your wallet to view and participate in campaigns."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Use memoized data or fallback to original logic
  const campaign = campaignData?.campaign || campaigns[0];
  const campaignCandidates = campaignData?.candidates || [];
  const campaignVoters = campaignData?.voters || [];
  const userVotingStatus = campaignData?.userStatus;
  const statusInfo = campaignData?.status;

  if (!campaign) {
    return (
      <div className="w-full min-h-screen bg-gray-900 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full sm:max-w-full md:max-w-6xl lg:max-w-7xl xl:max-w-7xl">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent>
              <EmptyState
                icon={MapPin}
                title="No Campaign Available"
                description={
                  isAdmin 
                    ? "No campaign has been selected for public display. Please select a campaign from the admin dashboard."
                    : "No campaign is currently available for voting. Please check back later."
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="w-full min-h-screen bg-gray-900 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full sm:max-w-full md:max-w-6xl lg:max-w-7xl xl:max-w-7xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-400">
              Current Campaign{isAdmin ? " (Admin View)" : ""}
            </h2>
            {isAdmin && (
              <p className="text-sm text-gray-400 mt-2">
                You are viewing this as an administrator - voters section is visible to you only
              </p>
            )}
            {publicCampaignId && (
              <p className="text-sm text-blue-300 mt-2">
                Campaign ID: #{publicCampaignId}
              </p>
            )}
          </div>

          {(() => {
          // Use memoized status instead of recalculating
          const currentStatusInfo = statusInfo || getCampaignStatus(campaign);
          
          // Get dynamic urgency colors for upcoming campaigns
          const urgencyLevel = statusInfo === "upcoming" ? getTimeUrgencyLevel(campaign.startDate) : 'normal';
          const urgencyColors = getUrgencyColors(urgencyLevel);
          
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
                      {isAdmin && (
                        <>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-blue-400" />
                            <span>{campaign.voterCount} voters</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Vote className="h-4 w-4 text-blue-400" />
                            <span>{campaign.totalVotes} votes cast</span>
                          </div>
                        </>
                      )}
                      {/* Simple countdown for upcoming campaigns */}
                      {statusInfo === "upcoming" && (
                        <div className="flex items-center gap-2">
                          <span className={`flex items-center flex-no-wrap gap-1.5 ${urgencyColors.text}`}>
                            <Clock10 className="h-4 w-4" /> Starts in:
                          </span>
                          <CountdownTimer
                            targetDate={campaign.startDate}
                            variant="compact"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge className={cn("select-none", getCampaignStatusBadgeColor(mapCampaignStatus(currentStatusInfo)))}>
                      {currentStatusInfo.toUpperCase()}
                    </Badge>
                    
                    {/* Add Document View Button */}
                    {campaign.detailsIpfsHash && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument(campaign.detailsIpfsHash)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Candidates Section */}
                {getCampaignCandidates(campaign.id).length > 0 && (
                  <>
                    <div className="w-full">
                      <div className="flex items-center gap-2 mb-6">
                        <Bookmark className="h-5 w-5 text-yellow-400" />
                        <h3 className="text-lg font-semibold text-white">
                          Candidates
                        </h3>
                        <Badge
                          variant="outline"
                          className="border-gray-500 text-gray-400"
                        >
                          {campaignCandidates.length}
                        </Badge>
                      </div>

                      {/* Grid layout for consistent card sizing */}
                      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 w-full">
                        {campaignCandidates.map(
                          (candidate) => {
                            // Only show voting interface if user has voting status
                            if (!userVotingStatus) return null;
                            
                            return (
                              <div key={candidate.address} className="flex w-full">
                                <VotingCard
                                  candidate={candidate}
                                  campaignId={campaign.id}
                                  userVotingStatus={userVotingStatus}
                                  onVote={handleVoteWrapper}
                                  allCandidates={campaignCandidates}
                                  campaignStatus={statusInfo}
                                />
                              </div>
                            );
                          }
                        ).filter(Boolean)}
                      </div>
                    </div>
                  </>
                )}

                {/* Voters Section - Only visible to Admin */}
                {isAdmin && campaignVoters.length > 0 && (
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
                        {campaignVoters.length}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {campaignVoters.map((voter) => (
                        <VoterCard key={voter.address} voter={voter} />
                      ))}
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
                          {getUserVotingStatus(campaign.id).hasVerifiedRole && (
                            <Badge
                              variant="outline"
                              className="border-green-500 text-green-400"
                            >
                              {getUserVotingStatus(campaign.id).userRole === Role.Voter ? "Verified Voter" : "Verified Candidate"}
                            </Badge>
                          )}
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
                          {getUserVotingStatus(campaign.id).requiresVerification && (
                            <Badge
                              variant="outline"
                              className="border-red-500 text-red-400"
                            >
                              Needs Verification
                            </Badge>
                          )}
                          {getUserVotingStatus(campaign.id).isPendingVerification && (
                            <Badge
                              variant="outline"
                              className="border-orange-500 text-orange-400"
                            >
                              Pending Verification
                            </Badge>
                          )}
                          {!getUserVotingStatus(campaign.id).isRegistered &&
                            !getUserVotingStatus(campaign.id).hasVerifiedRole &&
                            !getUserVotingStatus(campaign.id).requiresVerification &&
                            !getUserVotingStatus(campaign.id).isPendingVerification && (
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
                        !getUserVotingStatus(campaign.id).hasVerifiedRole &&
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
        })()}
        </div>
      </div>
    </ErrorBoundary>
  );
});

CampaignList.displayName = 'CampaignList';
