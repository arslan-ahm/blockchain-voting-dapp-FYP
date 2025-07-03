import type { UseFormReturn } from "react-hook-form";

// BasicDetialsForm
export interface BasicDetailsFormProps {
  form: UseFormReturn<BasicDetailsFormData>;
  onSubmit: (values: BasicDetailsFormData) => Promise<void>;
  isLoading: boolean;
  currentProfileImage?: string;
}

// VerificationRequestForm
export interface VerificationRequestFormProps {
  form: UseFormReturn<VerificationFormData>;
  onSubmit: (values: VerificationFormData) => Promise<void>;
  isLoading: boolean;
  supportiveLinks: string[];
  addSupportiveLink: () => void;
  removeSupportiveLink: (index: number) => void;
  updateSupportiveLink: (index: number, value: string) => void;
}

// ProfileDetailsForm
export interface FromDataType {
    name: string;
    email: string;
    dateOfBirth: number;
    identityNumber: string;
    contactNumber: string;
    bio?: string | undefined;
    profileImage?: File | undefined;
    supportiveLinks?: string[] | undefined;
}

export interface ProfileDetailsFormProps {
  form: UseFormReturn<FromDataType>;
  onSubmit: (values: FromDataType) => Promise<void>;
  isLoading: boolean;
  showSubmitButton?: boolean;
  submitButtonText?: string;
  currentProfileImage?: string;
}