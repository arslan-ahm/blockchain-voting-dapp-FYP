import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  ChevronDown,
  Undo,
  Redo,
  Strikethrough,
  Camera,
  FileText,
} from "lucide-react";

// Utility function for className merging
const cn = (...classes: (string | boolean | undefined)[]): string =>
  classes.filter(Boolean).join(" ");

// DropdownMenu Components (simplified version)
const DropdownMenu = ({ children }: { children: React.ReactNode }) => (
  <div className="relative inline-block">{children}</div>
);

const DropdownMenuTrigger = ({ children }: { asChild?: boolean; children: React.ReactNode }) => (
  <>{children}</>
);

const DropdownMenuContent = ({ className, children }: { align?: string; className?: string; children: React.ReactNode }) => (
  <div className={className}>{children}</div>
);

// ImageUpload Component
interface ImageUploadProps {
  onChange: (file: File | null) => void;
  preview?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onChange,
  preview,
  className,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (
        file &&
        (file.type.startsWith("image/") || file.type === "application/pdf")
      ) {
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

  const displayPreview = localPreview || preview;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors",
        dragActive
          ? "border-blue-400 bg-primary/10"
          : "border-gray-600 bg-gray-700",
        className
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {displayPreview ? (
        <img
          src={displayPreview}
          alt="Preview"
          className="h-32 w-32 object-cover rounded-lg mb-4"
        />
      ) : (
        <Upload className="h-12 w-12 text-gray-400 mb-4" />
      )}
      <p className="text-gray-200 text-sm mb-2">
        Drag and drop an image or PDF, or click to select
      </p>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
    </div>
  );
};

