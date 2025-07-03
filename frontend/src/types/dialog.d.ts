import type { UseFormReturn } from "react-hook-form";

// AddCampaign Dialog
export interface CampaignFormData {
  title: string;
  startDate: number;
  endDate: number;
  description: string;
  campaignDetails: string;
  campaignDocument?: File;
}

export interface AddCampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CampaignFormData) => Promise<string | number | undefined>;
  form: UseFormReturn<CampaignFormData>;
  isCreating: boolean;
}

// DeleteCampaignDialog
export interface DeleteCampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (adminAddress: string) => void;
  campaign: Campaign | null;
  isLoading?: boolean;
}

//   UploadFloatingMenu
export interface UploadFloatingMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}
