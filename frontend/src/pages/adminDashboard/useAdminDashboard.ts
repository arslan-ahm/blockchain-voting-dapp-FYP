import * as z from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { useWallet } from "../../hooks/useWallet";
import {
  checkUpkeep,
  createCampaign,
  deleteCampaign,
  fetchCampaigns,
  manualCloseCampaign,
  performUpkeep,
} from "../../store/thunks/campaignThunks";
import { fetchVerificationRequests, processVerification } from "../../store/thunks/verificationThunks";
import { Role } from "../../types";
import { usePinata } from "../../hooks/usePinata";
import { toast } from "sonner";
import { CAMPAIGN_RULES_TEMPLATE, PLACEHOLDERS } from "../../constants/editor";
import html2pdf from "html2pdf.js";
import {
  selectCampaigns,
  selectCampaignLoading,
  selectCreatingCampaign,
  selectDeletingCampaign,
  selectUpkeepData,
  selectUpkeepLoading,
  selectAdminDashboard,
  selectAdminLoading,
  selectAdminError,
  selectVerificationRequests,
  selectVerificationLoading,
  selectProcessingVerification,
  selectClosingCampaign
} from "../../store/slices/adminSlice";
import { fetchAdminDashboardData } from "../../store/thunks/adminThunks";

const campaignSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.number().min(Math.floor(Date.now() / 1000), "Start date must be in the future"),
  endDate: z.number(),
  campaignDetails: z.string().min(1, "Campaign rules are required"),
  campaignDocument: z.instanceof(File).optional(),
  feedback: z.string().optional(),
}).refine(
  (data) => data.endDate > data.startDate,
  { message: "End date must be after start date", path: ["endDate"] }
);

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
  const { account, provider } = useWallet();

  const campaigns = useAppSelector(selectCampaigns);
  const campaignLoading = useAppSelector(selectCampaignLoading);
  const creatingCampaign = useAppSelector(selectCreatingCampaign);
  const deletingCampaign = useAppSelector(selectDeletingCampaign);
  const closingCampaign = useAppSelector(selectClosingCampaign);
  const upkeepData = useAppSelector(selectUpkeepData);
  const upkeepLoading = useAppSelector(selectUpkeepLoading);
  const adminDashboard = useAppSelector(selectAdminDashboard);
  const adminLoading = useAppSelector(selectAdminLoading);
  const adminError = useAppSelector(selectAdminError);
  const verificationRequests = useAppSelector(selectVerificationRequests);
  const verificationLoading = useAppSelector(selectVerificationLoading);
  const processingVerification = useAppSelector(selectProcessingVerification);

  const { uploadFile } = usePinata();

  const [isUploading, setIsUploading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'candidates' | 'voters'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<number | null>(null);

  const campaignForm = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: Math.floor(Date.now() / 1000) + 86400, // Tomorrow
      endDate: Math.floor(Date.now() / 1000) + 7 * 86400, // 7 days from now
      campaignDetails: CAMPAIGN_RULES_TEMPLATE,
      campaignDocument: undefined,
      feedback: "",
    },
  });

  useEffect(() => {
    dispatch(fetchCampaigns());
    dispatch(fetchVerificationRequests());
    dispatch(fetchAdminDashboardData());
    dispatch(checkUpkeep());
  }, [dispatch]);

  useEffect(() => {
    if (campaigns.length > 0 && !selectedCampaign) {
      setSelectedCampaign(campaigns[0].id);
    }
  }, [campaigns, selectedCampaign]);

  const replacePlaceholders = (content: string, startDate: number, endDate: number): string => {
    const startDateFormatted = new Date(startDate * 1000).toLocaleDateString();
    const endDateFormatted = new Date(endDate * 1000).toLocaleDateString();
    return content
      .replace(PLACEHOLDERS.START_DATE, startDateFormatted)
      .replace(PLACEHOLDERS.END_DATE, endDateFormatted);
  };

  const handleUploadDocument = async (
    content: string,
    startDate: number,
    endDate: number
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
  const onCreateCampaign = async (values: CampaignFormData) => {
    try {
      // Enhanced wallet connection validation
      if (!account || !provider) {
        toast.error("Please connect your wallet first");
        return;
      }
  
      // Additional validation to ensure admin role
      if (!account.toLowerCase().includes('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'.toLowerCase())) {
        toast.error("Only admin can create campaigns");
        return;
      }
  
      // Validate dates first
      const now = Math.floor(Date.now() / 1000);
      if (values.startDate <= now) {
        toast.error("Campaign start date must be in the future");
        return;
      }
  
      if (values.endDate <= values.startDate) {
        toast.error("Campaign end date must be after start date");
        return;
      }
  
      // Upload document to IPFS
      let detailsIpfsHash = "";
  
      try {
        if (values.campaignDocument) {
          detailsIpfsHash = await uploadFile(values.campaignDocument);
        } else {
          detailsIpfsHash = await handleUploadDocument(
            values.campaignDetails,
            values.startDate,
            values.endDate
          );
        }
      } catch (uploadError) {
        console.error("Failed to upload campaign document:", uploadError);
        toast.error("Failed to upload campaign document");
        return;
      }
  
      if (!detailsIpfsHash) {
        toast.error("Failed to upload campaign document");
        return;
      }
  
      // Dispatch with explicit account parameter
      await dispatch(createCampaign({
        title: values.title,
        description: values.description,
        startDate: values.startDate,
        endDate: values.endDate,
        campaignDetailsIpfsHash: detailsIpfsHash,
        account: account // Pass the connected account
      })).unwrap();
  
      campaignForm.reset();
      setShowCreateModal(false);
  
      try {
        await Promise.all([
          dispatch(fetchCampaigns()).unwrap(),
          dispatch(fetchAdminDashboardData()).unwrap()
        ]);
      } catch (refreshError) {
        console.warn("Some data refresh failed:", refreshError);
      }
  
    } catch (error) {
      console.error("Failed to create campaign:", error);
  
      if (error instanceof Error) {
        if (error.message) {
          if (!error.message.includes("Failed to create campaign")) {
            toast.error(`Failed to create campaign: ${error.message}`);
          }
        }
      } else {
        toast.error("Failed to create campaign. Please try again.");
      }
    }
  };

  const handleDeleteCampaign = async (campaignId: number, account: string) => {
    try {
      await dispatch(deleteCampaign({
        campaignId,
        adminAddress: account
      })).unwrap();
      toast.success("Campaign deleted successfully");

      if (selectedCampaign === campaignId) {
        setSelectedCampaign(null);
      }

      dispatch(fetchCampaigns());
      dispatch(fetchAdminDashboardData());
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      toast.error("Failed to delete campaign");
    } finally {
      setShowDeleteModal(false);
      setCampaignToDelete(null);
    }
  };

  const handleCloseCampaign = async (campaignId: number) => {
    try {
      await dispatch(manualCloseCampaign(campaignId)).unwrap();
      toast.success("Campaign closed successfully");

      dispatch(fetchCampaigns());
      dispatch(fetchAdminDashboardData());
    } catch (error) {
      console.error("Failed to close campaign:", error);
      toast.error("Failed to close campaign");
    }
  };

  // Verification management
  const handleProcessVerification = async (userAddress: string, approved: boolean, feedback: string = "") => {
    try {
      await dispatch(processVerification({ userAddress, approved, feedback })).unwrap();
      toast.success(`Verification request ${approved ? 'approved' : 'rejected'} successfully`);

      dispatch(fetchVerificationRequests());
      dispatch(fetchAdminDashboardData());
    } catch (error) {
      console.error("Failed to process verification:", error);
      toast.error("Failed to process verification request");
    }
  };

  // Upkeep management
  const handlePerformUpkeep = async () => {
    if (!upkeepData?.upkeepNeeded) {
      toast.info("No upkeep needed at this time");
      return;
    }
    try {
      await dispatch(performUpkeep(upkeepData.campaignId.toString())).unwrap();
      toast.success("Campaign upkeep performed successfully");

      dispatch(fetchCampaigns());
      dispatch(fetchAdminDashboardData());
      dispatch(checkUpkeep());
    } catch (error) {
      console.error("Failed to perform upkeep:", error);
      toast.error("Failed to perform upkeep");
    }
  };

  const openCreateModal = () => setShowCreateModal(true);
  const closeCreateModal = () => {
    setShowCreateModal(false);
    campaignForm.reset();
  };

  const openDeleteModal = (campaignId: number) => {
    setCampaignToDelete(campaignId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCampaignToDelete(null);
  };

  const getCurrentCampaign = () => {
    return adminDashboard?.currentCampaign || campaigns.find(c => c.id === selectedCampaign);
  };

  const getParticipantChartData = (): ChartDataPoint[] => {
    const current = getCurrentCampaign();
    if (!current || !adminDashboard?.participantStats) {
      return [];
    }

    return [
      {
        name: "Candidates",
        value: adminDashboard.participantStats.candidateCount,
        color: "#8884d8"
      },
      {
        name: "Voters",
        value: adminDashboard.participantStats.voterCount,
        color: "#82ca9d"
      }
    ];
  };

  const getVoteStatusChartData = (): ChartDataPoint[] => {
    if (!adminDashboard?.voteStats) {
      return [];
    }

    return [
      {
        name: "Voted",
        value: adminDashboard.voteStats.votedCount,
        color: "#00C49F"
      },
      {
        name: "Not Voted",
        value: adminDashboard.voteStats.notVotedCount,
        color: "#FF8042"
      }
    ];
  };

  const getLineChartData = (): LineChartDataPoint[] => {
    if (!adminDashboard?.monthlyCampaigns) {
      return [];
    }

    const { campaignIds, startDates } = adminDashboard.monthlyCampaigns;

    const monthlyData: { [key: string]: LineChartDataPoint } = {};

    campaignIds.forEach((_, index) => {
      const date = new Date(startDates[index] * 1000);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          date: monthKey,
          campaigns: 0,
          participants: 0,
          votes: 0
        };
      }

      monthlyData[monthKey].campaigns += 1;
    });

    return Object.values(monthlyData).sort((a, b) => a.date.localeCompare(b.date));
  };

  const campaignStats = campaigns.map((campaign) => ({
    campaignId: campaign.id,
    voters: campaign.voters?.length || 0,
    candidates: campaign.candidates?.length || 0,
    isOpen: campaign.isOpen,
    winner: campaign.winner,
    title: `Campaign ${campaign.id}`,
    startDate: campaign.startDate,
    endDate: campaign.endDate
  }));

  const roleRequestStats = {
    all: verificationRequests.length,
    candidates: verificationRequests.filter((r) => r.requestedRole === Role.Candidate).length,
    voters: verificationRequests.filter((r) => r.requestedRole === Role.Voter).length,
  };

  const dashboardStats = {
    totalCampaigns: adminDashboard?.totalCampaigns || campaigns.length,
    activeCampaigns: adminDashboard?.activeCampaigns || campaigns.filter(c => c.isOpen).length,
    completedCampaigns: adminDashboard?.completedCampaigns || campaigns.filter(c => !c.isOpen).length,
    totalParticipants: (adminDashboard?.participantStats?.candidateCount || 0) + (adminDashboard?.participantStats?.voterCount || 0),
    totalVotes: adminDashboard?.voteStats?.votedCount || 0,
    pendingVerifications: verificationRequests.length
  };

  const getFilteredParticipants = () => {
    if (!adminDashboard) return { candidates: [], voters: [] };

    const { candidates = [], voters = [] } = adminDashboard;

    switch (activeTab) {
      case 'candidates':
        return { candidates, voters: [] };
      case 'voters':
        return { candidates: [], voters };
      default:
        return { candidates, voters };
    }
  };

  return {
    campaigns,
    verificationRequests,
    adminDashboard,
    selectedCampaign,
    currentCampaign: getCurrentCampaign(),

    participantChartData: getParticipantChartData(),
    voteStatusChartData: getVoteStatusChartData(),
    lineChartData: getLineChartData(),

    campaignStats,
    roleRequestStats,
    dashboardStats,
    upkeepData,

    filteredParticipants: getFilteredParticipants(),

    campaignForm,

    activeTab,
    showCreateModal,
    showDeleteModal,
    campaignToDelete,

    isLoading: campaignLoading || adminLoading || verificationLoading,
    isUploading,
    creatingCampaign,
    deletingCampaign,
    closingCampaign,
    upkeepLoading,
    processingVerification,

    adminError,

    isConnected: !!account && !!provider,
    address: account,

    onCreateCampaign,
    handleDeleteCampaign,
    handleCloseCampaign,
    setSelectedCampaign,

    handleProcessVerification,

    handlePerformUpkeep,

    setActiveTab,
    openCreateModal,
    closeCreateModal,
    openDeleteModal,
    closeDeleteModal,

    refreshDashboard: () => {
      dispatch(fetchCampaigns());
      dispatch(fetchAdminDashboardData());
      dispatch(fetchVerificationRequests());
      dispatch(checkUpkeep());
    }
  };
};