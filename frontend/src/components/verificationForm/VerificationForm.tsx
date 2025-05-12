import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { useVerificationForm } from "./useVerificationForm";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

export const VerificationForm = () => {
  const { form, onSubmit, isLoading, hasActiveCampaign } = useVerificationForm();
  const formRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(formRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.5,
    });
  }, []);

  if (!hasActiveCampaign) {
    return <p className="text-gray-400">No active campaigns. Cannot request verification.</p>;
  }

  return (
    <div ref={formRef} className="max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200">Requested Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-200">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="1" className="text-gray-200">Voter</SelectItem>
                    <SelectItem value="2" className="text-gray-200">Candidate</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="document"
            render={({ field: { onChange } }) => (
              <FormItem>
                <FormLabel className="text-gray-200">Verification Document</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onChange(file);
                    }}
                    className="bg-gray-700 border-gray-600 text-gray-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
          >
            {isLoading ? "Submitting..." : "Request Verification"}
          </Button>
        </form>
      </Form>
    </div>
  );
};