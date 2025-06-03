
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateUserDetails } from "../../store/thunks/userThunks";
import { usePinata } from "../../hooks/usePinata";
import { Role } from "../../types";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  dateOfBirth: z.number().min(0, "Invalid date"),
  identityNumber: z.string().min(1, "Identity number is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  bio: z.string().optional(),
  profileImage: z.instanceof(File).optional(),
  supportiveLinks: z.array(z.string()).optional(),
});

export const useProfile = () => {
  const dispatch = useAppDispatch();
  const { uploadFile } = usePinata();
  const user = useAppSelector((state) => state.user);
  const { campaigns } = useAppSelector((state) => state.campaign);
  
  
  const isEditable = user.role === Role.Unverified || user.role === Role.PendingVerification;

  const now = Math.floor(Date.now() / 1000);
  const upcomingThreshold = 7 * 24 * 60 * 60; 

  
  const relevantCampaign = campaigns
    .filter((c) => c.isOpen || (c.startDate > now && c.startDate <= now + upcomingThreshold))
    .sort((a, b) => a.startDate - b.startDate)[0];

  const activeCampaigns = campaigns.filter((c) => c.isOpen);
  const hasActiveCampaign = activeCampaigns.length > 0;
  const canUpdateProfile = !!relevantCampaign && isEditable;

  const getCampaignName = async (campaign: typeof relevantCampaign) => {
    if (!campaign) return "";
    
    if (campaign.detailsIpfsHash) {
      try {
        const response = await fetch(`https://ipfs.io/ipfs/${campaign.detailsIpfsHash}`);
        const data = await response.json();
        return data.name || `Campaign #${campaign.id}`;
      } catch (error) {
        console.error("Failed to fetch campaign name from IPFS:", error);
      }
    }
    return `Campaign #${campaign.id}`;
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.details?.name || "",
      email: user.details?.email || "",
      dateOfBirth: user.details?.dateOfBirth || 0,
      identityNumber: user.details?.identityNumber || "",
      contactNumber: user.details?.contactNumber || "",
      bio: user.details?.bio || "",
      profileImage: undefined,
      supportiveLinks: user.details?.supportiveLinks || [],
    },
  });

  
  useEffect(() => {
    if (user.details) {
      form.reset({
        name: user.details.name,
        email: user.details.email,
        dateOfBirth: user.details.dateOfBirth,
        identityNumber: user.details.identityNumber,
        contactNumber: user.details.contactNumber,
        bio: user.details.bio,
        profileImage: undefined,
        supportiveLinks: user.details.supportiveLinks,
      });
    }
  }, [user.details, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let profileImageIpfsHash = user.details?.profileImageIpfsHash || "";
      
      
      if (values.profileImage) {
        profileImageIpfsHash = await uploadFile(values.profileImage);
      }
      
      
      await dispatch(
        updateUserDetails({
          name: values.name,
          email: values.email,
          dateOfBirth: values.dateOfBirth,
          identityNumber: values.identityNumber,
          contactNumber: values.contactNumber,
          bio: values.bio || "",
          profileImageIpfsHash,
          supportiveLinks: values.supportiveLinks || [],
        })
      ).unwrap();
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update user details:", error);
      toast.error("Failed to update user details");
    }
  };

  return {
    user,
    form,
    onSubmit,
    isLoading: user.loading,
    isEditable,
    hasActiveCampaign,
    canUpdateProfile,
    relevantCampaign,
    getCampaignName,
    activeCampaigns,
  };
};