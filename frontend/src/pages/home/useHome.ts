import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { fetchCampaigns } from "../../store/thunks/campaignThunks";
import { useWallet } from "../../hooks/useWallet";
import { initHomeAnimations } from "./home.gsap";
import type { Campaign } from "../../types";

export const useHome = () => {
  const dispatch = useAppDispatch();
  const campaigns = useAppSelector((state) => state.campaign.campaigns);
  const { account: currentAccount, connect: connectWallet } = useWallet();
  const heroRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchCampaigns());
    setLoading(false);
  }, [dispatch]);

  useEffect(() => {
    initHomeAnimations();
  }, []);

  const featuredCampaigns: Campaign[] = campaigns.slice(0, 3); // Show top 3 campaigns

  const handleScrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return {
    featuredCampaigns,
    currentAccount,
    connectWallet,
    loading,
    heroRef,
    handleScrollToSection
  };
};