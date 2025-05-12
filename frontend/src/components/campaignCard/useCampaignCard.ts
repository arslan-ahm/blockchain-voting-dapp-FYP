import { useEffect } from "react";
import { submitVote, registerForCampaign } from "../../store/thunks/voteThunks";
import { resetVoteStatus } from "../../store/slices/voteSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { Role, type Campaign } from "../../types";

export const useCampaignCard = (campaign: Campaign) => {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.vote);
  const user = useAppSelector((state) => state.user);
  const isVoter = user.role === Role.Voter;
  const isRegistered = campaign.voters.includes(user.account || "") || campaign.candidates.includes(user.account || "");

  const handleVote = (candidate: string) => {
    dispatch(submitVote({ campaignId: campaign.id, candidate }));
  };

  const handleRegister = () => {
    dispatch(registerForCampaign(campaign.id));
  };

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        dispatch(resetVoteStatus());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, dispatch]);

  return { handleVote, handleRegister, status, isRegistered, isVoter };
};