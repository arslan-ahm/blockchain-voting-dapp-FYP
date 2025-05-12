import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { fetchCampaigns } from "../../store/thunks/campaignThunks";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import type { Campaign } from "../../types";

interface Winner {
  campaignId: number;
  address: string;
}

export const useCampaignList = () => {
  const dispatch = useAppDispatch();
  const { campaigns, loading, error } = useAppSelector((state) => state.campaign);
  const [winner, setWinner] = useState<Winner | null>(null);

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  useEffect(() => {
    const checkWinners = () => {
      const now = Math.floor(Date.now() / 1000);
      campaigns.forEach((campaign: Campaign) => {
        if (campaign.isOpen && campaign.endDate < now && campaign.winner !== ethers.ZeroAddress) {
          setWinner({ campaignId: campaign.id, address: campaign.winner });
        }
      });
    };
    checkWinners();
    const interval = setInterval(checkWinners, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [campaigns]);

  return { campaigns, loading, error, winner, setWinner };
};