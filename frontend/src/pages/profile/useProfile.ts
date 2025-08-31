import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateUserDetails, requestVerification, registerForCampaign } from "../../store/thunks/userThunks";
import { usePinata } from "../../hooks/usePinata";
import { Role, type Campaign } from "../../types";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { toast } from "sonner";
import { fetchJsonFromIpfs } from "../../utils/ipfs";
import { useWallet } from "../../hooks/useWallet";

const basicDetailsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  dateOfBirth: z.number().min(1, "Please select a valid date of birth"),
  identityNumber: z.string().min(5, "Identity number must be at least 5 characters").max(20, "Identity number must be less than 20 characters"),
  contactNumber: z.string()
    .min(10, "Contact number must be at least 10 digits")
    .max(15, "Contact number must be less than 15 digits")
    .regex(/^\+?\d{10,15}$/, "Please enter a valid contact number"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  profileImage: z.instanceof(File).optional(),
  supportiveLinks: z.array(z.string().url("Please enter valid URLs")).optional(),
});

const verificationSchema = z.object({
  requestedRole: z.enum(["Voter", "Candidate"]),
  bio: z.string().optional(),
  supportiveLinks: z.array(z.string()).optional(),
  verificationDocument: z.instanceof(File).optional(),
});

export type BasicDetailsFormData = z.infer<typeof basicDetailsSchema>;
export type VerificationFormData = z.infer<typeof verificationSchema>;

