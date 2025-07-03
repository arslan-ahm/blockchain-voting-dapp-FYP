

export interface DocumentUploadProps {
  onChange: (file: File | undefined) => void;
  className?: string;
  accept?: string;
}


export interface ImageUploadProps {
  onChange: (file: File | null) => void;
  preview?: string;
  className?: string;
}