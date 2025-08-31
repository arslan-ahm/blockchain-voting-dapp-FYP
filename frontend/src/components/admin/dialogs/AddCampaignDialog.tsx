import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { AlertCircle, FileText, Upload } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../ui/tabs";
import type { AddCampaignDialogProps } from "../../../types/dialog";
import { CustomDatePicker } from "../../CustomDatePicker";
import { DocumentUpload } from "../../DocumentUpload";

// Update the props interface to include the new upload handler
export const AddCampaignDialog = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  isCreating,
  isUploading,
  // onUpload,
  onImmediateUpload, // Add this new prop
}: AddCampaignDialogProps) => {
  const [dateError, setDateError] = useState<string>("");
  const [activeTab, setActiveTab] = useState("details");
  const [selectedDocument, setSelectedDocument] = useState<File | undefined>(undefined);
  const [documentHash, setDocumentHash] = useState<string | undefined>(undefined);

  const handleSubmit = form.handleSubmit((data) => {
    const formData = {
      ...data,
      campaignDocument: selectedDocument,
      documentHash: documentHash, // Include the pre-uploaded hash
    };
    return onSubmit(formData);
  });

  const handleDocumentUpload = (file: File | undefined, ipfsHash?: string) => {
    setSelectedDocument(file);
    setDocumentHash(ipfsHash);
  };

  // Calculate minimum dates - allow current time plus 10 minutes
  const now = new Date();
  const minStartDateTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
  const minEndDateTime = form.watch("startDate")
    ? new Date(form.watch("startDate") * 1000 + 60 * 60 * 1000) // 1 hour after start date
    : new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

  // Validate dates when they change
  useEffect(() => {
    const subscription = form.watch((_, { name }) => {
      if (name !== "startDate" && name !== "endDate") return;

      const startDate = form.getValues("startDate");
      const endDate = form.getValues("endDate");

      if (startDate && endDate) {
        const startDateTime = new Date(startDate * 1000);
        const endDateTime = new Date(endDate * 1000);
        const now = new Date();

        if (startDateTime <= now) {
          setDateError("Start time must be at least 10 minutes from now");
        } else if (endDateTime <= startDateTime) {
          setDateError("End time must be after start time");
        } else if (
          endDateTime.getTime() - startDateTime.getTime() <
          60 * 60 * 1000
        ) {
          setDateError("Campaign must run for at least 1 hour");
        } else {
          setDateError("");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const isFormValid = () => {
    const hasBasicFields = form.watch("title") && form.watch("description");
    const hasValidDates = !dateError && form.watch("startDate") && form.watch("endDate");
    // Removed rich text requirement - campaign can be created without document or rich text
    return hasBasicFields && hasValidDates;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-5xl max-h-[90vh] overflow-visible">
        <DialogHeader>
          <DialogTitle>Add New Campaign</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto pr-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger value="details" className="text-gray-200 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Campaign Details
            </TabsTrigger>
            <TabsTrigger value="document" className="text-gray-200 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Document Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6 space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                {...form.register("title", { required: "Title is required" })}
                className="bg-gray-700 border-gray-600"
                placeholder="Enter campaign title"
              />
              {form.formState.errors.title && (
                <p className="text-red-400 text-sm mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <Label>Start Date & Time</Label>
                <p className="text-xs text-gray-400 mb-1">
                  Must be at least 10 minutes from now
                </p>
                <CustomDatePicker
                  selected={
                    form.watch("startDate")
                      ? new Date(form.watch("startDate") * 1000)
                      : null
                  }
                  onChange={(date: Date | null) =>
                    form.setValue(
                      "startDate",
                      date ? Math.floor(date.getTime() / 1000) : 0
                    )
                  }
                  placeholderText="Select start date & time"
                  dateFormat="yyyy-MM-dd"
                  timeFormat="HH:mm"
                  showTimeSelect={true}
                  timeIntervals={15}
                  minDate={minStartDateTime}
                  className="w-full"
                  showIcon={true}
                />
              </div>
              <div className="flex-1">
                <Label>End Date & Time</Label>
                <p className="text-xs text-gray-400 mb-1">
                  Must be at least 1 hour after start time
                </p>
                <CustomDatePicker
                  selected={
                    form.watch("endDate")
                      ? new Date(form.watch("endDate") * 1000)
                      : null
                  }
                  onChange={(date: Date | null) =>
                    form.setValue(
                      "endDate",
                      date ? Math.floor(date.getTime() / 1000) : 0
                    )
                  }
                  placeholderText="Select end date & time"
                  dateFormat="yyyy-MM-dd"
                  timeFormat="HH:mm"
                  showTimeSelect={true}
                  timeIntervals={15}
                  minDate={minEndDateTime}
                  className="w-full"
                  showIcon={true}
                />
              </div>
            </div>

            {dateError && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {dateError}
              </div>
            )}

            <div>
              <Label>Description</Label>
              <textarea
                {...form.register("description", {
                  required: "Description is required",
                })}
                className="w-full h-32 p-3 bg-gray-700 border border-gray-600 text-white rounded-md resize-none"
                placeholder="Add campaign description..."
              />
              {form.formState.errors.description && (
                <p className="text-red-400 text-sm mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                onClick={() => setActiveTab("document")}
                className="bg-primary flex-1"
              >
                Next
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="document" className="mt-6 space-y-4">
            <div>
              <Label className="text-white mb-2 block">Campaign Document (Optional)</Label>
              <p className="text-gray-400 text-sm mb-4">
                Upload a document containing campaign rules, terms, or additional information. <span className="font-medium">Optional but recommanded.</span>
              </p>
              <DocumentUpload
                onChange={handleDocumentUpload}
                onUpload={onImmediateUpload}
                className="w-full"
                accept=".pdf,.doc,.docx"
                isUploading={isUploading}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("details")}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={isCreating || !isFormValid()}
              >
                {isCreating ? "Creating..." : "Create Campaign"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};