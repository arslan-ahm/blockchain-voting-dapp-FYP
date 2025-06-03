import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { getIpfsUrl } from "../../utils/ipfs";
import { formatDate, dateToUnix } from "../../utils/formatters";
import { Role } from "../../types";
import { useProfile } from "./useProfile";
import { VerificationForm } from "../../components/forms/VerificationForm";
import { ImageUpload } from "../../components/ImageUpload";
import { cn } from "../../utils/cn";
import { User } from "lucide-react";
import { Link } from "react-router-dom";

export const Profile = () => {
  const {
    user,
    form,
    onSubmit,
    isLoading,
    canUpdateProfile,
    hasActiveCampaign,
    relevantCampaign,
    getCampaignName,
    activeCampaigns,
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

  if (!user.account) {
    return <div className="text-center text-gray-400 py-12">Please connect your wallet</div>;
  }

  if (user.role === Role.Admin) {
    return (
      <div className="text-center text-gray-400 py-12">
        Admins cannot manage profiles. Visit the{" "}
        <Link to="/admin" className="text-blue-400 hover:underline">
          Admin Dashboard
        </Link>.
      </div>
    );
  }

  return (
    <div ref={profileRef} className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Card className="bg-gray-800 border-gray-700 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-400 flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.details?.profileImageIpfsHash ? getIpfsUrl(user.details.profileImageIpfsHash) : undefined} />
              <AvatarFallback className="bg-gray-700">
                <User />
              </AvatarFallback>
            </Avatar>
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger value="details" className="text-gray-200">
                Update Details
              </TabsTrigger>
              <TabsTrigger value="verification" className="text-gray-200" disabled={!hasActiveCampaign}>
                Request Verification
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              {user.details ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-200">
                      <strong>Name:</strong> {user.details.name}
                    </p>
                    <p className="text-gray-200">
                      <strong>Email:</strong> {user.details.email}
                    </p>
                    <p className="text-gray-200">
                      <strong>Date of Birth:</strong> {formatDate(user.details.dateOfBirth)}
                    </p>
                    <p className="text-gray-200">
                      <strong>Role:</strong> {Object.keys(Role)[user.role]}
                    </p>
                  </div>
                  {canUpdateProfile ? (
                    <>
                      <p className="text-gray-200 font-semibold">
                        Update profile for: {campaignName || "Upcoming Campaign"}
                      </p>
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="space-y-6 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0"
                        >
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel className="text-gray-200">Full Name</FormLabel>
                                <FormControl>
                                  <Input
                                    className={cn(
                                      "bg-gray-700 border-gray-600 text-gray-200",
                                      "focus:ring-blue-400 focus:border-blue-400"
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
                              <FormItem className="col-span-2">
                                <FormLabel className="text-gray-200">Email</FormLabel>
                                <FormControl>
                                  <Input
                                    className={cn(
                                      "bg-gray-700 border-gray-600 text-gray-200",
                                      "focus:ring-blue-400 focus:border-blue-400"
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
                              <FormItem className="col-span-2 sm:col-span-1">
                                <FormLabel className="text-gray-200">Date of Birth</FormLabel>
                                <FormControl>
                                  <DatePicker
                                    selected={field.value ? new Date(field.value * 1000) : null}
                                    onChange={(date: Date | null) => field.onChange(date ? dateToUnix(date.toISOString().split("T")[0]) : 0)}
                                    dateFormat="yyyy-MM-dd"
                                    placeholderText="Select date"
                                    maxDate={new Date()}
                                    minDate={new Date("1900-01-01")}
                                    showYearDropdown
                                    scrollableYearDropdown
                                    className={cn(
                                      "bg-gray-700 border-gray-600 text-gray-200 w-full rounded-md p-2",
                                      "focus:ring-blue-400 focus:border-blue-400"
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
                            name="profileImage"
                            render={({ field: { onChange } }) => (
                              <FormItem className="col-span-2">
                                <FormLabel className="text-gray-200">Profile Image</FormLabel>
                                <FormControl>
                                  <ImageUpload
                                    onChange={onChange}
                                    preview={user.details?.profileImageIpfsHash ? getIpfsUrl(user.details.profileImageIpfsHash) : undefined}
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
                            className={cn(
                              "col-span-2 w-full bg-gradient-to-r from-blue-500 to-purple-500",
                              "hover:from-blue-600 hover:to-purple-600 disabled:opacity-50",
                              "mt-4"
                            )}
                          >
                            {isLoading ? "Updating..." : "Update Details"}
                          </Button>
                        </form>
                      </Form>
                    </>
                  ) : (
                    <p className="text-gray-400">No campaigns nearby. Profile updates are disabled until a campaign is active or upcoming.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-400">No details available. Please update your profile.</p>
                  {canUpdateProfile ? (
                    <>
                      <p className="text-gray-200 font-semibold">
                        Update profile for: {campaignName || "Upcoming Campaign"}
                      </p>
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="space-y-6 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0"
                        >
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel className="text-gray-200">Full Name</FormLabel>
                                <FormControl>
                                  <Input
                                    className={cn(
                                      "bg-gray-700 border-gray-600 text-gray-200",
                                      "focus:ring-blue-400 focus:border-blue-400"
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
                              <FormItem className="col-span-2">
                                <FormLabel className="text-gray-200">Email</FormLabel>
                                <FormControl>
                                  <Input
                                    className={cn(
                                      "bg-gray-700 border-gray-600 text-gray-200",
                                      "focus:ring-blue-400 focus:border-blue-400"
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
                              <FormItem className="col-span-2 sm:col-span-1">
                                <FormLabel className="text-gray-200">Date of Birth</FormLabel>
                                <FormControl>
                                  <DatePicker
                                    selected={field.value ? new Date(field.value * 1000) : null}
                                    onChange={(date: Date | null) => field.onChange(date ? dateToUnix(date.toISOString().split("T")[0]) : 0)}
                                    dateFormat="yyyy-MM-dd"
                                    placeholderText="Select date"
                                    maxDate={new Date()}
                                    minDate={new Date("1900-01-01")}
                                    showYearDropdown
                                    scrollableYearDropdown
                                    className={cn(
                                      "bg-gray-700 border-gray-600 text-gray-200 w-full rounded-md p-2",
                                      "focus:ring-blue-400 focus:border-blue-400"
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
                            name="profileImage"
                            render={({ field: { onChange } }) => (
                              <FormItem className="col-span-2">
                                <FormLabel className="text-gray-200">Profile Image</FormLabel>
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
                            className={cn(
                              "col-span-2 w-full bg-gradient-to-r from-blue-500 to-purple-500",
                              "hover:from-blue-600 hover:to-purple-600 disabled:opacity-50",
                              "mt-4"
                            )}
                          >
                            {isLoading ? "Updating..." : "Update Details"}
                          </Button>
                        </form>
                      </Form>
                    </>
                  ) : (
                    <p className="text-gray-400">No campaigns nearby. Profile updates are disabled until a campaign is active or upcoming.</p>
                  )}
                </div>
              )}
            </TabsContent>
            <TabsContent value="verification">
              {hasActiveCampaign ? (
                <VerificationForm campaignId={Number(activeCampaigns[0]?.campaignId)} />
              ) : (
                <p className="text-gray-400">No active campaigns. Verification requests are disabled.</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};