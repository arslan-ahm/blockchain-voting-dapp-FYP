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
  fetchVerificationRequests,
  setPublicCampaignForDisplay,
  checkAndAutoSelectUrgentCampaign,
  fetchPublicCampaign, // Add this import
} from "../../store/thunks/adminThunks";

import {
  selectCreatingCampaign,
  selectDeletingCampaign,
  selectAdminDashboard,
  selectAdminLoading,
  selectAdminError,
  selectProcessingVerification,
  selectClosingCampaign,
  selectCampaignList,
  selectSelectedCampaignId,
  selectPublicCampaignId,
  selectAutoSelectUrgent,
  selectPublicCampaign,
  selectFetchingVerificationRequests, // Add this
  setSelectedCampaign,
  setAutoSelectUrgent,
} from "../../store/slices/adminSlice";
import type {
  ChartDataPoint,
  LineChartDataPoint,
} from "../../types/adminDashboard";

const campaignSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    startDate: z
      .number()
      .min(Math.floor((Date.now() + 10 * 60 * 1000) / 1000), "Start time must be at least 10 minutes from now"),
    endDate: z.number(),
    campaignDetails: z.string().min(1, "Campaign rules are required"),
    campaignDocument: z.instanceof(File).optional(),
    feedback: z.string().optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End time must be after start time",
    path: ["endDate"],
  })
  .refine((data) => (data.endDate - data.startDate) >= 3600, {
    message: "Campaign must run for at least 1 hour",
    path: ["endDate"],
  });

type CampaignFormData = z.infer<typeof campaignSchema>;

