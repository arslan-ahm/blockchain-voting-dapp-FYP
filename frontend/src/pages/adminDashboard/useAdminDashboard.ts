import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createCampaign, deleteCampaign, fetchCampaigns } from "../../store/thunks/campaignThunks";
import { fetchVerificationRequests, processVerification } from "../../store/thunks/verificationThunks";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";

interface CampaignSchema {
    startDate: number;
    endDate: number; // Ensure endDate is explicitly required
    detailsIpfsHash: string;
    feedback?: string;
}

interface CampaignSchema {
    startDate: number;
    endDate: number;
    detailsIpfsHash: string;
    feedback?: string;
}

interface CampaignSchemaContext {
    parent: CampaignSchema;
}

const campaignSchema: z.ZodType<CampaignSchema, z.ZodTypeDef, CampaignSchema> = z.object({
    startDate: z.number().min(Math.floor(Date.now() / 1000), "Start date must be in the future"),
    endDate: z.number()
        .min(Math.floor(Date.now() / 1000), "End date must be valid")
        .refine((endDate, ctx: z.RefinementCtx & CampaignSchemaContext) => endDate > ctx.parent.startDate, {
            message: "End date must be after start date",
        })
        .transform((value: number) => value as number),
    detailsIpfsHash: z.string().min(1, "IPFS hash is required"),
    feedback: z.string().optional(),
});

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