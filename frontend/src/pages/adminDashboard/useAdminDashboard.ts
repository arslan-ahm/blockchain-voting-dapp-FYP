import * as z from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { useWallet } from "../../hooks/useWallet";
import { usePinata } from "../../hooks/usePinata";
import { toast } from "sonner";
import { CAMPAIGN_RULES_TEMPLATE, PLACEHOLDERS } from "../../constants/editor";
import html2pdf from "html2pdf.js";
import {
  fetchAdminDashboardData,
  fetchAllCampaignIds,
  adminCreateCampaign,
  adminDeleteCampaign,
  adminManualCloseCampaign,
  adminProcessVerification,
  fetchVerificationRequests
} from "../../store/thunks/adminThunks";

import {
  selectCreatingCampaign,
  selectDeletingCampaign,
  selectAdminDashboard,
  selectAdminLoading,
  selectAdminError,
  selectProcessingVerification,
  selectClosingCampaign,
  selectCampaignList
} from "../../store/slices/adminSlice";

const campaignSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    startDate: z
      .number()
      .min(Math.floor(Date.now() / 1000), "Start date must be in the future"),
    endDate: z.number(),
    campaignDetails: z.string().min(1, "Campaign rules are required"),
    campaignDocument: z.instanceof(File).optional(),
    feedback: z.string().optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

type CampaignFormData = z.infer<typeof campaignSchema>;

interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface LineChartDataPoint {
  date: string;
  campaigns: number;
  participants: number;
  votes: number;
}