export const useAdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { account, provider, signer } = useWallet();

  // Global state selectors
  const campaignList = useAppSelector(selectCampaignList);
  const campaigns = campaignList.map((c) => ({
    ...c,
    title: `Campaign ${c.id}`,
  }));
  const creatingCampaign = useAppSelector(selectCreatingCampaign);
  const deletingCampaign = useAppSelector(selectDeletingCampaign);
  const closingCampaign = useAppSelector(selectClosingCampaign);
  const fetchingVerificationRequests = useAppSelector(selectFetchingVerificationRequests);
  const { verificationRequests } = useAppSelector((state) => ({
    verificationRequests: state.admin.verificationRequests || [],
  }));
  const processingVerification = useAppSelector(selectProcessingVerification);
  const adminDashboard = useAppSelector(selectAdminDashboard);
  const adminLoading = useAppSelector(selectAdminLoading);
  const selectedCampaignId = useAppSelector(selectSelectedCampaignId);
  const publicCampaignId = useAppSelector(selectPublicCampaignId);
  const autoSelectUrgent = useAppSelector(selectAutoSelectUrgent);
  const publicCampaign = useAppSelector(selectPublicCampaign);
  useAppSelector(selectAdminError);

  // Local state
  const [activeTab, setActiveTab] = useState<"all" | "candidates" | "voters">(
    "all"
  );
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
      if (signer) {
        dispatch(fetchVerificationRequests({ signer }));
      }
    }
  }, [dispatch, provider, signer]);

  useEffect(() => {
        if (provider && account) {
          dispatch(fetchPublicCampaign({ provider }));
        }
      }, [dispatch, provider, account]);

  // Set default selected campaign - prefer public campaign, but allow independent selection
  useEffect(() => {
    if (campaigns.length > 0 && selectedCampaignId === 0) {
      // Default to public campaign if it exists, otherwise first campaign
      const defaultCampaignId = publicCampaignId !== 0 ? publicCampaignId : campaigns[0].id;
      dispatch(setSelectedCampaign(defaultCampaignId));
    }
  }, [campaigns, selectedCampaignId, publicCampaignId, dispatch]);

  // Fetch data for the selected campaign
  useEffect(() => {
    if (selectedCampaignId !== 0 && signer && provider) {
      dispatch(
        fetchAdminDashboardData({ campaignId: selectedCampaignId, signer })
      );
    }
  }, [selectedCampaignId, dispatch, signer, provider]);

  // Check for urgent campaigns periodically
  useEffect(() => {
    if (autoSelectUrgent) {
      const interval = setInterval(() => {
        dispatch(checkAndAutoSelectUrgentCampaign());
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [autoSelectUrgent, dispatch]);

  // Calculate dashboard stats
  const calculateDashboardStats = () => {
    const totalCampaigns = campaignList.length;
    const activeCampaigns = campaignList.filter((c) => c.status === 1).length;
    const completedCampaigns = campaignList.filter(
      (c) => c.status === 2
    ).length;
    const upcomingCampaigns = campaignList.filter((c) => c.status === 0).length;
    const totalParticipants =
      (adminDashboard?.participantStats.candidateCount ?? 0) +
      (adminDashboard?.participantStats.voterCount ?? 0);
    const totalVotes = adminDashboard?.voteStats.votedCount ?? 0;
    const pendingVerifications = verificationRequests.filter(
      (r) => r.status === 0
    ).length;
    const totalVoters = adminDashboard?.voteStats.totalVoters ?? 0;
    const votePercentage =
      totalVoters > 0 ? Math.round((totalVotes / totalVoters) * 100) : 0;

    return {
      totalCampaigns,
      activeCampaigns,
      completedCampaigns,
      upcomingCampaigns,
      totalParticipants,
      totalVotes,
      pendingVerifications,
      totalVoters,
      votePercentage,
    };
  };

  // Calculate participant chart data
  const calculateParticipantChartData = (): ChartDataPoint[] => {
    const candidates = adminDashboard?.candidates ?? [];
    const voters = adminDashboard?.voters ?? [];

    return [
      {
        name: "Candidates",
        value: candidates.length,
        color: "#8884d8",
        percentage: Math.round(
          (candidates.length / (candidates.length + voters.length || 1)) * 100
        ),
      },
      {
        name: "Voters",
        value: voters.length,
        color: "#82ca9d",
        percentage: Math.round(
          (voters.length / (candidates.length + voters.length || 1)) * 100
        ),
      },
    ];
  };

  // Calculate vote status chart data
  const calculateVoteStatusChartData = (): ChartDataPoint[] => {
    const votedCount = adminDashboard?.voteStats.votedCount ?? 0;
    const notVotedCount = adminDashboard?.voteStats.notVotedCount ?? 0;
    const totalVoters = votedCount + notVotedCount;

    return [
      {
        name: "Voted",
        value: votedCount,
        color: "#00C49F",
        percentage:
          totalVoters > 0 ? Math.round((votedCount / totalVoters) * 100) : 0,
      },
      {
        name: "Not Voted",
        value: notVotedCount,
        color: "#FF8042",
        percentage:
          totalVoters > 0 ? Math.round((notVotedCount / totalVoters) * 100) : 0,
      },
    ];
  };

  // Calculate line chart data for campaigns over time
  const calculateLineChartData = (): LineChartDataPoint[] => {
    const monthlyData: { [key: string]: LineChartDataPoint } = {};

    campaignList.forEach((campaign) => {
      const date = new Date((campaign.startDate ?? 0) * 1000);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          date: monthKey,
          campaigns: 0,
          participants: 0,
          votes: 0,
          active: 0,
          completed: 0,
        } as LineChartDataPoint;
      }

      const currentData = monthlyData[monthKey];
      currentData.campaigns++;

      // Add status-based counting
      if (campaign.status === 1) {
        currentData.active = (currentData.active || 0) + 1;
      } else if (campaign.status === 2) {
        currentData.completed = (currentData.completed || 0) + 1;
      }
    });

    // Add participant and vote data for each month
    Object.keys(monthlyData).forEach((monthKey) => {
      // For now, we'll use current dashboard data
      // In a real implementation, you'd want historical data
      if (adminDashboard) {
        monthlyData[monthKey].participants =
          adminDashboard.participantStats.candidateCount +
          adminDashboard.participantStats.voterCount;
        monthlyData[monthKey].votes = adminDashboard.voteStats.votedCount;
      }
    });

    return Object.values(monthlyData).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  };

  // Calculate candidate performance chart data
  const calculateCandidatePerformanceData = (): ChartDataPoint[] => {
    const candidates = adminDashboard?.candidates ?? [];
    const totalVotes = candidates.reduce(
      (sum, candidate) => sum + candidate.voteCount,
      0
    );

    return candidates.map((candidate, index) => ({
      name: candidate.name || `Candidate ${index + 1}`,
      value: candidate.voteCount,
      color: `hsl(${(index * 45) % 360}, 70%, 60%)`,
      percentage:
        totalVotes > 0
          ? Math.round((candidate.voteCount / totalVotes) * 100)
          : 0,
      address: candidate.address,
    }));
  };

  // Calculate campaign status distribution
  const calculateCampaignStatusData = (): ChartDataPoint[] => {
    const statusCounts = campaignList.reduce(
      (acc, campaign) => {
        switch (campaign.status) {
          case 0:
            acc.upcoming++;
            break;
          case 1:
            acc.active++;
            break;
          case 2:
            acc.completed++;
            break;
          default:
            acc.other++;
        }
        return acc;
      },
      { upcoming: 0, active: 0, completed: 0, other: 0 }
    );

    return [
      {
        name: "Upcoming",
        value: statusCounts.upcoming,
        color: "#FFA500",
        percentage: Math.round(
          (statusCounts.upcoming / campaignList.length) * 100
        ),
      },
      {
        name: "Active",
        value: statusCounts.active,
        color: "#00C49F",
        percentage: Math.round(
          (statusCounts.active / campaignList.length) * 100
        ),
      },
      {
        name: "Completed",
        value: statusCounts.completed,
        color: "#8884d8",
        percentage: Math.round(
          (statusCounts.completed / campaignList.length) * 100
        ),
      },
      {
        name: "Other",
        value: statusCounts.other,
        color: "#FF8042",
        percentage: Math.round(
          (statusCounts.other / campaignList.length) * 100
        ),
      },
    ].filter((item) => item.value > 0);
  };

  // Calculate verification requests chart data
  const calculateVerificationRequestsData = (): ChartDataPoint[] => {
    const requestCounts = verificationRequests.reduce(
      (acc, request) => {
        switch (request.status) {
          case 0:
            acc.pending++;
            break;
          case 1:
            acc.approved++;
            break;
          case 2:
            acc.rejected++;
            break;
          default:
            acc.other++;
        }
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0, other: 0 }
    );

    return [
      {
        name: "Pending",
        value: requestCounts.pending,
        color: "#FFA500",
        percentage: Math.round(
          (requestCounts.pending / verificationRequests.length) * 100
        ),
      },
      {
        name: "Approved",
        value: requestCounts.approved,
        color: "#00C49F",
        percentage: Math.round(
          (requestCounts.approved / verificationRequests.length) * 100
        ),
      },
      {
        name: "Rejected",
        value: requestCounts.rejected,
        color: "#FF8042",
        percentage: Math.round(
          (requestCounts.rejected / verificationRequests.length) * 100
        ),
      },
    ].filter((item) => item.value > 0);
  };

  // Enhanced campaign selection handler - only for viewing data
  // NOTE: This is completely independent of the public/live campaign setting
  const handleSelectCampaign = async (campaignId: number) => {
  // This only changes what data is displayed on dashboard
  dispatch(setSelectedCampaign(campaignId));
  };

  // Handle public campaign selection - only for live/public status
  // Update the handleSetPublicCampaign function (around line 420)
  const handleSetPublicCampaign = async (campaignId: number) => {
  if (!signer) {
  toast.error("Please connect your wallet to set public campaign");
  return;
  }
  
  try {
  // This changes which campaign is live/public
  await dispatch(setPublicCampaignForDisplay({ campaignId, signer })).unwrap();
  
  // Don't auto-select the campaign - let user choose independently
  
  toast.success("Campaign is now live on the public page");
  } catch (error) {
  console.error("Failed to set public campaign:", error);
  }
  };

  // Toggle auto-select urgent campaigns
  const handleToggleAutoSelect = (enabled: boolean) => {
    dispatch(setAutoSelectUrgent(enabled));
  };

  const handleUploadDocument: (
    content: string | File,
    startDate?: number,
    endDate?: number
  ) => Promise<string> = async (content, startDate, endDate) => {
    setIsUploading(true);
    try {
      let fileToUpload: File;
      
      if (typeof content === 'string') {
        // Handle rich text content
        if (!startDate || !endDate) {
          throw new Error("Start date and end date are required for text upload");
        }
        
        const startDateFormatted = new Date(startDate * 1000).toLocaleDateString();
        const endDateFormatted = new Date(endDate * 1000).toLocaleDateString();
        const contentWithPlaceholders = content
          .replace(PLACEHOLDERS.START_DATE, startDateFormatted)
          .replace(PLACEHOLDERS.END_DATE, endDateFormatted);
  
        const element = document.createElement("div");
        element.innerHTML = contentWithPlaceholders;
        const pdfBlob = await html2pdf()
          .from(element)
          .set({
            margin: 10,
            filename: "campaign_rules.pdf",
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          })
          .output("blob");
  
        fileToUpload = new File([pdfBlob], "campaign_rules.pdf", {
          type: "application/pdf",
        });
      } else {
        // Handle file upload directly
        fileToUpload = content;
      }
  
      const ipfsHash = await uploadFile(fileToUpload);
  
      if (!ipfsHash) {
        throw new Error("IPFS upload returned empty hash");
      }
      
      console.log("Document uploaded successfully. IPFS Hash:", ipfsHash);
      toast.success("Document uploaded successfully");
      return ipfsHash;
    } catch (error) {
      console.error("Failed to upload document:", error);
      toast.error("Failed to upload document");
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Add this state near other local state declarations
  const [uploadedDocumentHash, setUploadedDocumentHash] = useState<string | null>(null);
  
  // Create a separate function for immediate document upload
  const handleImmediateDocumentUpload = async (file: File): Promise<string> => {
  setIsUploading(true);
  try {
    const ipfsHash = await uploadFile(file);
    
    if (!ipfsHash) {
      throw new Error("IPFS upload returned empty hash");
    }
    
    console.log("Document uploaded immediately. IPFS Hash:", ipfsHash);
    toast.success("Document uploaded successfully");
    setUploadedDocumentHash(ipfsHash);
    return ipfsHash;
  } catch (error) {
    console.error("Failed to upload document:", error);
    toast.error("Failed to upload document");
    throw error;
  } finally {
    setIsUploading(false);
  }
  };
  
  // Update handleCreateCampaign to use the pre-uploaded hash
  const handleCreateCampaign = async (values: CampaignFormData) => {
  if (!signer || !account || !provider)
    return toast.error("Please connect your wallet.");
  
  let campaignDetailsIpfsHash = "";
  
  // Only use the pre-uploaded document hash - remove fallback upload
  if (uploadedDocumentHash) {
    campaignDetailsIpfsHash = uploadedDocumentHash;
  } else {
    // If no document was uploaded, create campaign without document
    toast.error("Campaign requested without any document.");
    // You can choose to either:
    // 1. Prevent campaign creation: return;
    // 2. Or allow creation without document (current behavior)
  }
  
  // Remove this fallback upload code that causes issues:
  // else if (values.campaignDetails && values.campaignDetails.trim()) {
  //   campaignDetailsIpfsHash = await handleUploadDocument(
  //     values.campaignDetails,
  //     values.startDate,
  //     values.endDate
  //   );
  //   if (!campaignDetailsIpfsHash) return;
  // }
  
  const campaignData = {
    title: values.title,
    description: values.description,
    startDate: values.startDate,
    endDate: values.endDate,
    detailsIpfsHash: campaignDetailsIpfsHash,
    signer,
  };
  
  console.log("Campaign data being sent:", campaignData);
  console.log("IPFS Hash:", campaignDetailsIpfsHash);
  await dispatch(adminCreateCampaign(campaignData)).unwrap();
  toast.success("Campaign created successfully");
  campaignForm.reset();
  setShowCreateModal(false);
  setUploadedDocumentHash(null); // Reset the uploaded hash
  dispatch(fetchAllCampaignIds({ provider }));
  };
  
  const handleDeleteCampaign = async (campaignId: number) => {
    if (!signer || !account || !provider)
      return toast.error("Please connect your wallet.");

    await dispatch(adminDeleteCampaign({ campaignId, signer })).unwrap();
    toast.success("Campaign deleted successfully");
    if (selectedCampaignId === campaignId) {
      const remainingCampaigns = campaigns.filter((c) => c.id !== campaignId);
      if (remainingCampaigns.length > 0) {
        dispatch(setSelectedCampaign(remainingCampaigns[0].id));
      } else {
        dispatch(setSelectedCampaign(0));
      }
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
      await dispatch(
        adminProcessVerification({ userAddress, approved, feedback, signer })
      ).unwrap();
      toast.success("Verification processed successfully");
      
      // Only refresh verification requests - remove other API calls to prevent infinite loops
      dispatch(fetchVerificationRequests({ signer }));
      
      // Remove these lines that cause infinite API calls:
      // dispatch(fetchAdminDashboardData({ 
      //   campaignId: selectedCampaignId, 
      //   signer,
      //   forceRefresh: true
      // }));
      // 
      // if (provider) {
      //   dispatch(fetchAllCampaignIds({ provider }));
      // }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(`Verification failed: ${message}`);
      console.error("Verification processing failed:", error);
    }
  };

  // Data derivation for charts and stats
  const selectedCampaignData = adminDashboard?.currentCampaign;
  const candidates = adminDashboard?.candidates ?? [];
  const voters = adminDashboard?.voters ?? [];

  // Calculate all chart data
  const dashboardStats = calculateDashboardStats();
  const participantChartData = calculateParticipantChartData();
  const voteStatusChartData = calculateVoteStatusChartData();
  const lineChartData = calculateLineChartData();
  const candidatePerformanceData = calculateCandidatePerformanceData();
  const campaignStatusData = calculateCampaignStatusData();
  const verificationRequestsData = calculateVerificationRequestsData();

  const campaignStats = campaigns.map((c) => ({
    ...c,
    title: `Campaign ${c.id}`,
  }));

  return {
    // State & Data
    campaigns: campaignStats,
    selectedCampaign: selectedCampaignId,
    publicCampaignId,
    autoSelectUrgent,
    publicCampaign,
    selectedCampaignData,
    verificationRequests,
    adminDashboard,
    candidates,
    voters,
    activeTab,
    showCreateModal,
    showDeleteModal,
    campaignToDelete,
    campaignForm,
    adminLoading,
    isUploading,
    creatingCampaign,
    deletingCampaign,
    closingCampaign,
    processingVerification,
    handleUploadDocument,
    handleImmediateDocumentUpload, // Add this line
    uploadedDocumentHash, // Add this line
    fetchingVerificationRequests, // Add this to return

    // Dashboard Stats & Chart Data
    dashboardStats,
    participantChartData,
    voteStatusChartData,
    lineChartData,
    candidatePerformanceData,
    campaignStatusData,
    verificationRequestsData,

    // Handlers & Actions
    handleSelectCampaign,
    handleSetPublicCampaign,
    handleToggleAutoSelect,
    handleCreateCampaign,
    handleDeleteCampaign,
    handleCloseCampaign,
    handleProcessVerification,
    setActiveTab,
    openCreateModal: () => setShowCreateModal(true),
    closeCreateModal: () => setShowCreateModal(false),
    openDeleteModal: (id: number) => {
      setCampaignToDelete(id);
      setShowDeleteModal(true);
    },
    closeDeleteModal: () => setShowDeleteModal(false),
  };
};
