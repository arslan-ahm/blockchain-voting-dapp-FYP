import gsap from "gsap";
import { useRef } from "react";
import { ethers } from "ethers";
import { useGSAP } from "@gsap/react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useCampaignCard } from "./useCampaignCard";
import { formatAddress, formatDate } from "../../utils/formatters";
import type { Campaign } from "../../types";

export const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
  const { handleVote, handleRegister, status, isRegistered, isVoter } = useCampaignCard(campaign);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(cardRef.current, {
      y: 50,
      opacity: 0,
      duration: 0.5,
    });
  }, []);

  return (
    <Card ref={cardRef} className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl text-blue-400">Campaign #{campaign.id}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300">Start: {formatDate(campaign.startDate)}</p>
        <p className="text-gray-300">End: {formatDate(campaign.endDate)}</p>
        <p className="text-gray-300">Status: {campaign.isOpen ? "Open" : "Closed"}</p>
        <p className="text-gray-300 truncate">Details IPFS: {campaign.detailsIpfsHash}</p>
        {campaign.winner !== ethers.ZeroAddress && (
          <p className="text-green-400 font-bold">Winner: {formatAddress(campaign.winner)}</p>
        )}
        <h4 className="mt-4 text-gray-200">Candidates:</h4>
        <ul className="space-y-2">
          {campaign.candidates.map((candidate) => (
            <li key={candidate} className="flex justify-between items-center">
              <span className="text-sm font-mono">{formatAddress(candidate)}</span>
              {campaign.isOpen && isVoter && isRegistered && (
                <Button
                  onClick={() => handleVote(candidate)}
                  disabled={status === "pending"}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
                >
                  {status === "pending" ? "Voting..." : "Vote"}
                </Button>
              )}
            </li>
          ))}
        </ul>
        {campaign.isOpen && !isRegistered && (
          <Button
            onClick={handleRegister}
            disabled={status === "pending"}
            className="mt-4 w-full bg-green-500 hover:bg-green-600"
          >
            Register
          </Button>
        )}
      </CardContent>
    </Card>
  );
};