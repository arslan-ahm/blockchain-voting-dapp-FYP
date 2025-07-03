import { useEffect } from "react";
import { MapPin, Calendar, Users, Vote, Bookmark, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { 
  fetchNearbyCampaigns, 
  checkUserRegistration, 
  getCampaignVoters,
  castVote 
} from "../../store/thunks/campaignThunks";
import { formatAddress } from "../../utils/formatters";
import type { CampaignDetails } from "../../store/slices/campaignSlice";
import { useWallet } from "../../hooks/useWallet";
import { EmptyState } from "../../components/admin/EmptyState";

interface CampaignListProps {
  userAddress?: string;
}

export const CampaignList = ({ userAddress }: CampaignListProps) => {
  const dispatch = useAppDispatch();
  const { provider, signer } = useWallet();
  const { 
    nearbyCampaigns, 
    fetchingNearbyCampaigns, 
    error,
    campaignVoters,
    userRegistrations,
    castingVote
  } = useAppSelector((state) => state.campaign);

  useEffect(() => {
    // Fetch nearby campaigns on component mount
    dispatch(fetchNearbyCampaigns());
  }, [dispatch]);

  useEffect(() => {
    if (!provider) {
      return;
    }
    
    nearbyCampaigns.forEach(campaign => {
      dispatch(getCampaignVoters({ campaignId: campaign.id, provider }));
      if (userAddress) {
        dispatch(checkUserRegistration({ 
          campaignId: campaign.id, 
          userAddress,
          provider
        }));
      }
    });
  }, [dispatch, nearbyCampaigns, userAddress]);

  const handleVote = async (campaignId: string, candidateAddress: string) => {
    if (!userAddress || !signer) {
      return;
    }
    
    try {
      await dispatch(castVote({
        campaignId: parseInt(campaignId),
        candidate: candidateAddress,
        signer
      })).unwrap();
    } catch (error) {
      console.error('Failed to cast vote:', error);
    }
  };

  console.log(nearbyCampaigns)

  const getUserRegistration = (campaignId: string) => {
    return userRegistrations.find(
      reg => reg.campaignId === parseInt(campaignId) && reg.userAddress === userAddress
    );
  };

  const getCampaignStatus = (campaign: CampaignDetails) => {
    const now = Math.floor(Date.now() / 1000);
    const startDate = parseInt(campaign.startDate);
    const endDate = parseInt(campaign.endDate);

    if (now < startDate) return { status: 'upcoming', color: 'bg-yellow-500/20 border-yellow-700 text-yellow-400' };
    if (now > endDate || !campaign.isOpen) return { status: 'ended', color: 'bg-red-500/20 border-red-700 text-red-400' };
    return { status: 'active', color: 'bg-green-500/20 border-green-700 text-green-400' };
  };

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
          const userReg = getUserRegistration(campaign?.id?.toString());
          const voters = campaignVoters[campaign.id] || [];
          const candidates = voters.filter(voter => userRegistrations.some(
            reg => reg.campaignId === campaign.id && 
                   reg.userAddress === voter.address && 
                   reg.isCandidate
          ));
          const regularVoters = voters.filter(voter => !candidates.some(c => c.address === voter.address));

          return (
            <Card key={campaign.id?.toString()} className="bg-gray-800 border-gray-700 py-2">
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
                          {new Date(campaign?.startDate * 1000).toLocaleDateString()} - 
                          {new Date(campaign?.endDate * 1000).toLocaleDateString()}
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
                  
                  <Badge className={`${statusInfo.color} select-none`}>
                    {statusInfo.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Candidates Section */}
                {candidates.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Bookmark className="h-5 w-5 text-yellow-400" />
                      <h3 className="text-lg font-semibold text-white">Candidates</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {candidates.map((candidate) => (
                        <Card key={candidate.address} className="bg-gray-700 border-gray-600">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-white">
                                  {candidate.name || formatAddress(candidate.address)}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {formatAddress(candidate.address)}
                                </p>
                              </div>
                              
                              {userReg?.isVoter && statusInfo.status === 'active' && (
                                <Button
                                  onClick={() => handleVote(campaign.id?.toString(), candidate.address)}
                                  disabled={castingVote}
                                  variant="outline"
                                  size="sm"
                                  className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                                >
                                  {castingVote ? 'Voting...' : 'Vote'}
                                </Button>
                              )}
                              
                              {candidate.hasVoted && (
                                <CheckCircle className="h-5 w-5 text-green-400" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Voters Section */}
                {regularVoters.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">
                        Registered Voters ({regularVoters.length})
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {regularVoters.map((voter) => (
                        <Card key={voter.address} className="bg-gray-700 border-gray-600">
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
                  </div>
                )}

                {/* Registration Status */}
                {userAddress && (
                  <div className="pt-4 border-t border-gray-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Your Registration Status:</p>
                        <div className="flex items-center gap-2 mt-1">
                          {userReg?.isVoter && (
                            <Badge variant="outline" className="border-green-500 text-green-400">
                              Registered Voter
                            </Badge>
                          )}
                          {userReg?.isCandidate && (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                              Candidate
                            </Badge>
                          )}
                          {!userReg && (
                            <Badge variant="outline" className="border-gray-500 text-gray-400">
                              Not Registered
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {!userReg && statusInfo.status !== 'ended' && (
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