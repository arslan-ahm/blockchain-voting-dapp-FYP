import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { fetchUserDetails, updateUserDetails } from "../../store/thunks/userThunks";
import { fetchCampaigns } from "../../store/thunks/campaignThunks";
import { usePinata } from "../../hooks/usePinata";
import { Role } from "../../types";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  dateOfBirth: z.number().min(0, "Invalid date"),
  profileImage: z.instanceof(File).optional(),
});

export const useProfile = () => {
  const dispatch = useAppDispatch();
  const { uploadFile } = usePinata();
  const user = useAppSelector((state) => state.user);
  const { campaigns } = useAppSelector((state) => state.campaign);
  const isEditable = user.role === Role.Unverified || user.role === Role.PendingVerification;
  const hasActiveCampaign = campaigns.some((c) => c.isOpen);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.details?.name || "",
      email: user.details?.email || "",
      dateOfBirth: user.details?.dateOfBirth || 0,
      profileImage: undefined,
    },
  });

  useEffect(() => {
    if (user.account) {
      dispatch(fetchUserDetails(user.account));
      dispatch(fetchCampaigns());
    }
  }, [user.account, dispatch]);

  useEffect(() => {
    if (user.details) {
      form.reset({
        name: user.details.name,
        email: user.details.email,
        dateOfBirth: user.details.dateOfBirth,
        profileImage: undefined,
      });
    }
  }, [user.details, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let profileImageIpfsHash = user.details?.profileImageIpfsHash || "";
      if (values.profileImage) {
        profileImageIpfsHash = await uploadFile(values.profileImage);
      }
      dispatch(
        updateUserDetails({
          name: values.name,
          email: values.email,
          dateOfBirth: values.dateOfBirth,
          identityNumber: user.details?.identityNumber || "",
          contactNumber: user.details?.contactNumber || "",
          bio: user.details?.bio || "",
          profileImageIpfsHash,
          supportiveLinks: user.details?.supportiveLinks || [],
        })
      );
    } catch (error) {
      console.error("Failed to update user details:", error);
      toast.error("Failed to update user details");
    }
  };

  return { user, form, onSubmit, isLoading: user.loading, isEditable, hasActiveCampaign };
};