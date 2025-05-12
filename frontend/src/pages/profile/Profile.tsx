import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { getIpfsUrl } from "../../utils/ipfs";
import { formatDate } from "../../utils/formatters";
import { Role } from "../../types";
import { useProfile } from "./useProfile";
import { VerificationForm } from "../../components/verificationForm/VerificationForm";

export const Profile = () => {
  const { user, form, onSubmit, isLoading, isEditable } = useProfile();
  const profileRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(profileRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
    });
  }, []);

  if (!user.account) {
    return <div className="text-center text-gray-400">Please connect your wallet</div>;
  }

  return (
    <div ref={profileRef} className="container mx-auto py-12">
      <Card className="bg-gray-800 border-gray-700 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-400 flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.details?.profileImageIpfsHash ? getIpfsUrl(user.details.profileImageIpfsHash) : undefined} />
              <AvatarFallback>{user.account.slice(2, 4).toUpperCase()}</AvatarFallback>
            </Avatar>
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.details ? (
            <div className="space-y-4">
              <div>
                <p className="text-gray-200"><strong>Name:</strong> {user.details.name}</p>
                <p className="text-gray-200"><strong>Email:</strong> {user.details.email}</p>
                <p className="text-gray-200"><strong>Date of Birth:</strong> {formatDate(user.details.dateOfBirth)}</p>
                <p className="text-gray-200"><strong>Identity Number:</strong> {user.details.identityNumber}</p>
                <p className="text-gray-200"><strong>Contact Number:</strong> {user.details.contactNumber}</p>
                <p className="text-gray-200"><strong>Bio:</strong> {user.details.bio}</p>
                <p className="text-gray-200"><strong>Role:</strong> {Role[user.role as keyof typeof Role]}</p>
                {user.details.supportiveLinks.length > 0 && (
                  <div>
                    <strong className="text-gray-200">Supportive Links:</strong>
                    <ul className="list-disc pl-5">
                      {user.details.supportiveLinks.map((link: string, index: number) => (
                        <li key={index} className="text-blue-300">
                          <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {isEditable && (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Name</FormLabel>
                          <FormControl>
                            <Input className="bg-gray-700 border-gray-600 text-gray-200" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Email</FormLabel>
                          <FormControl>
                            <Input className="bg-gray-700 border-gray-600 text-gray-200" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Date of Birth (Unix timestamp)</FormLabel>
                          <FormControl>
                            <Input type="number" className="bg-gray-700 border-gray-600 text-gray-200" {...field} />
                          </FormControl>
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
                          <FormLabel className="text-gray-200">Bio</FormLabel>
                          <FormControl>
                            <Input className="bg-gray-700 border-gray-600 text-gray-200" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="profileImage"
                      render={({ field: { onChange } }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Profile Image</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
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
                    <FormField
                      control={form.control}
                      name="supportiveLinks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Supportive Links (comma-separated)</FormLabel>
                          <FormControl>
                            <Input
                              className="bg-gray-700 border-gray-600 text-gray-200"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.split(",").map((link) => link.trim()))}
                              value={(field.value || []).join(", ")}
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
                      {isLoading ? "Updating..." : "Update Details"}
                    </Button>
                  </form>
                </Form>
              )}
              {isEditable && <VerificationForm />}
            </div>
          ) : (
            <p className="text-gray-400">No details available. Please update your profile.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};