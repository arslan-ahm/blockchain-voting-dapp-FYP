import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { fetchCampaigns } from "../../store/thunks/campaignThunks";
import type { Campaign } from "../../types";

export const useHome = () => {
  const dispatch = useAppDispatch();
  const campaigns = useAppSelector((state) => state.campaign.campaigns);

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  const featuredCampaigns: Campaign[] = campaigns.slice(0, 3); // Show top 3 campaigns

  return { featuredCampaigns };
};