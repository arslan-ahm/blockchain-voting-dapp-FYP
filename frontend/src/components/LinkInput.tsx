import { useState, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "../utils/cn";
import { getLinkDisplayName } from "../utils/formatters";

interface LinkInputProps {
  value: string[];
  onChange: (links: string[]) => void;
  className?: string;
}

export const LinkInput = ({ value, onChange, className }: LinkInputProps) => {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.endsWith(",")) {
      const newLink = val.slice(0, -1).trim();
      if (newLink) {
        onChange([...value, newLink]);
        setInput("");
      }
    } else {
      setInput(val);
    }
  };

  const handleBadgeRemove = (index: number) => {
    const newLinks = value.filter((_, i) => i !== index);
    onChange(newLinks);
  };

  const handleBadgeEdit = (link: string) => {
    onChange(value.filter((l) => l !== link));
    setInput(link);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && input === "" && value.length > 0) {
      handleBadgeEdit(value[value.length - 1]);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap gap-2">
        {value.map((link, index) => (
          <span
            key={link}
            className="inline-flex items-center gap-1 bg-blue-500 text-white text-sm px-2 py-1 rounded-full cursor-pointer hover:bg-blue-600"
            onClick={() => handleBadgeEdit(link)}
          >
            {getLinkDisplayName(link)}
            <X
              className="h-4 w-4"
              onClick={(e) => {
                e.stopPropagation();
                handleBadgeRemove(index);
              }}
            />
          </span>
        ))}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Enter link and press comma"
        className="bg-gray-700 border-gray-600 text-gray-200 rounded-md p-2 focus:ring-blue-400 focus:border-blue-400 w-full"
      />
    </div>
  );
};