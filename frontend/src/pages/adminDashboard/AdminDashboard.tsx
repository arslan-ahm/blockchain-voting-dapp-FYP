import { useNavigate } from "react-router-dom";
import { Loader2, Wallet } from "lucide-react";

// Hooks
import { useWallet } from "../../hooks/useWallet";
import { useAdminDashboard } from "./useAdminDashboard";

// Components
import { CampaignStats } from "../../components/admin/CampaignStats";
import { VerificationRequests } from "../../components/admin/VerificationRequests";
import { CampaignCharts } from "../../components/admin/CampaignCharts";
import { AddCampaignDialog } from "../../components/admin/dialogs/AddCampaignDialog";
import { DeleteCampaignDialog } from "../../components/admin/dialogs/DeleteCampaignDialog";
import { EmptyState } from "../../components/admin/EmptyState";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { ScrollArea } from "../../components/ui/scroll-area";
import type { Campaign } from "../../types";
import GradientText from "../../components/GradientText";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    campaigns,
    selectedCampaign,
    adminLoading,
    isLoadingCampaignData,
    handleSelectCampaign,
    // dashboardStats,
    // participantChartData,
    // voteStatusChartData,
    // lineChartData,
    showCreateModal,
    openCreateModal,
    closeCreateModal,
    campaignForm,
    handleCreateCampaign,
    creatingCampaign,
    isUploading,
    showDeleteModal,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteCampaign,
    deletingCampaign,
    campaignToDelete,
    handleCloseCampaign,
    closingCampaign,
    adminDashboard,
    handleProcessVerification,
    processingVerification,
    // verificationLoading,
  } = useAdminDashboard();

  // Handle navigation to campaign details
  const handleViewCampaign = (campaignId: number) => {
    navigate(`/campaigns/${campaignId}`);
  };

  const { account } = useWallet();

  if (!account) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-[80vh]">
        <EmptyState
          icon={Wallet}
          title="Wallet Not Connected"
          description="Please connect your wallet to access the admin dashboard."
        />
      </div>
    );
  }

  if (adminLoading && !campaigns.length) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <AddCampaignDialog
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        form={campaignForm}
        onSubmit={handleCreateCampaign}
        isCreating={creatingCampaign || isUploading}
      />
      <DeleteCampaignDialog
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeleteCampaign(campaignToDelete!)}
        campaign={
          (adminDashboard?.currentCampaign as unknown as Campaign) || null
        }
        isLoading={deletingCampaign}
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <GradientText text="Admin Dashboard" className="text-3xl font-bold tracking-tight" />
          <p className="text-sm text-white">Welcome, {account.slice(0, 6) + "..." + account.slice(-4)}</p>
        </div>
        <Button
          onClick={openCreateModal}
          disabled={creatingCampaign}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 text-lg px-8 py-6 transition-all duration-300 hover:scale-105"
        >
          {creatingCampaign ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Campaign"
          )}
        </Button>
      </div>

      {campaigns.length > 0 ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <Select
                    value={selectedCampaign?.toString() || ""}
                    onValueChange={(value) =>
                      handleSelectCampaign(Number(value))
                    }
                    disabled={isLoadingCampaignData}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-60">
                        {campaigns.length > 0 ? (
                          campaigns.map((campaign) => (
                            <SelectItem
                              key={campaign.id}
                              value={campaign.id.toString()}
                              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="truncate">
                                  {campaign.title}
                                </span>
                                {campaign.status && (
                                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    Active
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No campaigns found
                          </div>
                        )}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>
                {isLoadingCampaignData && (
                  <div className="flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {adminDashboard?.currentCampaign ? (
            <div className="space-y-6">
              <CampaignStats
                campaign={
                  adminDashboard?.currentCampaign as unknown as Campaign
                }
              />

              <CampaignCharts
                campaign={
                  adminDashboard?.currentCampaign as unknown as Campaign
                }
              />

              <VerificationRequests
                requests={adminDashboard.verificationRequests}
                // isLoading={verificationLoading}
                onProcessVerification={handleProcessVerification}
                isProcessing={processingVerification}
              />

              <Card>
                <CardContent className="pt-6 flex flex-wrap gap-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleViewCampaign(
                          adminDashboard?.currentCampaign?.id || 0
                        )
                      }
                    >
                      View Details
                    </Button>
                    {adminDashboard?.currentCampaign?.status === "Upcoming" && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleCloseCampaign(
                            adminDashboard?.currentCampaign?.id || 0
                          )
                        }
                        disabled={closingCampaign}
                        className="border-amber-600 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      >
                        {closingCampaign ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Closing...
                          </>
                        ) : (
                          "Close Campaign"
                        )}
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      openDeleteModal(adminDashboard?.currentCampaign?.id || 0)
                    }
                    disabled={deletingCampaign}
                  >
                    {deletingCampaign ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Campaign"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              {isLoadingCampaignData ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <p className="text-muted-foreground">
                  Select a campaign to view its details.
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <EmptyState
            icon={Loader2}
            title="No Campaigns Found"
            description="Create your first campaign to get started."
          />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
