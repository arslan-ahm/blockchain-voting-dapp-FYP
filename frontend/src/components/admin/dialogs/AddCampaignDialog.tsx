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
import { AlertCircle, FileText, Edit } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../ui/tabs";
import type { AddCampaignDialogProps } from "../../../types/dialog";
import { CustomDatePicker } from "../../CustomDatePicker";
import RichTextEditor from "../../RichTextEditor";

export const AddCampaignDialog = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  isCreating,
}: AddCampaignDialogProps) => {
  const [dateError, setDateError] = useState<string>("");
  const [campaignRules, setCampaignRules] = useState<string>("");
  const [activeTab, setActiveTab] = useState("details");

  const handleSubmit = form.handleSubmit((data) => {
    // Include the rich text content in the form data
    const formData = {
      ...data,
      campaignDetails: campaignRules,
    };
    return onSubmit(formData);
  });

  // Calculate minimum dates
  const now = new Date();
  const minStartDate = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
  const minEndDate = form.watch("startDate")
    ? new Date(form.watch("startDate") * 1000 + 24 * 60 * 60 * 1000) // 24 hours after start date
    : new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

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
          setDateError("Start date must be in the future");
        } else if (endDateTime <= startDateTime) {
          setDateError("End date must be after start date");
        } else if (
          endDateTime.getTime() - startDateTime.getTime() <
          24 * 60 * 60 * 1000
        ) {
          setDateError("Campaign must run for at least 24 hours");
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
    const hasContract = campaignRules.trim();
    
    return hasBasicFields && hasValidDates && hasContract;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Campaign</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger value="details" className="text-gray-200 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Campaign Details
            </TabsTrigger>
            <TabsTrigger value="contract" className="text-gray-200 flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Contract & Rules
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
                <Label>Start Date</Label>
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
                  placeholderText="Select start date and time"
                  dateFormat="yyyy-MM-dd"
                  showTimeSelect={true}
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  minDate={minStartDate}
                  className="w-full"
                  showIcon={true}
                />
              </div>
              <div className="flex-1">
                <Label>End Date</Label>
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
                  placeholderText="Select end date and time"
                  dateFormat="yyyy-MM-dd"
                  showTimeSelect={true}
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  minDate={minEndDate}
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
                onClick={() => setActiveTab("contract")}
                className="bg-primary flex-1"
              >
                Next
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="contract" className="mt-6 space-y-4">
            <div>
              <Label className="text-white mb-2 block">Campaign Rules & Contract</Label>
              <div className="bg-gray-800 rounded-lg border border-gray-600">
                  <RichTextEditor
                    value={campaignRules}
                    onChange={setCampaignRules}
                    placeholder="Enter detailed campaign rules and contract terms..."
                  />
                </div>
                
                {!campaignRules.trim() && (
                  <p className="text-red-400 text-sm mt-1">
                    Campaign rules and contract terms are required
                  </p>
                )}
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
      </DialogContent>
    </Dialog>
  );
};