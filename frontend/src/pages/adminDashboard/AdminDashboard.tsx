import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Plus, Trash2, Loader2, Wallet } from 'lucide-react';
import { useAdminDashboard } from './useAdminDashboard';
import { CampaignStats } from '../../components/admin/CampaignStats';
import { CampaignCharts } from '../../components/admin/CampaignCharts';
import { VerificationRequests } from '../../components/admin/VerificationRequests';
import { DeleteCampaignDialog } from '../../components/admin/dialogs/DeleteCampaignDialog';
import { AddCampaignDialog } from '../../components/admin/dialogs/AddCampaignDialog';
import { EmptyState } from '../../components/admin/EmptyState';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import type { Campaign } from '../../types';

const AdminDashboardContent = () => {
  const {
    campaigns,
    verificationRequests,
    campaignForm,
    isLoading,
    creatingCampaign,
    deletingCampaign: isDeletingCampaign,
    onCreateCampaign,
    handleDeleteCampaign,
    handleCloseCampaign,
    handleProcessVerification,
    isConnected,
    address,
  } = useAdminDashboard();

  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);

  // Current active campaign for display
  const currentCampaign = campaigns.find(c => c.isOpen) || campaigns[0];

  const confirmDeleteCampaign = async (adminAddress: string) => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    if (campaignToDelete) {
      await handleDeleteCampaign(campaignToDelete.id, adminAddress);
      setShowDeleteDialog(false);
      setCampaignToDelete(null);
    }
  };

  const handleAddCampaign = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    const values = campaignForm.getValues();
    if (!values.campaignDocument && !values.campaignDetails.trim()) {
      alert("Contract is required");
      return;
    }

    try {
      await onCreateCampaign(values);
      setShowAddCampaign(false);
    } catch (error) {
      console.error("Failed to create campaign:", error);
      alert(error instanceof Error ? error.message : "Failed to create campaign");
    }
  };

  const handleCloseCurrentCampaign = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    if (currentCampaign) {
      await handleCloseCampaign(currentCampaign.id);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <EmptyState
            icon={Wallet}
            title="Wallet Not Connected"
            description="Please connect your wallet to access the admin dashboard."
            className="mt-12"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-gray-400 mt-1">Welcome, Admin</p>
              <p className="text-sm text-gray-500">{address}</p>
              {isLoading && (
                <div className="flex items-center gap-2 text-blue-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowAddCampaign(true)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                disabled={creatingCampaign}
              >
                {creatingCampaign ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {creatingCampaign ? 'Creating...' : 'Add Campaign'}
              </Button>
              {currentCampaign && (
                <>
                  <Button 
                    onClick={() => {
                      setCampaignToDelete(currentCampaign);
                      setShowDeleteDialog(true);
                    }}
                    className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
                    disabled={isDeletingCampaign}
                  >
                    {isDeletingCampaign ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    {isDeletingCampaign ? 'Deleting...' : 'Delete Campaign'}
                  </Button>
                  {currentCampaign.isOpen && (
                    <Button 
                      onClick={handleCloseCurrentCampaign}
                      className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-2"
                    >
                      Close Campaign
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        <CampaignStats campaign={isLoading ? null : currentCampaign} />
        <CampaignCharts campaign={isLoading ? null : currentCampaign} />
        <VerificationRequests 
          requests={isLoading ? [] : verificationRequests}
          onProcessVerification={handleProcessVerification}
        />
      </div>

      {/* Dialogs */}
      <DeleteCampaignDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDeleteCampaign}
        campaign={campaignToDelete}
      />

      <AddCampaignDialog
        isOpen={showAddCampaign}
        onClose={() => setShowAddCampaign(false)}
        onConfirm={handleAddCampaign}
        form={campaignForm}
        isCreating={creatingCampaign}
      />
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <ErrorBoundary>
      <AdminDashboardContent />
    </ErrorBoundary>
  );
};

export default AdminDashboard;