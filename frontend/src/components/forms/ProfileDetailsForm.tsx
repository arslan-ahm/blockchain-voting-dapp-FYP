import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { ImageUpload } from "../ImageUpload";
import { Plus, X } from "lucide-react";
import { cn } from "../../utils/cn";
import { dateToUnix } from "../../utils/formatters";
import { getIpfsUrl } from "../../utils/ipfs";
import type { ProfileDetailsFormProps } from "../../types/form";


export const ProfileDetailsForm: React.FC<ProfileDetailsFormProps> = ({
  form,
  onSubmit,
  isLoading,
  showSubmitButton = true,
  submitButtonText = "Update Details",
  currentProfileImage,
}) => {
  const [supportiveLinks, setSupportiveLinks] = React.useState<string[]>(
    form.getValues("supportiveLinks") || [""]
  );

  const addSupportiveLink = () => {
    setSupportiveLinks([...supportiveLinks, ""]);
  };

  const removeSupportiveLink = (index: number) => {
    const newLinks = supportiveLinks.filter((_, i) => i !== index);
    setSupportiveLinks(newLinks);
    form.setValue("supportiveLinks", newLinks.filter(link => link.trim()));
  };

  const updateSupportiveLink = (index: number, value: string) => {
    const newLinks = [...supportiveLinks];
    newLinks[index] = value;
    setSupportiveLinks(newLinks);
    form.setValue("supportiveLinks", newLinks.filter(link => link.trim()));
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-1 sm:col-span-2">
                <FormLabel className="text-gray-200">Full Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your full name"
                    className={cn(
                      "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400",
                      "focus:ring-blue-400 focus:border-blue-400",
                      "transition-colors duration-200"
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="col-span-1 sm:col-span-2">
                <FormLabel className="text-gray-200">Email Address *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    className={cn(
                      "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400",
                      "focus:ring-blue-400 focus:border-blue-400",
                      "transition-colors duration-200"
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date of Birth Field */}
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel className="text-gray-200">Date of Birth *</FormLabel>
                <FormControl>
                  <DatePicker
                    selected={field.value ? new Date(field.value * 1000) : null}
                    onChange={(date: Date | null) => 
                      field.onChange(date ? dateToUnix(date.toISOString().split("T")[0]) : 0)
                    }
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select date of birth"
                    maxDate={new Date()}
                    minDate={new Date("1900-01-01")}
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    className={cn(
                      "bg-gray-700 border-gray-600 text-gray-200 w-full rounded-md p-2 placeholder-gray-400",
                      "focus:ring-blue-400 focus:border-blue-400",
                      "transition-colors duration-200"
                    )}
                    wrapperClassName="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Identity Number Field */}
          <FormField
            control={form.control}
            name="identityNumber"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel className="text-gray-200">Identity Number *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter identity number"
                    className={cn(
                      "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400",
                      "focus:ring-blue-400 focus:border-blue-400",
                      "transition-colors duration-200"
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact Number Field */}
          <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
              <FormItem className="col-span-1 sm:col-span-2">
                <FormLabel className="text-gray-200">Contact Number *</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="Enter contact number"
                    className={cn(
                      "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400",
                      "focus:ring-blue-400 focus:border-blue-400",
                      "transition-colors duration-200"
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bio Field */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem className="col-span-1 sm:col-span-2">
                <FormLabel className="text-gray-200">Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about yourself..."
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

          {/* Profile Image Field */}
          <FormField
            control={form.control}
            name="profileImage"
            render={({ field: { onChange } }) => (
              <FormItem className="col-span-1 sm:col-span-2">
                <FormLabel className="text-gray-200">Profile Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    onChange={onChange}
                    preview={currentProfileImage ? getIpfsUrl(currentProfileImage) : undefined}
                    className="bg-gray-700 border-gray-600 text-gray-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Supportive Links Field */}
          <div className="col-span-1 sm:col-span-2">
            <FormLabel className="text-gray-200 mb-3 block">Supportive Links</FormLabel>
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
        </div>

        {showSubmitButton && (
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full bg-gradient-to-r from-blue-500 to-purple-500",
              "hover:from-blue-600 hover:to-purple-600 disabled:opacity-50",
              "transition-all duration-200 text-white font-medium py-2 px-4 rounded-md",
              "disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </div>
            ) : (
              submitButtonText
            )}
          </Button>
        )}
      </form>
    </Form>
  );
};