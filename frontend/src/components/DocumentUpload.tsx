import React, { useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "../utils/cn";

interface DocumentUploadProps {
  onChange: (file: File | undefined) => void;
  className?: string;
  accept?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onChange,
  className,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    onChange(file || undefined);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileChange(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {selectedFile ? (
        <div className="bg-gray-700 border-2 border-gray-600 border-dashed rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-gray-200 font-medium">{selectedFile.name}</p>
                <p className="text-gray-400 text-sm">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            dragActive
              ? "border-blue-400 bg-blue-400/10"
              : "border-gray-600 hover:border-gray-500 hover:bg-gray-700/50",
            className
          )}
        >
          <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-200 font-medium mb-2">
            Upload Verification Document
          </p>
          <p className="text-gray-400 text-sm mb-4">
            Drag and drop your document here, or click to browse
          </p>
          <p className="text-gray-500 text-xs">
            Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max 10MB)
          </p>
        </div>
      )}
    </div>
  );
};