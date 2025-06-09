import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { getIpfsUrl } from "../../utils/ipfs";
import { Role } from "../../types";
import { useProfile } from "./useProfile";
import { User, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { BasicDetailsForm } from "../../components/forms/BasicDetailsForm";
import { VerificationRequestForm } from "../../components/forms/VerificationForm";
import { ProfilePreview } from "../../components/ProfilePreview";

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
    // Common
    isLoading,
    canUpdateProfile,
    hasActiveCampaign,
    relevantCampaign,
    getCampaignName,
    watchedValues,
    previewImageUrl,
  } = useProfile();
  
  const profileRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [campaignName, setCampaignName] = useState("");

  useGSAP(() => {
    gsap.from(profileRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
    });
  }, []);

  useEffect(() => {
    if (relevantCampaign) {
      getCampaignName(relevantCampaign).then(setCampaignName);
    }
  }, [relevantCampaign, getCampaignName]);

  const handleNextTab = () => {
    setActiveTab("verification");
  };

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
          </Link>.
        </div>
      </div>
    );
  }

  return (
    <div ref={profileRef} className="min-h-screen bg-gray-900 py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Profile Section */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700 py-4">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl text-blue-400 flex items-center gap-4">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                    <AvatarImage 
                      src={user.details?.profileImageIpfsHash ? getIpfsUrl(user.details.profileImageIpfsHash) : undefined} 
                    />
                    <AvatarFallback className="bg-gray-700">
                      <User className="h-5 w-5 sm:h-6 sm:w-6" />
                    </AvatarFallback>
                  </Avatar>
                  User Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Campaign Details Display */}
                {canUpdateProfile && campaignName && (
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 sm:p-6 mb-6">
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Campaign Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Campaign Name</p>
                        <p className="text-gray-200 font-medium">{campaignName}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Status</p>
                        <p className="text-gray-200 font-medium">
                          {hasActiveCampaign ? "Active" : "Upcoming"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                    <TabsTrigger value="details" className="text-gray-200 text-sm sm:text-base">
                      Basic Details
                    </TabsTrigger>
                    <TabsTrigger 
                      value="verification" 
                      className="text-gray-200 text-sm sm:text-base" 
                      disabled={!hasActiveCampaign}
                    >
                      Request Role
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="mt-6">
                    {canUpdateProfile ? (
                      <div className="space-y-6">
                        <BasicDetailsForm 
                          form={basicDetailsForm}
                          onSubmit={onBasicDetailsSubmit}
                          isLoading={isLoading}
                          currentProfileImage={user.details?.profileImageIpfsHash}
                        />
                        {hasActiveCampaign && (
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              onClick={handleNextTab}
                              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 transition-all duration-200 text-white flex items-center gap-2"
                            >
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-750 rounded-lg p-4 sm:p-6">
                        <p className="text-gray-400">
                          No campaigns nearby. Profile updates are disabled until a campaign is active or upcoming.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="verification" className="mt-6">
                    {hasActiveCampaign ? (
                      <div className="space-y-6">
                        <VerificationRequestForm 
                          form={verificationForm}
                          onSubmit={onVerificationSubmit}
                          isLoading={isVerificationLoading}
                          supportiveLinks={supportiveLinks}
                          addSupportiveLink={addSupportiveLink}
                          removeSupportiveLink={removeSupportiveLink}
                          updateSupportiveLink={updateSupportiveLink}
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-750 rounded-lg p-4 sm:p-6">
                        <p className="text-gray-400">
                          No active campaigns. Verification requests are disabled.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <ProfilePreview 
                watchedValues={watchedValues}
                previewImageUrl={previewImageUrl}
                currentUser={user}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};