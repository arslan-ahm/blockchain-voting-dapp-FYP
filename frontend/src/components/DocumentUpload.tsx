import { useState, useCallback, useRef } from "react";
import { Upload, FileText, X, Loader2, CheckCircle } from "lucide-react";
import { cn } from "../utils/cn";

export interface DocumentUploadProps {
  onChange: (file: File | undefined, ipfsHash?: string) => void;
  onUpload?: (file: File) => Promise<string>;
  className?: string;
  accept?: string;
  isUploading?: boolean;
}

export const DocumentUpload = ({ 
  onChange, 
  onUpload, 
  className, 
  accept = ".pdf,.doc,.docx",
  isUploading = false 
}: DocumentUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedHash, setUploadedHash] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const uploadFile = async (file: File) => {
    if (!onUpload) {
      onChange(file);
      return;
    }

    try {
      setUploadError(null);
      const ipfsHash = await onUpload(file);
      setUploadedHash(ipfsHash);
      onChange(file, ipfsHash);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError("Upload failed. Please try again.");
      onChange(undefined);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file && (file.type === "application/pdf" || file.type.includes("document") || file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx'))) {
        setSelectedFile(file);
        setUploadedHash(null);
        setUploadError(null);
        uploadFile(file);
      }
    },
    [onUpload, onChange]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        setUploadedHash(null);
        setUploadError(null);
        uploadFile(file);
      }
    },
    [onUpload, onChange]
  );

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    setUploadedHash(null);
    setUploadError(null);
    // Reset the file input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange(undefined);
  }, [onChange]);

  const getStatusIcon = () => {
    if (isUploading) {
      return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />;
    }
    if (uploadedHash) {
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    }
    if (uploadError) {
      return <X className="h-5 w-5 text-red-400" />;
    }
    return <FileText className="h-5 w-5 text-green-400" />;
  };

  const getStatusText = () => {
    if (isUploading) {
      return "Uploading...";
    }
    if (uploadedHash) {
      return "Uploaded successfully";
    }
    if (uploadError) {
      return uploadError;
    }
    return "Ready to upload";
  };

  const getStatusColor = () => {
    if (isUploading) return "text-blue-400";
    if (uploadedHash) return "text-green-400";
    if (uploadError) return "text-red-400";
    return "text-gray-400";
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer",
          dragActive ? "border-blue-400 bg-blue-400/10" : "border-gray-600 bg-gray-700",
          selectedFile && uploadedHash && "border-green-500 bg-green-500/10",
          selectedFile && uploadError && "border-red-500 bg-red-500/10",
          isUploading && "border-blue-500 bg-blue-500/10"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center">
            {getStatusIcon()}
            <p className="text-white text-sm font-medium mb-1 mt-2">{selectedFile.name}</p>
            <p className="text-gray-400 text-xs mb-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            <p className={cn("text-xs", getStatusColor())}>{getStatusText()}</p>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-200 text-sm mb-2">Drag and drop a document, or click to select</p>
            <p className="text-gray-400 text-xs">Supports PDF, DOC, DOCX files</p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={isUploading}
        />
      </div>
      
      {selectedFile && (
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className="text-sm font-medium text-white">{selectedFile.name}</p>
              <p className={cn("text-xs", getStatusColor())}>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {getStatusText()}
              </p>
              {uploadedHash && (
                <p className="text-xs text-gray-500 truncate max-w-[200px]">
                  IPFS: {uploadedHash}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-1 hover:bg-gray-600 rounded transition-colors"
            type="button"
            disabled={isUploading}
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      )}
    </div>
  );
};