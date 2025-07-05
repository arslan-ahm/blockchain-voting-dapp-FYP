import React, { useState } from "react";
import { CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { formatAddress } from "../utils/formatters";
import { CheckCircle } from "lucide-react";
import { Vote } from "lucide-react";
import { Card } from "./ui/card";
import type { VotingCardProps } from "../types/VotingCard";

const VotingCard: React.FC<VotingCardProps> = ({
  candidate,
  campaignId,
  userVotingStatus,
  onVote,
  isVoting,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async () => {
    setIsSubmitting(true);
    try {
      const result = await onVote(campaignId, candidate.address);
      if (result.success) {
        // Handle success - could show toast here
        console.log("Vote successful:", result.message);
      } else {
        // Handle error - could show toast here
        console.error("Vote failed:", result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVotedFor = userVotingStatus.votedFor === candidate.address;

  return (
    <Card
      className={`bg-gray-700 border-gray-600 transition-all duration-200 ${
        isVotedFor
          ? "ring-2 ring-green-500 bg-green-900/20"
          : "hover:border-blue-500"
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h4 className="text-xl font-semibold text-white mb-2">
              {candidate.name || formatAddress(candidate.address)}
            </h4>
            <p className="text-sm text-gray-400 mb-2">
              {formatAddress(candidate.address)}
            </p>
            <div className="flex items-center gap-2">
              <Vote className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-300">
                {candidate.votes} votes
              </span>
            </div>
          </div>

          {isVotedFor && <CheckCircle className="h-8 w-8 text-green-400" />}
        </div>

        <div className="space-y-3">
          {userVotingStatus.canVote && !isVotedFor && (
            <Button
              onClick={handleVote}
              disabled={isSubmitting || isVoting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Casting Vote...
                </div>
              ) : (
                "Cast Vote"
              )}
            </Button>
          )}

          {isVotedFor && (
            <div className="flex items-center justify-center gap-2 py-2 text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                You voted for this candidate
              </span>
            </div>
          )}

          {userVotingStatus.hasVoted && !isVotedFor && (
            <div className="text-center py-2 text-gray-400">
              <span className="text-sm">
                You have already voted in this campaign
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VotingCard;