export const useProfile = () => {
  const dispatch = useAppDispatch();
  const { uploadFile } = usePinata();
  const user = useAppSelector((state) => state.user);
  const { campaigns } = useAppSelector((state) => state.campaign);
  // Add this line to get publicCampaignId from admin state
  const { publicCampaignId } = useAppSelector((state) => state.admin);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>("");
  const [supportiveLinks, setSupportiveLinks] = useState<string[]>([""]);
  const [isVerificationLoading, setIsVerificationLoading] = useState(false);
  const [isCampaignRegistrationLoading, setIsCampaignRegistrationLoading] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const { signer } = useWallet();
  
  const isEditable = user.role === Role.Unverified || user.role === Role.PendingVerification;

  const now = Math.floor(Date.now() / 1000);
  const upcomingThreshold = 7 * 24 * 60 * 60; // 7 days

  // Get available campaigns for role application
  const availableCampaigns = campaigns
    .filter((c) => {
      // Show campaigns that are open and either:
      // 1. Currently active (started but not ended)
      // 2. Starting within the next 7 days
      const isActive = c.startDate <= now && c.endDate > now;
      const isUpcoming = c.startDate > now && c.startDate <= now + upcomingThreshold;
      return c.isOpen && !c.isDeleted && (isActive || isUpcoming);
    })
    .sort((a, b) => a.startDate - b.startDate);

  // Get selected campaign or fallback to first available
  const selectedCampaign = selectedCampaignId 
    ? availableCampaigns.find(c => c.id === selectedCampaignId)
    : availableCampaigns[0];

  const activeCampaigns = campaigns.filter((c) => c.isOpen && c.startDate <= now && c.endDate > now);
  const upcomingCampaigns = campaigns.filter((c) => 
    c.startDate > now && 
    c.startDate <= now + upcomingThreshold && 
    c.isOpen
  );

  const hasActiveCampaign = activeCampaigns.length > 0;
  const hasUpcomingCampaign = upcomingCampaigns.length > 0;
  const canUpdateProfile = !!selectedCampaign && isEditable;

  const getCampaignName = async (campaign: Campaign) => {
    if (!campaign) return "";
    
    if (campaign.detailsIpfsHash) {
      try {
        const data = await fetchJsonFromIpfs(campaign.detailsIpfsHash);
        if (data && typeof data === 'object' && 'name' in data) {
          return (data.name as string) || campaign.title || `Campaign ${campaign.id}`;
        }
        return campaign.title || `Campaign ${campaign.id}`;
      } catch (error) {
        console.error("Failed to fetch campaign name from IPFS:", error);
        return campaign.title || `Campaign ${campaign.id}`;
      }
    }
    return campaign.title || `Campaign ${campaign.id}`;
  };

  // Basic Details Form
  const basicDetailsForm = useForm<BasicDetailsFormData>({
    resolver: zodResolver(basicDetailsSchema),
    mode: "onSubmit",
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

  // Verification Form
  const verificationForm = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      requestedRole: "Voter",
      bio: "",
      supportiveLinks: [],
    },
  });

  // Watch form values for real-time preview
  const watchedValues = basicDetailsForm.watch();

  // Handle profile image preview
  useEffect(() => {
    if (watchedValues.profileImage) {
      const file = watchedValues.profileImage;
      const url = URL.createObjectURL(file);
      setPreviewImageUrl(url);
      
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewImageUrl("");
    }
  }, [watchedValues.profileImage]);

  // Reset basic details form when user details change
  useEffect(() => {
    if (user.details) {
      basicDetailsForm.reset({
        name: user.details.name,
        email: user.details.email,
        dateOfBirth: user.details.dateOfBirth,
        identityNumber: user.details.identityNumber,
        contactNumber: user.details.contactNumber,
        bio: user.details.bio || "",
        profileImage: undefined,
        supportiveLinks: user.details.supportiveLinks || [],
      });
    }
  }, [user.details, basicDetailsForm]);

  const validateBasicDetailsForm = (): boolean => {
    const values = basicDetailsForm.getValues();
    
    // Check required fields
    if (!values.name?.trim()) {
      toast.error("Name is required");
      return false;
    }
    
    if (!values.email?.trim()) {
      toast.error("Email is required");
      return false;
    }
    
    if (!values.dateOfBirth || values.dateOfBirth === 0) {
      toast.error("Date of birth is required");
      return false;
    }
    
    if (!values.identityNumber?.trim()) {
      toast.error("Identity number is required");
      return false;
    }
    
    if (!values.contactNumber?.trim()) {
      toast.error("Contact number is required");
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Validate contact number
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    if (!phoneRegex.test(values.contactNumber)) {
      toast.error("Please enter a valid contact number");
      return false;
    }

    // Validate supportive links if provided
    if (values.supportiveLinks && values.supportiveLinks.length > 0) {
      const urlRegex = /^https?:\/\/.+/;
      for (const link of values.supportiveLinks) {
        if (link.trim() && !urlRegex.test(link)) {
          toast.error("Please enter valid URLs for supportive links");
          return false;
        }
      }
    }

    return true;
  };

  const onBasicDetailsSubmit = async (values: BasicDetailsFormData) => {
    try {
      // Manual validation before submission
      if (!validateBasicDetailsForm()) {
        return;
      }
  
      let profileImageIpfsHash = user.details?.profileImageIpfsHash || "";
      
      // Upload new profile image if provided
      if (values.profileImage) {
        try {
          profileImageIpfsHash = await uploadFile(values.profileImage);
        } catch (error) {
          console.error("Failed to upload profile image:", error);
          toast.error("Failed to upload profile image");
          return;
        }
      }
      
      const userDetails = {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        dateOfBirth: values.dateOfBirth,
        identityNumber: values.identityNumber.trim(),
        contactNumber: values.contactNumber.trim(),
        bio: values.bio?.trim() || "",
        profileImageIpfsHash,
        supportiveLinks: values.supportiveLinks?.filter(link => link.trim()) || [],
      }
  
      if (!signer) {
        toast.error("Wallet not connected");
        return;
      }
  
      await dispatch(
        updateUserDetails({ details: userDetails, signer })
      ).unwrap();
      
      toast.success("Profile updated successfully");
      
      // Reset the form but keep the image state
      const currentImageFile = basicDetailsForm.getValues('profileImage');
      basicDetailsForm.reset({
        ...userDetails,
        profileImage: currentImageFile, // Keep the current image file
      });
      
    } catch (error) {
      console.error("Failed to update user details:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  // Verification form handlers
  const addSupportiveLink = () => {
    setSupportiveLinks([...supportiveLinks, ""]);
  };

  const removeSupportiveLink = (index: number) => {
    const newLinks = supportiveLinks.filter((_, i) => i !== index);
    setSupportiveLinks(newLinks);
    verificationForm.setValue(
      "supportiveLinks",
      newLinks.filter((link) => link.trim())
    );
  };

  const updateSupportiveLink = (index: number, value: string) => {
    const newLinks = [...supportiveLinks];
    newLinks[index] = value;
    setSupportiveLinks(newLinks);
    verificationForm.setValue(
      "supportiveLinks",
      newLinks.filter((link) => link.trim())
    );
  };

  const onVerificationSubmit = async (verificationValues: VerificationFormData) => {
    setIsVerificationLoading(true);
    try {
      // Validate that basic details are complete first
      if (!validateBasicDetailsForm()) {
        toast.error("Please complete your basic details first");
        return;
      }

      // Validate that a campaign is selected
      if (!selectedCampaignId) {
        toast.error("Please select a campaign first");
        return;
      }
  
      if (!signer) {
        toast.error("Wallet not connected");
        return;
      }
  
      // First, update user details in the contract
      const basicDetailsValues = basicDetailsForm.getValues();
      
      let profileImageIpfsHash = user.details?.profileImageIpfsHash || "";
      
      // Upload new profile image if provided in basic details form
      if (basicDetailsValues.profileImage) {
        try {
          profileImageIpfsHash = await uploadFile(basicDetailsValues.profileImage);
        } catch (error) {
          console.error("Failed to upload profile image:", error);
          toast.error("Failed to upload profile image");
          return;
        }
      }
      
      const userDetails = {
        name: basicDetailsValues.name.trim(),
        email: basicDetailsValues.email.trim().toLowerCase(),
        dateOfBirth: basicDetailsValues.dateOfBirth,
        identityNumber: basicDetailsValues.identityNumber.trim(),
        contactNumber: basicDetailsValues.contactNumber.trim(),
        bio: basicDetailsValues.bio?.trim() || "",
        profileImageIpfsHash,
        supportiveLinks: basicDetailsValues.supportiveLinks?.filter(link => link.trim()) || [],
      };
  
      // Update user details first
      await dispatch(
        updateUserDetails({ details: userDetails, signer })
      ).unwrap();
  
      // Handle verification document upload if provided
      let documentHash = "";
      if (verificationValues.verificationDocument) {
        try {
          documentHash = await uploadFile(verificationValues.verificationDocument);
        } catch (error) {
          console.error("Failed to upload verification document:", error);
          toast.error("Failed to upload verification document");
          return;
        }
      }
  
      // Convert role string to Role enum number
      const roleNumber = verificationValues.requestedRole === "Voter" ? 1 : 2; // Based on your Role enum
  
      // Now request verification
      await dispatch(
        requestVerification({
          role: roleNumber,
          verificationDocHash: documentHash,
          signer
        })
      ).unwrap();

      
      
      verificationForm.reset();
      setSupportiveLinks([""]);
      
    } catch (error) {
      console.error("Error submitting verification request:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to submit verification request");
      }
    } finally {
      setIsVerificationLoading(false);
    }
  };

  const canRegisterForCampaign = useCallback((campaignId: number): boolean => {
  const campaign = campaigns.find(c => c.id === campaignId);
  if (!campaign) return false;
  
  // Check if campaign is deleted or closed
  if (campaign.isDeleted || !campaign.isOpen) return false;
  
  // Check campaign timing
  const now = Math.floor(Date.now() / 1000);
  const isActive = campaign.startDate <= now && campaign.endDate > now;
  const isUpcoming = campaign.startDate > now;
  const hasValidTiming = isActive || isUpcoming;
  
  if (!hasValidTiming) return false;
  
  // User must have approved role (Voter or Candidate) to register for campaigns
  const hasEligibleRole = user.role === Role.Voter || user.role === Role.Candidate;
  
  return hasEligibleRole && hasValidTiming && campaign.isOpen && !campaign.isDeleted;
}, [campaigns, user.role]);

  // Campaign registration function - now uses selected campaign
  const registerForSelectedCampaign = async () => {
    if (!selectedCampaign) {
      toast.error("No campaign selected");
      return;
    }

    // Check if user has proper role for registration
    if (user.role !== Role.Voter && user.role !== Role.Candidate) {
      if (user.role === Role.PendingVerification) {
        toast.error("Please wait for admin approval before registering for campaigns");
      } else if (user.role === Role.Unverified) {
        toast.error("Please complete verification first before registering for campaigns");
      } else {
        toast.error("Invalid role for campaign registration");
      }
      return;
    }

    if (!canRegisterForCampaign(selectedCampaign.id)) {
      toast.error("This campaign is not available for registration");
      return;
    }

    if (!signer) {
      toast.error("Wallet not connected");
      return;
    }

    setIsCampaignRegistrationLoading(true);
    try {
      await dispatch(
        registerForCampaign({
          campaignId: selectedCampaign.id,
          signer
        })
      ).unwrap();

      toast.success(`Successfully registered for campaign as ${user.role === Role.Voter ? 'Voter' : 'Candidate'}`);
    } catch (error) {
      console.error("Failed to register for campaign:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to register for campaign");
      }
    } finally {
      setIsCampaignRegistrationLoading(false);
    }
  };

  // Get campaign metadata for display
  const getCampaignMetadata = (campaign: typeof selectedCampaign) => {
    if (!campaign) return null;
    
    const startDate = new Date(campaign.startDate * 1000);
    const isActive = campaign.startDate <= now && campaign.endDate > now;
    const isUpcoming = campaign.startDate > now;
    const isLive = publicCampaignId === campaign.id; // Add this line
    
    return {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      startDate: startDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      startRelativeTime: isActive ? 'Active' : isUpcoming ? `Starts ${getRelativeTime(startDate)}` : 'Ended',
      status: isActive ? 'Active' : isUpcoming ? 'Upcoming' : 'Ended',
      isLive, // Add this line
      duration: `${Math.ceil((campaign.endDate - campaign.startDate) / (24 * 60 * 60))} days`
    };
  };

  // Helper function for relative time
  const getRelativeTime = (date: Date) => {
    const diffInSeconds = Math.floor((date.getTime() - Date.now()) / 1000);
    const diffInDays = Math.floor(diffInSeconds / (24 * 60 * 60));
    
    if (diffInDays > 0) {
      return `in ${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
    } else if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInSeconds / (60 * 60));
      return diffInHours > 0 ? `in ${diffInHours} hour${diffInHours > 1 ? 's' : ''}` : 'soon';
    }
    return 'recently';
  };

  // Legacy function for backward compatibility
  const registerForCampaignById = async (campaignId: number) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) {
      toast.error("Campaign not found");
      return;
    }
    
    setSelectedCampaignId(campaignId);
    await registerForSelectedCampaign();
  };

  // Get user campaign status
  const getUserCampaignStatus = (campaignId: number) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return null;
    
    return {
      isRegistered: false, // This would need to be fetched from contract
      canRegister: canRegisterForCampaign(campaignId),
      campaign
    };
  };

  // Check if profile completion is needed
  const needsProfileCompletion = () => {
    if (!user.details) return true;
    
    const requiredFields = ['name', 'email', 'dateOfBirth', 'identityNumber', 'contactNumber'];
    return requiredFields.some(field => !user.details?.[field as keyof typeof user.details]);
  };

  return {
    user,
    // Basic Details Form
    basicDetailsForm,
    onBasicDetailsSubmit,
    validateBasicDetailsForm,
    
    // Verification Form
    verificationForm,
    onVerificationSubmit,
    supportiveLinks,
    addSupportiveLink,
    removeSupportiveLink,
    updateSupportiveLink,
    isVerificationLoading,
    
    // Campaign Selection & Registration
    availableCampaigns,
    selectedCampaign,
    selectedCampaignId,
    setSelectedCampaignId,
    registerForSelectedCampaign,
    isCampaignRegistrationLoading,
    canRegisterForCampaign,
    getCampaignMetadata,
    
    // Legacy support
    registerForCampaignById,
    autoRegisterForRelevantCampaign: registerForSelectedCampaign,
    getUserCampaignStatus,
    needsProfileCompletion,
    
    // Common
    isLoading: user.loading,
    isEditable,
    hasActiveCampaign,
    hasUpcomingCampaign,
    canUpdateProfile,
    relevantCampaign: selectedCampaign, // For backward compatibility
    getCampaignName,
    activeCampaigns,
    upcomingCampaigns,
    watchedValues,
    publicCampaignId,
    previewImageUrl, // Add this line
  };
};

// Add this function before the return statement (around line 485)