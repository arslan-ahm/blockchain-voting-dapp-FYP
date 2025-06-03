import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import type { Campaign } from '../../../types';

interface DeleteCampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (adminAddress: string) => void;
  campaign: Campaign | null;
}

export const DeleteCampaignDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  campaign 
}: DeleteCampaignDialogProps) => {
  const [adminAddress, setAdminAddress] = useState("");
  
  if (!campaign) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-400">Delete Campaign</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">
              This action cannot be undone. This will permanently delete the campaign.
            </p>
          </div>
          <div>
            <Label htmlFor="adminAddress" className="text-gray-300">Admin Address for Confirmation</Label>
            <Input
              id="adminAddress"
              value={adminAddress}
              onChange={(e) => setAdminAddress(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter your admin address"
            />
          </div>
          <div className="p-3 bg-gray-700 rounded-lg">
            <p className="text-gray-300 text-sm font-medium">Campaign Details:</p>
            <p className="text-gray-400 text-xs mt-1">Campaign-{campaign.id}</p>
            <p className="text-gray-400 text-xs">Start Date: {new Date(Number(campaign.startDate) * 1000).toLocaleDateString()}</p>
            <p className="text-gray-400 text-xs">End Date: {new Date(Number(campaign.endDate) * 1000).toLocaleDateString()}</p>
            <p className="text-gray-400 text-xs">Status: {campaign.isOpen ? 'Active' : 'Closed'}</p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={() => onConfirm(adminAddress)}
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={!adminAddress.trim()}
            >
              Confirm Delete
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 