import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { usePinata } from "../../hooks/usePinata";
import { requestVerification } from "../../store/thunks/verificationThunks";
import { useAppDispatch } from "../../hooks/useRedux";
import { ImageUpload } from "../ImageUpload";
import { LinkInput } from "../LinkInput";
import { Role } from "../../types";

const baseSchema = z.object({
  role: z.string().refine((val) => val === String(Role.Voter) || val === String(Role.Candidate), {
    message: "Invalid role",
  }),
  verificationDoc: z.instanceof(File, { message: "Verification document is required" }),
  identityNumber: z.string().min(1, "Identity number is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
});

const voterSchema = baseSchema.extend({
  bio: z.string().optional(),
  supportiveLinks: z.array(z.string()).optional(),
});

const candidateSchema = baseSchema.extend({
  bio: z.string().min(1, "Bio is required for candidates"),
  supportiveLinks: z.array(z.string()).min(1, "At least one supportive link is required for candidates"),
});

const formSchema = z.discriminatedUnion("role", [
  voterSchema.extend({ role: z.literal(String(Role.Voter)) }),
  candidateSchema.extend({ role: z.literal(String(Role.Candidate)) }),
]);

interface VerificationFormProps {
  campaignId?: number;
}

export const VerificationForm = ({ campaignId }: VerificationFormProps) => {
  const dispatch = useAppDispatch();
  const { uploadFile } = usePinata();
  const [isLoading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: String(Role.Voter),
      verificationDoc: undefined,
      identityNumber: "",
      contactNumber: "",
      bio: "",
      supportiveLinks: [],
    },
  });

  const selectedRole = form.watch("role");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!campaignId) {
      form.setError("root", { message: "No active campaign selected" });
      return;
    }

    try {
      setLoading(true);
      const docIpfsHash = await uploadFile(values.verificationDoc);
      dispatch(
        requestVerification({
          campaignId,
          role: Number(values.role) as Role,
          docIpfsHash,
          identityNumber: values.identityNumber,
          contactNumber: values.contactNumber,
          bio: values.bio || "",
          supportiveLinks: values.supportiveLinks || [],
        })
      );
      form.reset();
    } catch (error) {
      console.error("Failed to request verification:", error);
      form.setError("verificationDoc", { message: "Failed to upload document" });
    } finally {
      setLoading(false);
    }
  };

  return (
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
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-gray-700 border-gray-600 text-gray-200">
                  <SelectItem value={String(Role.Voter)}>Voter</SelectItem>
                  <SelectItem value={String(Role.Candidate)}>Candidate</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="identityNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Identity Number</FormLabel>
              <FormControl>
                <Input className="bg-gray-700 border-gray-600 text-gray-200" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Contact Number</FormLabel>
              <FormControl>
                <Input className="bg-gray-700 border-gray-600 text-gray-200" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">
                Bio {selectedRole === String(Role.Candidate) && <span className="text-red-400">*</span>}
              </FormLabel>
              <FormControl>
                <Textarea
                  className="bg-gray-700 border-gray-600 text-gray-200 h-32"
                  placeholder="Tell us about yourself"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="supportiveLinks"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">
                Supportive Links {selectedRole === String(Role.Candidate) && <span className="text-red-400">*</span>}
              </FormLabel>
              <FormControl>
                <LinkInput
                  value={field.value || []}
                  onChange={field.onChange}
                  className="bg-gray-700 border-gray-600 text-gray-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="verificationDoc"
          render={({ field: { onChange } }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Verification Document</FormLabel>
              <FormControl>
                <ImageUpload
                  onChange={onChange}
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
  );
};