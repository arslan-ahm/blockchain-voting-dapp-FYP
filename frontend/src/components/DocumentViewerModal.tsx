import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { FileText, Image as ImageIcon, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";


interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ipfsHash: string;
  campaignTitle: string;
  userRole?: 'admin' | 'voter'; // Add user role prop
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  ipfsHash,
  campaignTitle,
  userRole = 'voter', // Default to voter
}) => {
  const [fileType, setFileType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  

  const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
  const isAdmin = userRole === 'admin';

  // Detect file type by checking the actual file headers
  useEffect(() => {
    if (!isOpen || !ipfsHash) return;

    const detectFileType = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(ipfsUrl, { method: 'HEAD' });
        const contentType = response.headers.get('content-type');
        
        if (contentType) {
          if (contentType.includes('application/pdf')) {
            setFileType('pdf');
          } else if (contentType.startsWith('image/')) {
            setFileType('image');
          } else {
            setFileType('unknown');
          }
        } else {
          // Fallback: try to detect from URL or assume PDF
          const urlLower = ipfsUrl.toLowerCase();
          if (urlLower.includes('.pdf')) {
            setFileType('pdf');
          } else if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
            setFileType('image');
          } else {
            // Default to PDF for blockchain documents
            setFileType('pdf');
          }
        }
      } catch (err) {
        console.error('Error detecting file type:', err);
        // Default to PDF for blockchain documents
        setFileType('pdf');
      } finally {
        setIsLoading(false);
      }
    };

    detectFileType();
  }, [isOpen, ipfsHash, ipfsUrl]);


  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(ipfsHash);
      setCopied(true);
      toast.success('copied');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err)
      toast.error("Failed to copy IPFS hash");
    }
  };

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            <p className="text-gray-400">Loading document...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <FileText className="h-16 w-16 mb-4" />
          <p className="text-lg mb-2">Error Loading Document</p>
          <p className="text-sm mb-4">{error}</p>
          
        </div>
      );
    }

    switch (fileType) {
      case 'pdf':
        return (
          <div className="w-full h-full">
            <iframe
              src={ipfsUrl}
              className="w-full h-full border-0 rounded-lg"
              title={`${campaignTitle} Document`}
              onError={() => setError('Failed to load PDF. The file might be corrupted or unavailable.')}
            />
          </div>
        );
      
      case 'image':
        return (
          <div className="flex items-center justify-center h-full p-4">
            <img
              src={ipfsUrl}
              alt={`${campaignTitle} Document`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              onError={() => setError('Failed to load image. The file might be corrupted or unavailable.')}
            />
          </div>
        );
      
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <FileText className="h-16 w-16 mb-4" />
            <p className="text-lg mb-2">Document Preview Not Available</p>
            <p className="text-sm mb-4 text-center max-w-md">
              This file type cannot be previewed in the browser. Click the button below to open it in a new tab.
            </p>
            
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-7xl w-[98vw] h-[90vh] flex flex-col p-4">
        {/* Custom close button with proper styling */}
        

        <DialogHeader className="flex-shrink-0 px-6 pb-2">
          <div className="flex items-center justify-between pr-10">
            <DialogTitle className="text-xl text-blue-400 truncate">
              Campaign - {campaignTitle}
            </DialogTitle>
            
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 px-6">
          <div className="h-full overflow-hidden rounded-lg bg-gray-900/50">
            {renderPreview()}
          </div>
        </div>

        {/* Document details - only show to admins */}
        {isAdmin && fileType && !isLoading && (
          <div className="flex-shrink-0 m-6 mt-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-gray-300 min-w-0">
                {fileType === "pdf" ? (
                  <FileText className="h-5 w-5 flex-shrink-0 text-blue-400" />
                ) : fileType === "image" ? (
                  <ImageIcon className="h-5 w-5 flex-shrink-0 text-green-400" />
                ) : (
                  <FileText className="h-5 w-5 flex-shrink-0 text-gray-400" />
                )}
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-medium text-gray-200">
                    File Type: {fileType.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">IPFS Hash:</span>
                    <code 
                      className="text-xs bg-gray-800 px-2 py-1 rounded font-mono text-blue-300 cursor-pointer hover:bg-gray-700 transition-colors truncate max-w-md"
                      onClick={handleCopyHash}
                      title="Click to copy IPFS hash"
                    >
                      {ipfsHash}
                    </code>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyHash}
                className="flex-shrink-0 text-gray-400 hover:text-white hover:bg-gray-600 cursor-pointer"
                title="Copy IPFS hash"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        
      </DialogContent>
    </Dialog>
  );
};