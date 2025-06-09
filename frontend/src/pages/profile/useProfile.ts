import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateUserDetails, requestVerification, registerForCampaign } from "../../store/thunks/userThunks";
import { usePinata } from "../../hooks/usePinata";
import { Role } from "../../types";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { toast } from "sonner";
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
  const [previewImageUrl, setPreviewImageUrl] = useState<string>("");
  const [supportiveLinks, setSupportiveLinks] = useState<string[]>([""]);
  const [isVerificationLoading, setIsVerificationLoading] = useState(false);
  const [isCampaignRegistrationLoading, setIsCampaignRegistrationLoading] = useState(false);
  const { signer, provider } = useWallet();
  
  const isEditable = user.role === Role.Unverified || user.role === Role.PendingVerification;

  const now = Math.floor(Date.now() / 1000);
  const upcomingThreshold = 7 * 24 * 60 * 60; // 7 days

  // Get relevant campaigns based on user's registration window
  const relevantCampaign = campaigns
    .filter((c) => c.isOpen || (parseInt(c.startDate) > now && parseInt(c.startDate) <= now + upcomingThreshold))
    .sort((a, b) => parseInt(a.startDate) - parseInt(b.startDate))[0];

  const activeCampaigns = campaigns.filter((c) => c.isOpen);
  const upcomingCampaigns = campaigns.filter((c) => 
    parseInt(c.startDate) > now && 
    parseInt(c.startDate) <= now + upcomingThreshold && 
    c.isOpen
  );

  const hasActiveCampaign = activeCampaigns.length > 0;
  const hasUpcomingCampaign = upcomingCampaigns.length > 0;
  const canUpdateProfile = !!relevantCampaign && isEditable;

  // Check if user is already registered for a campaign
  // const isUserRegisteredForCampaign = (campaignId: number) => {
  //   // This would need to be fetched from the contract
  //   // For now, we'll assume it's stored in the campaign state
  //   const campaign = campaigns.find(c => parseInt(c.campaignId) === campaignId);
  //   return campaign?.voters?.includes(user.account) || 
  //          campaign?.candidates?.includes(user.account);
  // };

  // Check if user can register for campaign based on role and timing
  const canRegisterForCampaign = (campaignId: number) => {
    const campaign = campaigns.find(c => parseInt(c.campaignId) === campaignId);
    if (!campaign) return false;

    const campaignStartTime = parseInt(campaign.startDate);
    const campaignEndTime = parseInt(campaign.endDate);
    const isRegistrationPeriod = now < campaignEndTime && 
      (now <= campaignStartTime || 
       (now >= campaignStartTime && now < campaignEndTime));

    // Check if user has a verified role
    const hasValidRole = user.role === Role.Voter || user.role === Role.Candidate;
    
    // Candidates can only register before campaign starts
    const canCandidateRegister = user.role === Role.Candidate ? now < campaignStartTime : true;
    
    return hasValidRole && 
           isRegistrationPeriod && 
           canCandidateRegister && 
          //  !isUserRegisteredForCampaign(campaignId) &&
           campaign.isOpen;
  };

  const getCampaignName = async (campaign: typeof relevantCampaign) => {
    if (!campaign) return "";
    
    if (campaign.detailsIpfsHash) {
      try {
        const response = await fetch(`https://ipfs.io/ipfs/${campaign.detailsIpfsHash}`);
        const data = await response.json();
        return data.name || campaign.title || `Campaign ${campaign.campaignId}`;
      } catch (error) {
        console.error("Failed to fetch campaign name from IPFS:", error);
      }
    }
    return campaign.title || `Campaign ${campaign.campaignId}`;
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
  
      toast.success("Profile updated and verification request submitted successfully");
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

  // Campaign registration function
  const registerForCampaignById = async (campaignId: number) => {
    if (!canRegisterForCampaign(campaignId)) {
      toast.error("You cannot register for this campaign");
      return;
    }

    if (!provider) {
      toast.error("Wallet not connected");
      return;
    }

    setIsCampaignRegistrationLoading(true);
    try {
      await dispatch(
        registerForCampaign({
          campaignId,
          provider
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

  // Auto-register for relevant campaign (if user wants)
  const autoRegisterForRelevantCampaign = async () => {
    if (relevantCampaign && canRegisterForCampaign(parseInt(relevantCampaign.campaignId))) {
      await registerForCampaignById(parseInt(relevantCampaign.campaignId));
    }
  };

  // Get user's registration status for campaigns
  const getUserCampaignStatus = () => {
    const status = {
      canVote: false,
      canCandidate: false,
      registeredCampaigns: [] as number[],
      availableCampaigns: [] as number[],
    };

    campaigns.forEach(campaign => {
      // const isRegistered = isUserRegisteredForCampaign(parseInt(campaign.campaignId));
      const canRegister = canRegisterForCampaign(parseInt(campaign.campaignId));

      // if (isRegistered) {
      //   status.registeredCampaigns.push(parseInt(campaign.campaignId));
      // }

      if (canRegister) {
        status.availableCampaigns.push(parseInt(campaign.campaignId));
      }
    });

    status.canVote = user.role === Role.Voter;
    status.canCandidate = user.role === Role.Candidate;

    return status;
  };

  // Check if user needs to complete profile for campaign participation
  const needsProfileCompletion = () => {
    if (user.role === Role.Unverified || user.role === Role.PendingVerification) {
      return {
        needsBasicDetails: !user.details?.name || !user.details?.email,
        needsVerification: user.role === Role.Unverified,
        message: user.role === Role.Unverified 
          ? "Complete your profile and request verification to participate in campaigns"
          : "Your verification is pending. You'll be able to participate once approved."
      };
    }
    return {
      needsBasicDetails: false,
      needsVerification: false,
      message: ""
    };
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
    
    // Campaign Registration
    registerForCampaignById,
    autoRegisterForRelevantCampaign,
    isCampaignRegistrationLoading,
    canRegisterForCampaign,
    // isUserRegisteredForCampaign,
    getUserCampaignStatus,
    needsProfileCompletion,
    
    // Common
    isLoading: user.loading,
    isEditable,
    hasActiveCampaign,
    hasUpcomingCampaign,
    canUpdateProfile,
    relevantCampaign,
    getCampaignName,
    activeCampaigns,
    upcomingCampaigns,
    watchedValues,
    previewImageUrl,
  };
};