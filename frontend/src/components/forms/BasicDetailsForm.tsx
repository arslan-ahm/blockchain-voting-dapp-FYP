import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Input } from "../ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { ImageUpload } from "../ImageUpload";
import { cn } from "../../utils/cn";
import { dateToUnix } from "../../utils/formatters";
import { getIpfsUrl } from "../../utils/ipfs";
import type { BasicDetailsFormProps } from "../../types/form";

export const BasicDetailsForm: React.FC<BasicDetailsFormProps> = ({
  form,
  onSubmit,
  currentProfileImage,
}) => {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="profileImage"
          render={({ field: { onChange } }) => (
            <FormItem>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
        </div>
      </form>
    </Form>
  );
};