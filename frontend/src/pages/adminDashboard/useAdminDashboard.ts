import * as z from "zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { createCampaign, deleteCampaign, fetchCampaigns } from "../../store/thunks/campaignThunks";
import { fetchVerificationRequests, processVerification } from "../../store/thunks/verificationThunks";

const campaignSchema = z.object({
  startDate: z.number().min(Math.floor(Date.now() / 1000), "Start date must be in the future"),
  endDate: z.number(),
  detailsIpfsHash: z.string().min(1, "IPFS hash is required"),
  feedback: z.string().optional(),
}).refine(
  (data) => data.endDate > data.startDate,
  { message: "End date must be after start date", path: ["endDate"] }
);

export const useAdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { campaigns, loading: campaignLoading } = useAppSelector((state) => state.campaign);
  const { requests: verificationRequests, status: verificationStatus } = useAppSelector((state) => state.verification);

  const campaignForm = useForm<z.infer<typeof campaignSchema>>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      startDate: Math.floor(Date.now() / 1000) + 86400, // Tomorrow
      endDate: Math.floor(Date.now() / 1000) + 7 * 86400, // One week from now
      detailsIpfsHash: "",
      feedback: "",
    },
  });

  useEffect(() => {
    dispatch(fetchCampaigns());
    dispatch(fetchVerificationRequests());
  }, [dispatch]);

  const onCreateCampaign = async (values: z.infer<typeof campaignSchema>) => {
    dispatch(createCampaign(values));
  };

  const handleDeleteCampaign = (campaignId: number) => {
    dispatch(deleteCampaign(campaignId));
  };

  const handleProcessVerification = (userAddress: string, approved: boolean, feedback: string) => {
    dispatch(processVerification({ userAddress, approved, feedback }));
  };

  return {
    campaigns,
    verificationRequests,
    campaignForm,
    onCreateCampaign,
    handleDeleteCampaign,
    handleProcessVerification,
    isLoading: campaignLoading || verificationStatus === "pending",
  };
};