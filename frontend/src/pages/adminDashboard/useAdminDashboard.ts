import * as z from "zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { checkUpkeep, createCampaign, deleteCampaign, fetchCampaigns } from "../../store/thunks/campaignThunks";
import { fetchVerificationRequests, processVerification } from "../../store/thunks/verificationThunks";
import { Role } from "../../types";
import { usePinata } from "../../hooks/usePinata";
import { toast } from "sonner";
import { CAMPAIGN_RULES_TEMPLATE, PLACEHOLDERS } from "../../constants/editor";
import html2pdf from "html2pdf.js";

const campaignSchema = z.object({
  startDate: z.number().min(Math.floor(Date.now() / 1000), "Start date must be in the future"),
  endDate: z.number(),
  campaignDetails: z.string().min(1, "Campaign rules are required"),
  campaignDocument: z.instanceof(File).optional(),
  feedback: z.string().optional(),
}).refine(
  (data) => data.endDate > data.startDate,
  { message: "End date must be after start date", path: ["endDate"] }
);

export const useAdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { campaigns, loading: campaignLoading } = useAppSelector((state) => state.campaign);
  const { requests: verificationRequests, status: verificationStatus } = useAppSelector((state) => state.verification);
  const { uploadFile } = usePinata();

  const campaignForm = useForm<z.infer<typeof campaignSchema>>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      startDate: Math.floor(Date.now() / 1000) + 86400,
      endDate: Math.floor(Date.now() / 1000) + 7 * 86400,
      campaignDetails: CAMPAIGN_RULES_TEMPLATE,
      campaignDocument: undefined,
      feedback: "",
    },
  });

  useEffect(() => {
    dispatch(fetchCampaigns());
    dispatch(fetchVerificationRequests());
    dispatch(checkUpkeep());
  }, [dispatch]);

  const replacePlaceholders = (content: string, startDate: number, endDate: number): string => {
    const startDateFormatted = new Date(startDate * 1000).toLocaleDateString();
    const endDateFormatted = new Date(endDate * 1000).toLocaleDateString();
    return content
      .replace(PLACEHOLDERS.START_DATE, startDateFormatted)
      .replace(PLACEHOLDERS.END_DATE, endDateFormatted);
  };

  const onCreateCampaign = async (values: z.infer<typeof campaignSchema>) => {
    try {
      let detailsIpfsHash = "";
      if (values.campaignDocument) {
        detailsIpfsHash = await uploadFile(values.campaignDocument);
      } else {
        const contentWithPlaceholders = replacePlaceholders(
          values.campaignDetails,
          values.startDate,
          values.endDate
        );
        const element = document.createElement("div");
        element.innerHTML = contentWithPlaceholders;
        const pdfBlob = await html2pdf()
          .from(element)
          .set({ margin: 10, filename: "campaign_rules.pdf", jsPDF: { unit: "mm", format: "a4", orientation: "portrait" } })
          .output("blob");
        const pdfFile = new File([pdfBlob], "campaign_rules.pdf", { type: "application/pdf" });
        detailsIpfsHash = await uploadFile(pdfFile);
      }
      dispatch(createCampaign({
        startDate: values.startDate,
        endDate: values.endDate,
        detailsIpfsHash,
      }));
    } catch (error) {
      console.error("Failed to create campaign:", error);
      toast.error("Failed to create campaign");
    }
  };

  const handleUploadDocument = async (
    content: string,
    startDate: number,
    endDate: number,
    setIsUploading: (value: boolean) => void
  ): Promise<string> => {
    try {
      setIsUploading(true);
      const contentWithPlaceholders = replacePlaceholders(content, startDate, endDate);
      const element = document.createElement("div");
      element.innerHTML = contentWithPlaceholders;
      const pdfBlob = await html2pdf()
        .from(element)
        .set({ margin: 10, filename: "campaign_rules.pdf", jsPDF: { unit: "mm", format: "a4", orientation: "portrait" } })
        .output("blob");
      const pdfFile = new File([pdfBlob], "campaign_rules.pdf", { type: "application/pdf" });
      const ipfsHash = await uploadFile(pdfFile);
      return ipfsHash;
    } catch (error) {
      console.error("Failed to upload document:", error);
      toast.error("Failed to upload document");
      return "";
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCampaign = (campaignId: number) => {
    dispatch(deleteCampaign(campaignId));
  };

  const handleProcessVerification = (userAddress: string, approved: boolean, feedback: string) => {
    dispatch(processVerification({ userAddress, approved, feedback }));
  };

  const requestData = verificationRequests.reduce((acc) => {
    const date = new Date().toISOString().split('T')[0];
    const existing = acc.find((d) => d.date === date);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ date, count: 1 });
    }
    return acc;
  }, [] as { date: string; count: number }[]);

  const campaignStats = campaigns.map((campaign) => ({
    campaignId: campaign.id,
    voters: campaign.voters.length,
    candidates: campaign.candidates.length,
  }));

  const roleRequestStats = {
    all: verificationRequests.length,
    candidates: verificationRequests.filter((r) => r.requestedRole === Role.Candidate).length,
    voters: verificationRequests.filter((r) => r.requestedRole === Role.Voter).length,
  };

  return {
    campaigns,
    verificationRequests,
    campaignForm,
    onCreateCampaign,
    handleDeleteCampaign,
    handleProcessVerification,
    handleUploadDocument,
    isLoading: campaignLoading || verificationStatus === "pending",
    requestData,
    campaignStats,
    roleRequestStats,
  };
};