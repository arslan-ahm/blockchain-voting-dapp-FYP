import { useRef } from 'react';
import { Button } from '../../ui/button';
import { Camera, FileText } from 'lucide-react';

interface UploadFloatingMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

export const UploadFloatingMenu = ({ 
  isOpen, 
  onClose, 
  onUpload 
}: UploadFloatingMenuProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`absolute top-full left-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="p-4 w-64 space-y-3">
        <h4 className="text-white font-medium">Upload Document</h4>
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:bg-gray-700"
            onClick={handleFileUpload}
          >
            <Camera className="w-4 h-4 mr-2" />
            Upload Image
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:bg-gray-700"
            onClick={handleFileUpload}
          >
            <FileText className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onUpload(file);
              onClose();
            }
          }}
        />
      </div>
    </div>
  );
}; 