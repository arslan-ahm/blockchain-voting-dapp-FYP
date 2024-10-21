import { useState, useCallback } from "react";
import { Upload } from "lucide-react";
import { cn } from "../utils/cn";

interface ImageUploadProps {
  onChange: (file: File | null) => void;
  preview?: string;
  className?: string;
}

export const ImageUpload = ({ onChange, preview, className }: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
        onChange(file);
        if (file.type.startsWith("image/")) {
          setLocalPreview(URL.createObjectURL(file));
        } else {
          setLocalPreview(null);
        }
      }
    },
    [onChange]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onChange(file);
        if (file.type.startsWith("image/")) {
          setLocalPreview(URL.createObjectURL(file));
        } else {
          setLocalPreview(null);
        }
      }
    },
    [onChange]
  );

  // Use localPreview if available, fallback to prop preview
  const displayPreview = localPreview || preview;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors",
        dragActive ? "border-blue-400 bg-blue-400/10" : "border-gray-600 bg-gray-700",
        className
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {displayPreview ? (
        <img src={displayPreview} alt="Preview" className="h-32 w-32 object-cover rounded-full mb-4" />
      ) : (
        <Upload className="h-12 w-12 text-gray-400 mb-4" />
      )}
      <p className="text-gray-200 text-sm mb-2">Drag and drop an image or PDF, or click to select</p>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
    </div>
  );
};