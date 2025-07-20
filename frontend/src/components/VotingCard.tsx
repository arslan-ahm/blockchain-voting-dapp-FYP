import React, { useState, useMemo } from "react";
import { CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { formatAddress } from "../utils/formatters";
import { CheckCircle, Vote, User, Crown } from "lucide-react";
import { Card } from "./ui/card";
import { useAppSelector } from "../hooks/useRedux";
import { Role } from "../types";
import type { VotingCardProps } from "../types/VotingCard";

const VotingCard: React.FC<VotingCardProps> = ({
  candidate,
  campaignId,
  userVotingStatus,
  onVote,
  isVoting,
  campaignStatus = "active",
  allCandidates = [],
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get current user role to determine if vote count should be shown
  const userRole = useAppSelector((state) => state.user.role);
  const isAdmin = userRole === Role.Admin;

  // Determine if candidate is leading (has most votes)
  const candidateIsLeading = useMemo(() => {
    if (allCandidates.length === 0) return false;
    
    const maxVotes = Math.max(...allCandidates.map(c => parseInt(c.votes) || 0));
    const candidateVotes = parseInt(candidate.votes) || 0;
    
    return candidateVotes > 0 && candidateVotes === maxVotes;
  }, [allCandidates, candidate.votes]);

  // Determine if special styles should be shown
  const shouldShowLeaderStyles = useMemo(() => {
    if (!candidateIsLeading) return false;
    
    // Admin can see leader styles during and after campaign
    if (isAdmin) return true;
    
    // Others only see leader styles after campaign ends
    return campaignStatus === "ended";
  }, [candidateIsLeading, isAdmin, campaignStatus]);

  const handleVote = async () => {
    setIsSubmitting(true);
    try {
      const result = await onVote(campaignId, candidate.address);
      if (result.success) {
        console.log("Vote successful:", result.message);
      } else {
        console.error("Vote failed:", result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVotedFor = userVotingStatus.votedFor === candidate.address;

  return (
    <Card
      className={`group transition-all duration-300 hover:shadow-2xl transform-gpu min-h-[400px] ${
        shouldShowLeaderStyles
          ? "bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-400/60 ring-2 ring-yellow-400/30 shadow-yellow-500/20"
          : "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600"
      } ${
        isVotedFor
          ? "ring-2 ring-green-400 bg-gradient-to-br from-green-900/30 to-gray-900 border-green-400 shadow-green-500/20"
          : shouldShowLeaderStyles
          ? "hover:shadow-yellow-500/40 hover:scale-[1.02]"
          : "hover:border-blue-400 hover:shadow-blue-500/20 hover:scale-[1.02]"
      }`}
    >
      <CardContent className="p-6 h-full flex flex-col">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          <div className="relative">
            <div className={`w-24 h-24 rounded-full p-0.5 shadow-lg ${
              shouldShowLeaderStyles 
                ? "bg-gradient-to-br from-yellow-400 to-orange-500" 
                : "bg-gradient-to-br from-blue-500 to-purple-600"
            }`}>
              <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                {candidate.profileImageIpfsHash ? (
                  <img
                    src={`https://gateway.pinata.cloud/ipfs/${candidate.profileImageIpfsHash}`}
                    alt={candidate.name || "Candidate"}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className={`w-10 h-10 ${shouldShowLeaderStyles ? "text-yellow-400" : "text-blue-400"}`} />
                )}
              </div>
            </div>
            {isVotedFor && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full p-2 shadow-lg ring-4 ring-gray-800">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            )}
            {shouldShowLeaderStyles && (
              <div className="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg ring-4 ring-gray-800">
                <Crown className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          {/* Candidate Info */}
          <div className="space-y-3 w-full">
            <div>
              <h4 className={`text-lg font-bold transition-colors duration-200 ${
                shouldShowLeaderStyles 
                  ? "text-yellow-300 group-hover:text-yellow-200" 
                  : "text-white group-hover:text-blue-300"
              }`}>
                {candidate.name || "Anonymous Candidate"}
              </h4>
              <p className="text-xs text-gray-400 font-mono bg-gray-800 px-2 py-1 rounded-full mt-2">
                {formatAddress(candidate.address)}
              </p>
            </div>
            
            {/* Badge */}
            <Badge 
              variant="outline" 
              className={`px-3 py-1 text-xs font-medium ${
                shouldShowLeaderStyles
                  ? "border-yellow-400 text-yellow-300 bg-yellow-500/10"
                  : "border-blue-400 text-blue-300 bg-blue-500/10"
              }`}
            >
              <Crown className="w-3 h-3 mr-1" />
              {shouldShowLeaderStyles ? "Leading Candidate" : "Candidate"}
            </Badge>
          </div>
        </div>

        {/* Content Section - Flexible */}
        <div className="flex-1 space-y-4">
          {/* Vote Count - Only visible to Admin */}
          {isAdmin && (
            <div className={`p-3 rounded-lg border ${
              shouldShowLeaderStyles
                ? "bg-yellow-500/5 border-yellow-500/20"
                : "bg-purple-500/5 border-purple-500/20"
            }`}>
              <div className="flex items-center justify-center gap-2">
                <Vote className={`h-4 w-4 ${shouldShowLeaderStyles ? "text-yellow-400" : "text-purple-400"}`} />
                <span className={`text-sm font-semibold ${
                  shouldShowLeaderStyles ? "text-yellow-300" : "text-purple-300"
                }`}>
                  {candidate.votes} votes
                  {shouldShowLeaderStyles && candidateIsLeading && " 👑 Leading"}
                </span>
              </div>
            </div>
          )}

          {/* Bio Section (if available) */}
          {candidate.bio && (
            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <h5 className="text-sm font-semibold text-gray-300 mb-2">About</h5>
              <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                {candidate.bio}
              </p>
            </div>
          )}

          {/* Contact Information */}
          {candidate.email && (
            <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
              <p className="text-sm text-blue-300">
                <span className="font-medium">Contact:</span> {candidate.email}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="space-y-3 mt-6">
          {/* Don't show any voting buttons or messages for admin users */}
          {userVotingStatus.isAdmin ? (
            <div className="text-center py-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <span className="text-sm text-blue-400 font-medium">
                Admin View - Monitoring Mode
              </span>
            </div>
          ) : (
            <>
              {userVotingStatus.canVote && !isVotedFor && (
                <Button
                  onClick={handleVote}
                  disabled={isSubmitting || isVoting}
                  className={`w-full py-3 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 transform-gpu ${
                    shouldShowLeaderStyles
                      ? "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  }`}
                >
                  {isSubmitting || isVoting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Casting Vote...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Vote className="h-4 w-4" />
                      Vote for {candidate.name?.split(' ')[0] || 'Candidate'}
                    </div>
                  )}
                </Button>
              )}

              {isVotedFor && (
                <div className="flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-400/30 shadow-lg">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-sm font-bold text-green-300">
                    You voted for this candidate
                  </span>
                </div>
              )}

              {userVotingStatus.hasVoted && !isVotedFor && (
                <div className="text-center py-4 bg-gray-700/50 rounded-lg border border-gray-600">
                  <span className="text-sm text-gray-400 font-medium">
                    You have already voted in this campaign
                  </span>
                </div>
              )}

              {!userVotingStatus.canVote && !userVotingStatus.hasVoted && (
                <div className="text-center py-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                  <span className="text-sm text-amber-400 font-medium">
                    {userVotingStatus.requiresVerification 
                      ? "You need to request voter verification to vote"
                      : userVotingStatus.isPendingVerification
                      ? "Your verification request is pending admin approval"
                      : userVotingStatus.hasVerifiedRole
                      ? (() => {
                          // For verified voters, provide campaign-specific messages
                          if (campaignStatus === "upcoming") return "Get ready to vote! Campaign starts soon";
                          if (campaignStatus === "ended") return "Campaign has ended - voting is no longer available";
                          return "You're ready to vote when the campaign becomes active";
                        })()
                      : "You need voter verification to participate"
                    }
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VotingCard;