export const useAdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { account, provider, signer } = useWallet();

  // Global state selectors
  const campaignList = useAppSelector(selectCampaignList);
  const campaigns = campaignList.map(c => ({
    ...c,
    title: `Campaign ${c.id}`,
  }));
  const creatingCampaign = useAppSelector(selectCreatingCampaign);
  const deletingCampaign = useAppSelector(selectDeletingCampaign);
  const closingCampaign = useAppSelector(selectClosingCampaign);
  const { verificationRequests } = useAppSelector((state) => ({
    verificationRequests: state.admin.verificationRequests || []
  }));
  const processingVerification = useAppSelector(selectProcessingVerification);
  const adminDashboard = useAppSelector(selectAdminDashboard);
  const adminLoading = useAppSelector(selectAdminLoading);
  useAppSelector(selectAdminError);

  // Local state
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [isLoadingCampaignData, setIsLoadingCampaignData] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "candidates" | "voters">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { uploadFile } = usePinata();

  const campaignForm = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: Math.floor(Date.now() / 1000) + 86400,
      endDate: Math.floor(Date.now() / 1000) + 7 * 86400,
      campaignDetails: CAMPAIGN_RULES_TEMPLATE,
    },
  });

  // Initial data fetch
  useEffect(() => {
    if (provider) {
      dispatch(fetchAllCampaignIds({ provider }));
      if(signer){
        dispatch(fetchVerificationRequests({ signer }));
      }
    }
  }, [dispatch, provider, signer]);

  // Set default selected campaign
  useEffect(() => {
    if (campaigns.length > 0 && selectedCampaign === null) {
      setSelectedCampaign(campaigns[0].id);
    }
  }, [campaigns, selectedCampaign]);

  // Fetch data for the selected campaign
  useEffect(() => {
    if (selectedCampaign !== null && signer && provider) {
      setIsLoadingCampaignData(true);
      dispatch(fetchAdminDashboardData({ campaignId: selectedCampaign, signer })).finally(() => {
        setIsLoadingCampaignData(false);
      });
    }
  }, [selectedCampaign, dispatch, signer, provider]);

  // Handlers
  const handleSelectCampaign = (campaignId: number) => {
    setSelectedCampaign(campaignId);
  };

  const handleUploadDocument: (content: string, startDate: number, endDate: number) => Promise<string> = async (
    content,
    startDate,
    endDate
  ) => {
    setIsUploading(true);
    try {
      const startDateFormatted = new Date(startDate * 1000).toLocaleDateString();
      const endDateFormatted = new Date(endDate * 1000).toLocaleDateString();
      const contentWithPlaceholders = content
        .replace(PLACEHOLDERS.START_DATE, startDateFormatted)
        .replace(PLACEHOLDERS.END_DATE, endDateFormatted);

      const element = document.createElement("div");
      element.innerHTML = contentWithPlaceholders;
      const pdfBlob = await html2pdf()
        .from(element)
        .set({ margin: 10, filename: "campaign_rules.pdf", jsPDF: { unit: "mm", format: "a4", orientation: "portrait" } })
        .output("blob");
      
      const pdfFile = new File([pdfBlob], "campaign_rules.pdf", { type: "application/pdf" });
      return await uploadFile(pdfFile);
    } catch (error) {
      console.error("Failed to upload document:", error);
      toast.error("Failed to upload document");
      return "";
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateCampaign = async (values: CampaignFormData) => {
    if (!signer || !account || !provider) return toast.error("Please connect your wallet.");

    let campaignDetailsIpfsHash = "";
    if (values.campaignDocument) {
      campaignDetailsIpfsHash = await handleUploadDocument(values.campaignDetails, values.startDate, values.endDate);
      if (!campaignDetailsIpfsHash) return;
    }

    const campaignData = {
      title: values.title,
      description: values.description,
      startDate: values.startDate, // Already a timestamp
      endDate: values.endDate,     // Already a timestamp
      detailsIpfsHash: campaignDetailsIpfsHash || '',
      signer,
    };

    await dispatch(adminCreateCampaign(campaignData)).unwrap();
    toast.success("Campaign created successfully");
    campaignForm.reset();
    setShowCreateModal(false);
    dispatch(fetchAllCampaignIds({ provider }));
  };

  const handleDeleteCampaign = async (campaignId: number) => {
    if (!signer || !account || !provider) return toast.error("Please connect your wallet.");

    await dispatch(adminDeleteCampaign({ campaignId, signer })).unwrap();
    toast.success("Campaign deleted successfully");
    if (selectedCampaign === campaignId) {
      setSelectedCampaign(campaigns.length > 1 ? campaigns.find(c => c.id !== campaignId)?.id ?? null : null);
    }
    dispatch(fetchAllCampaignIds({ provider }));
    setShowDeleteModal(false);
    setCampaignToDelete(null);
  };

  const handleCloseCampaign = async (campaignId: number) => {
    if (!signer || !provider) return toast.error("Please connect your wallet.");
    await dispatch(adminManualCloseCampaign({ campaignId, signer })).unwrap();
    toast.success("Campaign closed successfully");
    dispatch(fetchAllCampaignIds({ provider }));
  };

  const handleProcessVerification = async (
    userAddress: string,
    approved: boolean,
    feedback: string
  ): Promise<void> => {
    if (!signer) {
      toast.error("Please connect your wallet.");
      return;
    }
    try {
      await dispatch(adminProcessVerification({ userAddress, approved, feedback, signer })).unwrap();
      toast.success("Verification processed successfully");
      // Re-fetch requests to update the list
      dispatch(fetchVerificationRequests({ signer }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(`Verification failed: ${message}`);
      console.error("Verification processing failed:", error);
    }
  };

  // Data derivation for charts and stats
  const selectedCampaignData = adminDashboard?.currentCampaign;
  const candidates = adminDashboard?.candidates ?? [];
  const voters = adminDashboard?.voters ?? [];

  const participantChartData: ChartDataPoint[] = [
    { name: "Candidates", value: candidates.length, color: "#8884d8" },
    { name: "Voters", value: voters.length, color: "#82ca9d" },
  ];

  const voteStatusChartData: ChartDataPoint[] = [
    { name: "Voted", value: adminDashboard?.voteStats.votedCount ?? 0, color: "#00C49F" },
    { name: "Not Voted", value: adminDashboard?.voteStats.notVotedCount ?? 0, color: "#FF8042" },
  ];

  const lineChartData: LineChartDataPoint[] = campaignList.reduce<LineChartDataPoint[]>((acc, campaign) => {
    const date = new Date((campaign.startDate ?? 0) * 1000);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    let monthData = acc.find(d => d.date === monthKey);
    if (!monthData) {
      monthData = { date: monthKey, campaigns: 0, participants: 0, votes: 0 };
      acc.push(monthData);
    }
    monthData.campaigns++;
    return acc;
  }, []).sort((a, b) => a.date.localeCompare(b.date));

  const dashboardStats = {
    totalCampaigns: campaignList.length,
    activeCampaigns: campaignList.filter(c => c.status === 1).length,
    completedCampaigns: campaignList.filter(c => c.status === 2).length,
    totalParticipants: (adminDashboard?.participantStats.candidateCount ?? 0) + (adminDashboard?.participantStats.voterCount ?? 0),
    totalVotes: adminDashboard?.voteStats.votedCount ?? 0,
    pendingVerifications: verificationRequests.filter(r => r.status === 0).length,
  };

  const campaignStats = campaigns.map(c => ({
    ...c,
    title: `Campaign ${c.id}`,
  }));

  return {
    // State & Data
    campaigns: campaignStats,
    selectedCampaign,
    selectedCampaignData,
    verificationRequests,
    adminDashboard,
    dashboardStats,
    participantChartData,
    voteStatusChartData,
    lineChartData,
    activeTab,
    showCreateModal,
    showDeleteModal,
    campaignToDelete,
    campaignForm,
    adminLoading,

    isLoadingCampaignData,
    isUploading,
    // verificationLoading,
    creatingCampaign,
    deletingCampaign,
    closingCampaign,
    processingVerification,

    // Handlers & Actions
    handleSelectCampaign,
    handleCreateCampaign,
    handleDeleteCampaign,
    handleCloseCampaign,
    handleProcessVerification,
    setActiveTab,
    openCreateModal: () => setShowCreateModal(true),
    closeCreateModal: () => setShowCreateModal(false),
    openDeleteModal: (id: number) => { setCampaignToDelete(id); setShowDeleteModal(true); },
    closeDeleteModal: () => setShowDeleteModal(false),
  };
};