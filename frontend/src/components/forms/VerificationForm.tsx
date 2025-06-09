import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { DocumentUpload } from "../DocumentUpload";
import type { UseFormReturn } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { cn } from "../../utils/cn";
import type { VerificationFormData } from "../../pages/profile/useProfile";

interface VerificationRequestFormProps {
  form: UseFormReturn<VerificationFormData>;
  onSubmit: (values: VerificationFormData) => Promise<void>;
  isLoading: boolean;
  supportiveLinks: string[];
  addSupportiveLink: () => void;
  removeSupportiveLink: (index: number) => void;
  updateSupportiveLink: (index: number, value: string) => void;
}

export const VerificationRequestForm: React.FC<VerificationRequestFormProps> = ({
  form,
  onSubmit,
  isLoading,
  supportiveLinks,
  addSupportiveLink,
  removeSupportiveLink,
  updateSupportiveLink,
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Role Selection */}
        <FormField
          control={form.control}
          name="requestedRole"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Requested Role *</FormLabel>
              <div className="flex gap-3">
                <SelectBadge
                  onChange={() => field.onChange("Voter")}
                  value={field.value}
                  label="Voter"
                />
                <SelectBadge
                  onChange={() => field.onChange("Candidate")}
                  value={field.value}
                  label="Candidate"
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bio Field */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about yourself and why you're applying for this role..."
                  rows={4}
                  className={cn(
                    "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400",
                    "focus:ring-blue-400 focus:border-blue-400",
                    "transition-colors duration-200 resize-none"
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Supportive Links Field */}
        <div>
          <FormLabel className="text-gray-200 mb-3 block">
            Supportive Links
          </FormLabel>
          <div className="space-y-3">
            {supportiveLinks.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={link}
                  onChange={(e) => updateSupportiveLink(index, e.target.value)}
                  className={cn(
                    "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400",
                    "focus:ring-blue-400 focus:border-blue-400",
                    "transition-colors duration-200"
                  )}
                />
                {supportiveLinks.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSupportiveLink(index)}
                    className="border-gray-600 text-gray-400 hover:text-red-400 hover:border-red-400"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSupportiveLink}
              className="border-gray-600 text-gray-400 hover:text-blue-400 hover:border-blue-400"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>
        </div>

        {/* Document Upload - At the bottom */}
        <FormField
          control={form.control}
          name="verificationDocument"
          render={({ field: { onChange } }) => (
            <FormItem>
              <FormLabel className="text-gray-200">
                Verification Document
              </FormLabel>
              <FormControl>
                <DocumentUpload
                  onChange={onChange}
                  className="bg-gray-700 border-gray-600 text-gray-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              "flex-1 bg-gradient-to-r from-blue-500 to-purple-500",
              "hover:from-blue-600 hover:to-purple-600 disabled:opacity-50",
              "transition-all duration-200 text-white font-medium py-2 px-4 rounded-md",
              "disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              "Submit Verification Request"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const SelectBadge = ({
  onChange,
  value,
  label,
}: {
  onChange: (value: string) => void;
  value: string;
  label: string;
}) => {
  return (
    <button
      type="button"
      onClick={() => onChange(label)}
      className={cn(
        "px-3 py-1 rounded-full cursor-pointer text-sm font-medium transition-all duration-200 border-2",
        value === label
          ? "bg-blue-500/20 border-blue-700 text-blue-400 shadow-lg"
          : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500"
      )}
    >
      {label}
    </button>
  );
};