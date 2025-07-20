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
    publicCampaignId,
    autoSelectUrgent,
    adminLoading,
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
                      <h3 className="text-xl lg:text-2xl font-bold gradient-text">Campaign Manager</h3>
                      <p className="text-sm text-gray-400 mt-1">Select campaigns to manage dashboard and public display</p>
                    </div>
                  </div>
                  
                  {/* Campaign Count & Auto-select */}
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-gray-700/50 to-gray-600/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-600/50">
                      <div className="text-xs text-gray-400">Total Campaigns</div>
                      <div className="text-lg font-bold text-white">{campaigns?.length || 0}</div>
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
                      <label htmlFor="auto-select" className="text-sm text-gray-300">
                        Auto-select urgent
                      </label>
                    </div>
                </div>

                {/* Campaign Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                    <label className="text-sm font-medium text-gray-300">Select Campaign</label>
                  </div>
                  
                  <Select
                    value={selectedCampaign?.toString() || ""}
                    onValueChange={(value) => handleSelectCampaign(Number(value))}
                  >
                    <SelectTrigger className="w-full h-16 border-2 border-gray-600 bg-gray-800/80 hover:border-blue-500 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm shadow-lg">
                      <div className="flex items-center gap-4 px-2">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse flex-shrink-0"></div>
                        <SelectValue 
                          placeholder="🎯 Choose a campaign to manage dashboard and analytics" 
                          className="text-gray-300"
                        />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="border-gray-600 bg-gray-800/95 backdrop-blur-md shadow-2xl min-w-[600px] max-w-[800px] p-2">
                      <ScrollArea className="h-96">
                        {campaigns?.length > 0 ? (
                          <div className="space-y-2">
                            {campaigns?.map((campaign) => {
                              const isCurrentlyPublic = publicCampaignId === campaign?.id;
                              const isSelected = selectedCampaign === campaign?.id;
                              
                              // Enhanced status determination
                              let statusConfig = {
                                text: "Unknown",
                                color: "bg-gray-500/20 text-gray-300 border-gray-500/50",
                                icon: "🔍",
                                bgColor: "from-gray-500/10 to-gray-600/10"
                              };
                              
                              switch (campaign?.status) {
                                case 0:
                                  statusConfig = {
                                    text: "Upcoming",
                                    color: "bg-blue-500/20 text-blue-300 border-blue-500/50",
                                    icon: "⏳",
                                    bgColor: "from-blue-500/10 to-blue-600/10"
                                  };
                                  break;
                                case 1:
                                  statusConfig = {
                                    text: "Active",
                                    color: "bg-green-500/20 text-green-300 border-green-500/50",
                                    icon: "🟢",
                                    bgColor: "from-green-500/10 to-green-600/10"
                                  };
                                  break;
                                case 2:
                                  statusConfig = {
                                    text: "Completed",
                                    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
                                    icon: "✅",
                                    bgColor: "from-yellow-500/10 to-yellow-600/10"
                                  };
                                  break;
                                case 3:
                                  statusConfig = {
                                    text: "Deleted",
                                    color: "bg-red-500/20 text-red-300 border-red-500/50",
                                    icon: "🗑️",
                                    bgColor: "from-red-500/10 to-red-600/10"
                                  };
                                  break;
                              }
                              
                              return (
                                <SelectItem
                                  key={campaign?.id}
                                  value={campaign?.id.toString()}
                                  className="cursor-pointer w-full flex items-center p-0 transition-all duration-200 focus:bg-transparent hover:bg-transparent border-0 data-[state=checked]:bg-transparent"
                                >
                                  <div className={`w-full bg-gradient-to-r ${statusConfig.bgColor} rounded-xl p-5 border transition-all duration-200 hover:shadow-lg m-1 relative flex flex-row-reverse justify-between items-center ${
                                    isSelected 
                                      ? 'border-blue-500/70 ring-2 ring-blue-500/30 shadow-md shadow-blue-500/20' 
                                      : 'border-gray-600/30 hover:border-gray-500/50'
                                  }`}>
                                    {/* Live Badge */}
                                    {isCurrentlyPublic && (
                                      <div className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/50 font-medium flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                                        LIVE
                                      </div>
                                    )}

                                    <div className="flex items-center gap-5 w-full">
                                      {/* Campaign Icon */}
                                      <div className="flex-shrink-0">
                                        <div className="w-6 h-6 rounded-md bg-gray-700/50 flex items-start justify-center ring-2 ring-gray-600/30">
                                          <span className="w-4 h-4">{statusConfig.icon}</span>
                                        </div>
                                      </div>
                                      
                                      {/* Campaign Info */}
                                      <div className="flex-1 flex items-center justify-between w-full min-w-0">
                                        <div className="flex items-center justify-between gap-4 mb-3">
                                          <h4 className="font-bold text-gray-200 text-lg truncate">
                                            {campaign?.title || `Campaign ${campaign?.id}`}
                                          </h4>
                                          <span className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-lg border ${statusConfig.color} font-medium`}>
                                            {statusConfig.text}
                                          </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 flex-wrap">
                                          <span className="inline-flex items-center bg-gray-700/70 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-mono">
                                            <span className="text-gray-400 mr-2">#</span>
                                            {campaign?.id}
                                          </span>
                                          
                                          {campaign?.startDate && (
                                            <span className="inline-flex items-center bg-gray-700/70 text-gray-300 px-3 py-1.5 rounded-lg text-xs">
                                              <span className="mr-2">📅</span>
                                              {new Date(campaign.startDate * 1000).toLocaleDateString('en-US', { 
                                                month: 'short', 
                                                day: 'numeric',
                                                year: 'numeric'
                                              })}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700/50 rounded-full mb-4">
                              <div className="text-3xl">📋</div>
                            </div>
                            <p className="text-gray-300 font-medium mb-1">No campaigns available</p>
                            <p className="text-xs text-gray-500">Create your first campaign to get started</p>
                          </div>
                        )}
                      </ScrollArea>
                    </SelectContent>
                  </Select>

                  {/* Set Public Campaign Button */}
                  {selectedCampaign && publicCampaignId !== selectedCampaign && (
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Eye className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-200">Make this campaign public</p>
                          <p className="text-xs text-gray-400">This will display the selected campaign on the public campaign page</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleSetPublicCampaign(selectedCampaign)}
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
            <div className="flex justify-center items-center min-h-[40vh]">
              {adminLoading ? (
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                    <Loader2 className="relative h-12 w-12 animate-spin text-blue-400 mx-auto" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium gradient-text">Loading Campaign Data</p>
                    <p className="text-sm text-gray-400">Please wait while we fetch the campaign details...</p>
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
                        Select a campaign from the dropdown above to view detailed analytics, manage participants, and process verification requests.
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
                  Welcome to your admin dashboard! Start by creating your first campaign to manage voting processes and engage with your community.
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
  );
};

export default AdminDashboard;