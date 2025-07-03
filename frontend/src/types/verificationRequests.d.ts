

export interface VerificationRequestsProps {
  requests: VerificationRequestData[];
  onProcessVerification: (userAddress: string, approved: boolean, feedback: string) => Promise<void>;
  isLoading?: boolean;
  isProcessing?: boolean;
}