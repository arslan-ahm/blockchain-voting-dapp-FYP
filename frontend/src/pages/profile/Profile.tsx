import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { getIpfsUrl } from "../../utils/ipfs";
import { Role } from "../../types";
import { useProfile } from "./useProfile";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import { BasicDetailsForm } from "../../components/forms/BasicDetailsForm";
import { VerificationRequestForm } from "../../components/forms/VerificationForm";
import { ProfilePreview } from "../../components/ProfilePreview";
import { cn } from "../../utils/cn";
import { getCampaignStatusBadgeColor, mapCampaignStatus } from "../../utils/helpers";

export const Profile = () => {
  const {
    user,
    // Basic Details Form
    basicDetailsForm,
    onBasicDetailsSubmit,
    // Verification Form
    verificationForm,
    onVerificationSubmit,
    supportiveLinks,
    addSupportiveLink,
    removeSupportiveLink,
    updateSupportiveLink,
    isVerificationLoading,
    // Campaign Selection
    availableCampaigns,
    selectedCampaign,
    selectedCampaignId,
    setSelectedCampaignId,
    getCampaignMetadata,
    // Common
    isLoading,
    canUpdateProfile,
    hasActiveCampaign,
    watchedValues,
    previewImageUrl,
    publicCampaignId,
  } = useProfile();

  const profileRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("details");
  // For rejected users, allow resubmission
  const [showResubmit, setShowResubmit] = useState(false);

  useGSAP(() => {
    gsap.from(profileRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
    });
  }, []);

  if (!user.account) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-400 py-12">
          Please connect your wallet
        </div>
      </div>
    );
  }

  if (user.role === Role.Admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-400 py-12">
          Admins cannot manage profiles. Visit the{" "}
          <Link to="/admin" className="text-blue-400 hover:underline">
            Admin Dashboard
          </Link>
          .
        </div>
      </div>
    );
  }

  return (
    <div
      ref={profileRef}
      className="min-h-screen bg-gray-900 py-4 px-4 sm:py-6 sm:px-6 lg:py-12 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Large screens: Grid layout with main content on left, preview on right */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Profile Section - Takes 3 columns on large screens, full width on smaller */}
          <div className="col-span-1 lg:col-span-3">
            <Card className="bg-gray-800 border-gray-700 py-4">
              {hasActiveCampaign && (
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl text-blue-400 flex items-center gap-3 sm:gap-4">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12">
                      <AvatarImage
                        src={
                          user.details?.profileImageIpfsHash
                            ? getIpfsUrl(user.details.profileImageIpfsHash)
                            : undefined
                        }
                      />
                      <AvatarFallback className="bg-gray-700">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                      </AvatarFallback>
                    </Avatar>
                    User Profile
                  </CardTitle>
                </CardHeader>
              )}
              <CardContent className="px-4 sm:px-6">
                {/* Campaign Selection Section - Only show when forms are visible */}
                {user.role === Role.Unverified && canUpdateProfile && availableCampaigns.length > 0 && (
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-blue-400 mb-3 sm:mb-4 flex items-center gap-2">
                      <span className="relative w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </span>
                      Select Campaign
                    </h3>
                    <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">
                      Choose a campaign to participate in. Complete your profile and verification to apply for a role.
                    </p>
                    <Select
                      value={selectedCampaignId?.toString() || ""}
                      onValueChange={(value) => setSelectedCampaignId(Number(value))}
                    >
                      <SelectTrigger className="w-full h-10 sm:h-12 border border-gray-700 hover:border-gray-400 focus:border-blue-500 transition-colors text-gray-300">
                        <SelectValue
                          placeholder="Choose a campaign"
                        >
                          {selectedCampaign && (
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium truncate text-sm sm:text-base">
                                #{getCampaignMetadata(selectedCampaign)?.id} - {getCampaignMetadata(selectedCampaign)?.title}
                              </span>
                              <div className="flex items-center gap-1 sm:gap-2 ml-2">
                                {publicCampaignId === selectedCampaign.id && (
                                  <span className="text-xs bg-primary px-1.5 sm:px-2 py-1 rounded">
                                    LIVE
                                  </span>
                                )}
                                <Badge
                                  variant={getCampaignMetadata(selectedCampaign)?.status === 'Active' ? 'default' : 'secondary'}
                                  className={cn(
                                    "text-xs",
                                    getCampaignStatusBadgeColor(mapCampaignStatus(getCampaignMetadata(selectedCampaign)?.status.toLocaleLowerCase() || ""))
                                  )}
                                >
                                  {getCampaignMetadata(selectedCampaign)?.status}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>

                      <SelectContent className="border border-gray-700 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-md shadow-lg max-h-60 sm:max-h-80 overflow-auto text-gray-300 bg-gray-900">
                        {availableCampaigns.map((campaign) => {
                          const metadata = getCampaignMetadata(campaign);
                          const isCurrentlyPublic = publicCampaignId === campaign.id;
                          return (
                            <SelectItem
                              key={campaign.id}
                              value={campaign.id.toString()}
                              className="cursor-pointer py-2 sm:py-3 px-3 sm:px-4"
                            >
                              <div className="flex flex-col gap-1 w-full">
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-medium truncate text-sm sm:text-base">
                                    #{metadata?.id} - {metadata?.title}
                                  </span>
                                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-2 sm:ml-4">
                                    {isCurrentlyPublic && (
                                      <span className="text-xs bg-primary px-1.5 sm:px-2 py-1 rounded">
                                        LIVE
                                      </span>
                                    )}
                                    <Badge
                                      variant={metadata?.status === 'Active' ? 'default' : 'secondary'}
                                      className={cn(
                                        "text-xs",
                                        metadata?.status === 'Active'
                                          ? "bg-green-600 text-white"
                                          : "bg-blue-600 text-white"
                                      )}
                                    >
                                      {metadata?.status}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-400">
                                  {metadata?.startRelativeTime}
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* User has already registered - Show status */}
                {!canUpdateProfile && user.role !== Role.Unverified && user.role !== Role.PendingVerification && (
                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-green-400 mb-2">
                      Registration Complete
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      <p className="text-gray-300 text-sm sm:text-base">
                        You have successfully registered with the role of{" "}
                        <span className="font-semibold text-green-400">
                          {user.role === Role.Voter ? "Voter" :
                            user.role === Role.Candidate ? "Candidate" : "User"}
                        </span>
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Profile updates are locked once you have been assigned a role.
                        You can view campaigns in the navigation menu.
                      </p>
                    </div>
                  </div>
                )}

                {/* No available campaigns */}
                {availableCampaigns.length === 0 && canUpdateProfile && (
                  <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-amber-400 mb-2">
                      No Available Campaigns
                    </h3>
                    <p className="text-gray-300 text-sm sm:text-base">
                      There are currently no campaigns available for registration.
                      Please check back later when a campaign becomes available.
                    </p>
                  </div>
                )}

                {/* Show forms only if user is Unverified, or if Rejected and resubmit is true. Else show acknowledgement. */}
                {(user.role === Role.Unverified || (user.role === Role.Unverified && showResubmit)) ? (
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-in">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-700 h-10 sm:h-auto">
                      <TabsTrigger
                        value="details"
                        className="text-gray-200 text-xs sm:text-sm lg:text-base py-2 cursor-pointer"
                      >
                        Basic Details
                      </TabsTrigger>
                      <TabsTrigger value="verification" className="text-gray-200 text-xs sm:text-sm lg:text-base py-2 cursor-pointer">
                        Role Verification
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="mt-4 sm:mt-6">
                      <BasicDetailsForm
                        form={basicDetailsForm}
                        onSubmit={onBasicDetailsSubmit}
                        currentProfileImage={
                          user.details?.profileImageIpfsHash
                        }
                        isLoading={isLoading}
                      />
                    </TabsContent>

                    <TabsContent value="verification" className="mt-4 sm:mt-6">
                      <VerificationRequestForm
                        form={verificationForm}
                        onSubmit={onVerificationSubmit}
                        supportiveLinks={supportiveLinks}
                        addSupportiveLink={addSupportiveLink}
                        removeSupportiveLink={removeSupportiveLink}
                        updateSupportiveLink={updateSupportiveLink}
                        isLoading={isVerificationLoading}
                      />
                    </TabsContent>
                  </Tabs>
                ) : (
                  user.role === Role.PendingVerification || user.role === Role.Unverified ? (
                    <div className="space-y-4 sm:space-y-6 mb-4 sm:mb-6">
                      {/* Verification Pending Acknowledgment */}
                      {user.role === Role.PendingVerification && (
                        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 sm:p-6 animate-fade-in">
                          <h3 className="text-base sm:text-lg font-semibold text-blue-400 mb-2 sm:mb-3">
                            Verification Pending
                          </h3>
                          <div className="space-y-2">
                            <p className="text-gray-300 text-sm sm:text-base">
                              Your request has been submitted and is pending admin review. Once verified, you will have access to your requested role.
                            </p>
                            <p className="text-xs sm:text-sm text-gray-400">
                              We'll notify you once the review process is complete. Thank you for your patience.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Request Rejected Acknowledgment */}
                      {user.role === Role.Unverified && !showResubmit && (
                        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 sm:p-6 animate-fade-in">
                          <h3 className="text-base sm:text-lg font-semibold text-red-400 mb-2 sm:mb-3">
                            Request Rejected
                          </h3>
                          <div className="space-y-3 sm:space-y-4">
                            <div className="space-y-2">
                              <p className="text-gray-300 text-sm sm:text-base">
                                Your verification request was rejected by the admin. Please review your details and try again or contact support.
                              </p>
                              <p className="text-xs sm:text-sm text-gray-400">
                                Make sure all your information is accurate and meets the campaign requirements before resubmitting.
                              </p>
                            </div>
                            <button
                              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm sm:text-base font-semibold shadow hover:from-blue-600 hover:to-purple-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                              onClick={() => setShowResubmit(true)}
                            >
                              Request Again
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null
                )}

                {/* Profile locked message */}
                {!canUpdateProfile && (user.role === Role.Unverified || user.role === Role.PendingVerification) && (
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-300 mb-2">
                      Profile Updates Disabled
                    </h3>
                    <p className="text-gray-400 text-sm sm:text-base">
                      Profile updates are currently disabled. This may be because there are no active campaigns or your verification is pending.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Preview - Right side on large screens with sticky positioning */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-6">
              <ProfilePreview
                watchedValues={watchedValues}
                previewImageUrl={previewImageUrl}
                currentUser={user}
              />
            </div>
          </div>
        </div>

        {/* Profile Preview - Below main content on small/medium screens */}
        <div className="block lg:hidden w-full mt-6 sm:mt-8">
          <ProfilePreview
            watchedValues={watchedValues}
            previewImageUrl={previewImageUrl}
            currentUser={user}
          />
        </div>
      </div>
    </div>
  );
};