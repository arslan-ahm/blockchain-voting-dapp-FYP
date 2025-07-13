import { useNavigate } from "react-router-dom";
import { Loader2, Wallet, MoreVertical, Eye, X, Trash2, Newspaper } from "lucide-react";
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
import { ScrollArea } from "../../components/ui/scroll-area";
import { FloatingMenu } from "../../components/FloatingMenu";
import type { Campaign } from "../../types";
import GradientText from "../../components/GradientText";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  
  const {
    campaigns,
    selectedCampaign,
    adminLoading,
    isLoadingCampaignData,
    handleSelectCampaign,
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
    handleUploadDocument
  } = useAdminDashboard();

  // Handle navigation to campaign details
  const handleViewCampaign = (campaignId: number) => {
    navigate(`/campaigns/${campaignId}`);
  };

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

  if (adminLoading && !campaigns.length) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currentCampaign = adminDashboard?.currentCampaign as unknown as Campaign;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <AddCampaignDialog
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        form={campaignForm}
        onSubmit={handleCreateCampaign}
        isCreating={creatingCampaign}
        isUploading={isUploading}
        onUpload={handleUploadDocument}
      />
      <DeleteCampaignDialog
        isOpen={showDeleteModal}
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
                  variant="outline"
                  onClick={() => handleViewCampaign(currentCampaign.id || 0)}
                  className="text-sm px-4 py-2 btn-blue"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
                
                {currentCampaign.status === "Upcoming" && (
                  <Button
                    variant="outline"
                    onClick={() => handleCloseCampaign(currentCampaign.id || 0)}
                    disabled={closingCampaign}
                    className="border-amber-600 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-sm px-4 py-2"
                  >
                    {closingCampaign ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Closing...
                      </>
                    ) : (
                      <>
                        <X className="mr-2 h-4 w-4" />
                        Close Campaign
                      </>
                    )}
                  </Button>
                )}
                
                <Button
                  variant="destructive"
                  onClick={() => openDeleteModal(currentCampaign.id || 0)}
                  disabled={deletingCampaign}
                  className="text-sm px-4 py-2 btn-red"
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
                    variant="outline"
                    onClick={() => handleViewCampaign(currentCampaign.id || 0)}
                    size="sm"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={() => openDeleteModal(currentCampaign.id || 0)}
                    disabled={deletingCampaign}
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  {currentCampaign.status === "Upcoming" && (
                    <Button
                      variant="outline"
                      onClick={() => handleCloseCampaign(currentCampaign.id || 0)}
                      disabled={closingCampaign}
                      className="border-amber-600 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
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
                        onClick={() => handleActionClick(() => handleViewCampaign(currentCampaign.id || 0))}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </button>
                      
                      {currentCampaign.status === "Upcoming" && (
                        <button
                          onClick={() => handleActionClick(() => handleCloseCampaign(currentCampaign.id || 0))}
                          disabled={closingCampaign}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-amber-600 disabled:opacity-50"
                        >
                          {closingCampaign ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Closing...
                            </>
                          ) : (
                            <>
                              <X className="mr-2 h-4 w-4" />
                              Close Campaign
                            </>
                          )}
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleActionClick(() => openDeleteModal(currentCampaign.id || 0))}
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
                        {campaigns?.length > 0 ? (
                          campaigns?.map((campaign) => (
                            <SelectItem
                              key={campaign?.id}
                              value={campaign?.id.toString()}
                              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="truncate">
                                  {campaign?.title}
                                </span>
                                {campaign?.status && (
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
                campaign={currentCampaign}
              />

              <CampaignCharts
                campaign={currentCampaign}
                adminDashboard={adminDashboard}
              />

              <VerificationRequests
                requests={adminDashboard.verificationRequests}
                onProcessVerification={handleProcessVerification}
                isProcessing={processingVerification}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              {isLoadingCampaignData ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <p className="text-muted-foreground text-center px-4">
                  Select a campaign to view its details.
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <EmptyState
            icon={Newspaper}
            title="No Campaigns Found"
            description="Create your first campaign to get started."
          />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;