// Main Rich Text Editor Component
interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  onUpload?: (file: File | string) => void;
  isUploading?: boolean;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = "",
  onChange,
  onUpload,
  isUploading = false,
  placeholder = "Start writing...",
}) => {
  const [content, setContent] = useState<string>(value);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [currentSelection, setCurrentSelection] = useState<Range | null>(null);
  
  // Formatting state
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    bulletList: false,
    orderedList: false,
    currentFormat: 'p'
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const uploadButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize content
  useEffect(() => {
    if (editorRef.current && value !== content) {
      editorRef.current.innerHTML = value;
      setContent(value);
    }
  }, [value, content]);

  // Update formatting state based on current selection
  const updateFormatState = useCallback((): void => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    try {
      const newFormatState = {
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikethrough: document.queryCommandState('strikeThrough'),
        alignLeft: document.queryCommandState('justifyLeft'),
        alignCenter: document.queryCommandState('justifyCenter'),
        alignRight: document.queryCommandState('justifyRight'),
        bulletList: document.queryCommandState('insertUnorderedList'),
        orderedList: document.queryCommandState('insertOrderedList'),
        currentFormat: document.queryCommandValue('formatBlock') || 'p'
      };

      setFormatState(newFormatState);
    } catch (error) {
      // Fallback if queryCommandState fails
      console.warn('Failed to update format state:', error);
    }
  }, []);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        uploadButtonRef.current &&
        !uploadButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Save selection and update format state
  const saveSelection = (): void => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setCurrentSelection(selection.getRangeAt(0).cloneRange());
    }
    // Update format state whenever selection changes
    setTimeout(updateFormatState, 0);
  };

  // Restore selection
  const restoreSelection = (): void => {
    if (currentSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(currentSelection);
      }
    }
  };

  // Execute formatting command
  const execCommand = (command: string, value: string | null = null): void => {
    restoreSelection();
    document.execCommand(command, false, value ?? undefined);
    editorRef.current?.focus();
    handleContentChange();
    // Update format state after command execution
    setTimeout(updateFormatState, 0);
  };

  // Handle content changes
  const handleContentChange = useCallback((): void => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;

      // Add to undo stack
      if (content !== newContent) {
        setUndoStack((prev) => [...prev.slice(-19), content]); // Keep last 20 states
        setRedoStack([]); // Clear redo stack on new change
      }

      setContent(newContent);
      onChange?.(newContent);
    }
  }, [content, onChange]);

  // Undo functionality
  const handleUndo = (): void => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setRedoStack((prev) => [content, ...prev]);
      setUndoStack((prev) => prev.slice(0, -1));
      setContent(previousState);
      if (editorRef.current) {
        editorRef.current.innerHTML = previousState;
      }
      onChange?.(previousState);
      setTimeout(updateFormatState, 0);
    }
  };

  // Redo functionality
  const handleRedo = (): void => {
    if (redoStack.length > 0) {
      const nextState = redoStack[0];
      setUndoStack((prev) => [...prev, content]);
      setRedoStack((prev) => prev.slice(1));
      setContent(nextState);
      if (editorRef.current) {
        editorRef.current.innerHTML = nextState;
      }
      onChange?.(nextState);
      setTimeout(updateFormatState, 0);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "z":
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
          break;
        case "y":
          e.preventDefault();
          handleRedo();
          break;
        case "b":
          e.preventDefault();
          execCommand("bold");
          break;
        case "i":
          e.preventDefault();
          execCommand("italic");
          break;
        case "u":
          e.preventDefault();
          execCommand("underline");
          break;
      }
    }
  };

  // Handle file upload from input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload?.(file);
      setIsMenuOpen(false);
    }
  };

  // Handle file upload from drag/drop
  const handleFileUploadDrop = (file: File | null): void => {
    if (file) {
      onUpload?.(file);
      setIsMenuOpen(false);
    }
  };

  // Handle file input click
  const handleFileInputClick = (): void => {
    fileInputRef.current?.click();
  };

  // Custom heading sizes
  const headingSizes: {
    [key: string]: { tag: string; size: string; weight: string };
  } = {
    H1: { tag: "h1", size: "2.5rem", weight: "bold" },
    H2: { tag: "h2", size: "2rem", weight: "bold" },
    H3: { tag: "h3", size: "1.5rem", weight: "bold" },
    H4: { tag: "h4", size: "1.25rem", weight: "bold" },
    H5: { tag: "h5", size: "1.125rem", weight: "bold" },
    H6: { tag: "h6", size: "1rem", weight: "bold" },
  };

  const applyHeading = (tag: string): void => {
    execCommand("formatBlock", tag);
    // Apply custom styling
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const element = selection.anchorNode?.parentElement;
        if (element && headingSizes[tag.toUpperCase()]) {
          const style = headingSizes[tag.toUpperCase()];
          element.style.fontSize = style.size;
          element.style.fontWeight = style.weight;
          element.style.marginBottom = "0.5rem";
        }
      }
      updateFormatState();
    }, 0);
  };

  // Get button active state
  const getButtonClass = (isActive: boolean): string => {
    return cn(
      "p-2 rounded transition-colors",
      isActive 
        ? "bg-primary text-white" 
        : "bg-gray-700 hover:bg-gray-600 text-white"
    );
  };

  return (
    <div className="w-full bg-gray-800 rounded-lg border border-gray-600">
      {/* Toolbar */}
      <div className="border-b border-gray-600 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* History Controls */}
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-600 mx-1" />

          {/* Format Dropdown */}
          <select
            value={formatState.currentFormat}
            onChange={(e) => {
              if (e.target.value === "p") {
                execCommand("formatBlock", "p");
              } else {
                applyHeading(e.target.value);
              }
            }}
            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1 (2.5rem)</option>
            <option value="h2">Heading 2 (2rem)</option>
            <option value="h3">Heading 3 (1.5rem)</option>
            <option value="h4">Heading 4 (1.25rem)</option>
            <option value="h5">Heading 5 (1.125rem)</option>
            <option value="h6">Heading 6 (1rem)</option>
          </select>

          <div className="w-px h-6 bg-gray-600 mx-1" />

          {/* Text Formatting */}
          <button
            onClick={() => execCommand("bold")}
            className={getButtonClass(formatState.bold)}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand("italic")}
            className={getButtonClass(formatState.italic)}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand("underline")}
            className={getButtonClass(formatState.underline)}
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand("strikeThrough")}
            className={getButtonClass(formatState.strikethrough)}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-600 mx-1" />

          {/* Alignment */}
          <button
            onClick={() => execCommand("justifyLeft")}
            className={getButtonClass(formatState.alignLeft)}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand("justifyCenter")}
            className={getButtonClass(formatState.alignCenter)}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand("justifyRight")}
            className={getButtonClass(formatState.alignRight)}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-600 mx-1" />

          {/* Lists */}
          <button
            onClick={() => execCommand("insertUnorderedList")}
            className={getButtonClass(formatState.bulletList)}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand("insertOrderedList")}
            className={getButtonClass(formatState.orderedList)}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="flex-1" />

          {/* Upload Button Group */}
          <div className="flex relative bg-primary rounded-md">
            <button
              onClick={() => onUpload?.(content)}
              disabled={isUploading || !content.trim()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 font-medium transition-colors rounded-l",
                isUploading || !content.trim()
                  ? "bg-gray-600 cursor-not-allowed text-gray-400"
                  : "bg-primary text-white"
              )}
            >
              <Upload className="w-4 h-4" />
              {isUploading ? "Uploading..." : "Upload"}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "px-2 py-2 border-l border-blue-500 rounded-r text-white transition-colors"
                  )}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <ChevronDown className="w-4 h-4 mt-1" />
                </button>
              </DropdownMenuTrigger>

              {isMenuOpen && (
                <DropdownMenuContent align="end" className="absolute right-0 top-full mt-2 z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-lg w-64">
                  <div ref={menuRef} className="p-4 space-y-3">
                    <h4 className="text-white font-medium">Upload Document</h4>
                    <div className="space-y-2">
                      <button
                        onClick={handleFileInputClick}
                        className="w-full flex items-center justify-start gap-2 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                        Upload Image
                      </button>
                      <button
                        onClick={handleFileInputClick}
                        className="w-full flex items-center justify-start gap-2 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Upload Document
                      </button>
                    </div>
                    <div className="pt-2 border-t border-gray-700">
                      <ImageUpload
                        onChange={handleFileUploadDrop}
                        className="w-full"
                      />
                    </div>
                  </div>
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onFocus={updateFormatState}
        className="min-h-96 p-4 text-white focus:outline-none"
        style={{
          lineHeight: "1.6",
        }}
        suppressContentEditableWarning={true}
        {...(placeholder && { "data-placeholder": placeholder })}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default RichTextEditor;