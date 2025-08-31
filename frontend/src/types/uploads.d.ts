

export interface DocumentUploadProps {
  onChange: (file: File | undefined, ipfsHash?: string) => void;
  onUpload?: (file: File) => Promise<string>;
  className?: string;
  accept?: string;
  isUploading?: boolean;
}

export interface ImageUploadProps {
  onChange: (file: File | null) => void;
  preview?: string;
  className?: string;
}