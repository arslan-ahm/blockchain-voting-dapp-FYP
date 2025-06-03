import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { ChevronDown, Upload, AlertCircle } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { UploadFloatingMenu } from './UploadFloatingMenu';

interface CampaignFormData {
  title: string;
  startDate: number;
  endDate: number;
  description: string;
  campaignDetails: string;
  campaignDocument?: File;
}

interface AddCampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  form: UseFormReturn<CampaignFormData>;
  isCreating: boolean;
}

export const AddCampaignDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  form,
  isCreating 
}: AddCampaignDialogProps) => {
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [dateError, setDateError] = useState<string>("");

  const handleUploadContract = (file: File) => {
    form.setValue('campaignDocument', file);
  };

  // Calculate minimum dates
  const now = new Date();
  const minStartDate = new Date(now.getTime() + (10 * 60 * 1000)); // 10 minutes from now
  const minEndDate = form.watch('startDate') 
    ? new Date(form.watch('startDate') * 1000 + (24 * 60 * 60 * 1000)) // 24 hours after start date
    : new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 24 hours from now

  // Format date for input
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Validate dates when they change
  useEffect(() => {
    const startDate = form.watch('startDate');
    const endDate = form.watch('endDate');

    if (startDate && endDate) {
      const startDateTime = new Date(startDate * 1000);
      const endDateTime = new Date(endDate * 1000);
      const now = new Date();

      if (startDateTime <= now) {
        setDateError("Start date must be in the future");
      } else if (endDateTime <= startDateTime) {
        setDateError("End date must be after start date");
      } else if ((endDateTime.getTime() - startDateTime.getTime()) < (24 * 60 * 60 * 1000)) {
        setDateError("Campaign must run for at least 24 hours");
      } else {
        setDateError("");
      }
    }
  }, [form.watch('startDate'), form.watch('endDate')]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Add New Campaign</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              {...form.register('title', { required: "Title is required" })}
              className="bg-gray-700 border-gray-600"
              placeholder="Enter campaign title"
            />
            {form.formState.errors.title && (
              <p className="text-red-400 text-sm mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>
          <div>
            <Label>Start Date</Label>
            <Input
              type="datetime-local"
              min={formatDateForInput(minStartDate)}
              {...form.register('startDate', {
                required: "Start date is required",
                setValueAs: (v: string) => Math.floor(new Date(v).getTime() / 1000)
              })}
              className="bg-gray-700 border-gray-600"
            />
          </div>
          <div>
            <Label>End Date</Label>
            <Input
              type="datetime-local"
              min={formatDateForInput(minEndDate)}
              {...form.register('endDate', {
                required: "End date is required",
                setValueAs: (v: string) => Math.floor(new Date(v).getTime() / 1000)
              })}
              className="bg-gray-700 border-gray-600"
            />
          </div>
          {dateError && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {dateError}
            </div>
          )}
          <div>
            <Label>Description</Label>
            <Input
              {...form.register('description', { required: "Description is required" })}
              className="bg-gray-700 border-gray-600"
              placeholder="Brief campaign description"
            />
          </div>
          <div>
            <Label>Campaign Rules</Label>
            <textarea
              {...form.register('campaignDetails', { required: "Campaign rules are required" })}
              className="w-full h-32 p-3 bg-gray-700 border border-gray-600 text-white rounded-md resize-none"
              placeholder="Enter detailed campaign rules and guidelines"
            />
          </div>
          <div className="relative">
            <Label>Contract Document</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 justify-between"
              onClick={() => setShowUploadMenu(!showUploadMenu)}
            >
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                {form.watch('campaignDocument')?.name || "Upload Document"}
              </span>
              <ChevronDown className="w-4 h-4" />
            </Button>
            <UploadFloatingMenu
              isOpen={showUploadMenu}
              onClose={() => setShowUploadMenu(false)}
              onUpload={handleUploadContract}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onConfirm}
              className="flex-1"
              disabled={isCreating || !!dateError}
            >
              {isCreating ? 'Creating...' : 'Create Campaign'}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 