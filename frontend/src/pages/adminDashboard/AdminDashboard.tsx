import {
  Loader2,
  Wallet,
  MoreVertical,
  Eye,
  Trash2,
  Newspaper,
} from "lucide-react";
import { useRef, useState } from "react";

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
import { FloatingMenu } from "../../components/FloatingMenu";
import type { Campaign } from "../../types";
import GradientText from "../../components/GradientText";
import { cn } from "../../utils/cn";
import {
  getCampaignStatusBadgeColor,
  mapCampaignStatus,
} from "../../utils/helpers";

const AdminDashboard = () => {
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);

  const {
    campaigns,
    selectedCampaign,
    publicCampaignId,
    autoSelectUrgent,
    adminLoading,
    fetchingVerificationRequests, // Add this
    handleSelectCampaign,
    handleSetPublicCampaign,
    handleToggleAutoSelect,
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
    adminDashboard,
    handleProcessVerification,
    processingVerification,
    handleUploadDocument,
    handleImmediateDocumentUpload,
  } = useAdminDashboard();

  const { account } = useWallet();

  const handleCloseFloatingMenu = () => {
    setShowFloatingMenu(false);
  };

  const handleActionClick = (action: () => void) => {
    action();
    setShowFloatingMenu(false);
  };

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

  // Enhanced loading state - show loader when initially loading campaigns
  if (adminLoading && campaigns.length === 0) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-[80vh]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
            <Loader2 className="relative h-12 w-12 animate-spin text-blue-400 mx-auto" />
          </div>
          <div className="space-y-2">
            <GradientText
              text="Loading Admin Dashboard"
              className="text-lg font-medium"
            />
            <p className="text-sm text-gray-400">
              Fetching campaigns and dashboard data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentCampaign =
    adminDashboard?.currentCampaign as unknown as Campaign;

     console.log('=>', campaigns)
     
  return (
    <div className="w-full min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full sm:max-w-full md:max-w-6xl lg:max-w-7xl xl:max-w-7xl">
        <div className="space-y-6">
      <AddCampaignDialog
        isOpen={!!showCreateModal}
        onClose={closeCreateModal}
        form={campaignForm}
        onSubmit={handleCreateCampaign}
        isCreating={creatingCampaign}
        isUploading={isUploading}
        onImmediateUpload={handleImmediateDocumentUpload}
        onUpload={handleUploadDocument}
      />
      <DeleteCampaignDialog
        isOpen={!!showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeleteCampaign(campaignToDelete!)}
        campaign={currentCampaign || null}
        isLoading={deletingCampaign}
      />

      {/* Header with all action buttons */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <GradientText
              text="Admin Dashboard"
              className="text-2xl sm:text-3xl font-bold tracking-tight"
            />
            <p className="text-sm text-white">
              Welcome, {account.slice(0, 6) + "..." + account.slice(-4)}
            </p>
          </div>

          {/* Desktop buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              onClick={openCreateModal}
              disabled={creatingCampaign}
              className="bg-primary text-base px-6 py-2 transition-all duration-300 hover:scale-105"
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

            {currentCampaign && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => openDeleteModal(currentCampaign.id || 0)}
                  disabled={deletingCampaign}
                  className="text-sm text-red-600 hover:bg-red-500/20 border border-red-600 px-4 py-2"
                >
                  {deletingCampaign ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              </>
            )}
          </div>

          {/* Mobile/Tablet buttons */}
          <div className="flex lg:hidden items-center gap-3">
            <Button
              onClick={openCreateModal}
              disabled={creatingCampaign}
              className="bg-primary text-sm px-4 py-2 transition-all duration-300 hover:scale-105"
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

            {currentCampaign && (
              <>
                {/* Tablet view - show essential buttons */}
                <div className="hidden md:flex lg:hidden items-center gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => openDeleteModal(currentCampaign.id || 0)}
                    disabled={deletingCampaign}
                    className="text-red-600 border border-red-600 hover:bg-red-500/20"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Mobile view - floating menu */}
                <div className="md:hidden">
                  <Button
                    ref={menuButtonRef}
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFloatingMenu(!showFloatingMenu)}
                    className="p-2"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>

                  <FloatingMenu
                    anchorRef={menuButtonRef}
                    isOpen={showFloatingMenu}
                    onClose={handleCloseFloatingMenu}
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[180px]">
                    <button
                        onClick={() =>
                          handleActionClick(() =>
                            openDeleteModal(currentCampaign.id || 0)
                          )
                        }
                        disabled={deletingCampaign}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-red-600 disabled:opacity-50"
                      >
                        {deletingCampaign ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Campaign
                          </>
                        )}
                      </button>
                    </div>
                  </FloatingMenu>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {campaigns && campaigns.length > 0 ? (
        <div className="space-y-6">
          {/* Unified Campaign Manager Card */}
          <Card className="border border-gray-700 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-md shadow-xl hover:shadow-neon-blue transition-all duration-300">
            <CardContent className="p-6 lg:p-8">
              <div className="space-y-6">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-700/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <Newspaper className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl lg:text-2xl font-bold gradient-text">
                        Campaign Manager
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Select campaigns to manage dashboard and public display
                      </p>
                    </div>
                  </div>

                  {/* Campaign Count & Auto-select */}
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-gray-700/50 to-gray-600/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-600/50">
                      <div className="text-xs text-gray-400">
                        Total Campaigns
                      </div>
                      <div className="text-lg font-bold text-white">
                        {campaigns?.length || 0}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto-select"
                      checked={autoSelectUrgent}
                      onChange={(e) => handleToggleAutoSelect(e.target.checked)}
                      className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="auto-select"
                      className="text-sm text-gray-300"
                    >
                      Auto
                    </label>
                  </div>
                </div>

                {/* Campaign Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                    <label className="text-sm font-medium text-gray-300">
                      Select Campaign
                      {adminLoading && (
                        <span className="ml-2 text-xs text-blue-400">
                          (loading...)
                        </span>
                      )}
                    </label>
                  </div>

                  <Select
                    value={selectedCampaign?.toString() || ""}
                    onValueChange={(value) =>
                      handleSelectCampaign(Number(value))
                    }
                    disabled={adminLoading}
                  >
                    <SelectTrigger className="w-full h-12 border border-gray-700 hover:border-gray-400 focus:border-blue-500 transition-colors text-gray-300">
                      <SelectValue 
                        placeholder={adminLoading ? "Loading campaigns..." : "Choose a campaign"} 
                      />
                    </SelectTrigger>

                    <SelectContent className="border border-gray-700 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-md shadow-lg max-h-80 overflow-auto text-gray-300 bg-gray-900">
                      {campaigns && campaigns?.length > 0 ? (
                        campaigns.map((campaign) => {
                          const isCurrentlyPublic =
                            publicCampaignId === campaign?.id;

                          // Simple status text
                          let statusText = "Unknown";
                          switch (campaign?.status) {
                            case 0:
                              statusText = "Upcoming";
                              break;
                            case 1:
                              statusText = "Active";
                              break;
                            case 2:
                              statusText = "Completed";
                              break;
                            case 3:
                              statusText = "Deleted";
                              break;
                          }

                          return (
                            // Update the Select component section (around line 350)
                            <SelectItem
                              key={campaign?.id}
                              value={campaign?.id.toString()}
                              className={cn(
                                "cursor-pointer py-3 px-4",
                                isCurrentlyPublic && "bg-primary/10 border-l-4 border-l-primary"
                              )}
                            >
                              <div className="flex items-center justify-between gap-1 w-full min-w-0">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <span className="font-medium truncate">
                                    <span className="text-sm text-gray-500 flex-shrink-0">
                                      #{campaign?.id}
                                    </span>
                                  </span>
                                </div>
                            
                                <div className="flex items-center pl-1 truncate flex-1">
                                  {campaign?.title}
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                  {isCurrentlyPublic && (
                                    <span className="text-xs bg-primary px-2 py-1 rounded">
                                      LIVE
                                    </span>
                                  )}
                                  <span
                                    className={cn(
                                      `text-xs px-2 py-1 rounded whitespace-nowrap`,
                                      getCampaignStatusBadgeColor(
                                        mapCampaignStatus(statusText.toLocaleLowerCase())
                                      )
                                    )}
                                  >
                                    {statusText}
                                  </span>
                                  {campaign?.startDate && (
                                    <span className="text-xs text-gray-500 hidden lg:inline whitespace-nowrap">
                                      {new Date(
                                        campaign.startDate * 1000
                                      ).toLocaleString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                      })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center text-gray-500">
                          <p className="font-medium">No campaigns available</p>
                          <p className="text-sm mt-1">
                            Create your first campaign to get started
                          </p>
                        </div>
                      )}
                    </SelectContent>
                  </Select>

                  {/* Set Public Campaign Button */}
                  {selectedCampaign &&
                    publicCampaignId !== selectedCampaign && (
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Eye className="h-5 w-5 text-purple-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-200">
                              Make this campaign public
                            </p>
                            <p className="text-xs text-gray-400">
                              This will display the selected campaign on the
                              public campaign page
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() =>
                            handleSetPublicCampaign(selectedCampaign)
                          }
                          size="sm"
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                        >
                          Set as Public
                        </Button>
                      </div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>

          {adminDashboard?.currentCampaign ? (
            <div className="space-y-6">
              {/* Show loading overlay when refreshing campaign data */}
              {adminLoading && (
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-200">
                        Refreshing Campaign Data
                      </p>
                      <p className="text-xs text-gray-400">
                        Please wait while we update the latest information...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <CampaignStats campaign={currentCampaign} />

              <CampaignCharts
                campaign={currentCampaign}
                adminDashboard={adminDashboard}
              />

              {/* Verification Requests with loading state */}
              <div className="relative">
                {fetchingVerificationRequests && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                      <span className="text-xs text-blue-400">Loading requests...</span>
                    </div>
                  </div>
                )}
                <VerificationRequests
                  requests={adminDashboard.verificationRequests}
                  onProcessVerification={handleProcessVerification}
                  isProcessing={processingVerification}
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center min-h-[40vh]">
              {adminLoading ? (
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                    <Loader2 className="relative h-12 w-12 animate-spin text-blue-400 mx-auto" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium gradient-text">
                      Loading Campaign Data
                    </p>
                    <p className="text-sm text-gray-400">
                      Please wait while we fetch the campaign details...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6 p-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-2xl"></div>
                    <div className="relative bg-gradient-to-br from-gray-900/30 to-gray-800/30 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50">
                      <div className="text-4xl mb-4">🎯</div>
                      <GradientText
                        text="Ready to Manage"
                        className="text-xl font-semibold mb-2"
                      />
                      <p className="text-gray-400 max-w-sm mx-auto">
                        Select a campaign from the dropdown above to view
                        detailed analytics, manage participants, and process
                        verification requests.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center space-y-6 p-8">
            <div className="relative">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-md p-8 rounded-2xl border border-gray-700 shadow-2xl">
                <div className="text-6xl mb-4 animate-pulse-neon">📊</div>
                <GradientText
                  text="No Campaigns Found"
                  className="text-2xl font-bold mb-2"
                />
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Welcome to your admin dashboard! Start by creating your first
                  campaign to manage voting processes and engage with your
                  community.
                </p>
                <Button
                  onClick={openCreateModal}
                  disabled={creatingCampaign}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-neon-blue"
                >
                  {creatingCampaign ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Campaign...
                    </>
                  ) : (
                    <>
                      <Newspaper className="mr-2 h-5 w-5" />
                      Create Your First Campaign
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
