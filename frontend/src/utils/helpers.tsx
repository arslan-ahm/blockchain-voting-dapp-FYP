import { useState } from "react";
import { Button } from "../components/ui/button";
import { Copy } from "lucide-react";

export const CopyButton = ({ text, label }: { text: string, label: string }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
  
    return (
      <Button
        size="sm"
        variant="ghost"
        onClick={handleCopy}
        className="text-blue-400 hover:text-blue-300 p-1"
      >
        <Copy className="w-3 h-3" />
        {copied ? "Copied!" : label}
      </Button>
    );
  };