import React from "react";
import { User, Mail, Phone, Calendar, IdCard, FileText, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { getIpfsUrl } from "../utils/ipfs";
import { formatDate } from "../utils/formatters";
import { Role } from "../types";
import { cn } from "../utils/cn";
import type { ProfilePreviewProps } from "../types/profilePreview";
import { getRoleBadgeColor } from "../utils/helpers";


export const ProfilePreview: React.FC<ProfilePreviewProps> = ({
  watchedValues,
  previewImageUrl,
  currentUser,
}) => {
  const getDisplayValue = <T,>(
    newValue: T | undefined | null,
    currentValue: T | undefined | null,
    fallback: string = "Not provided"
  ): T | string => {
    if (newValue !== undefined && newValue !== null && newValue !== "") {
      return newValue;
    }
    if (currentValue !== undefined && currentValue !== null && currentValue !== "") {
      return currentValue;
    }
    return fallback;
  };

  const getImageUrl = (): string | undefined => {
    if (previewImageUrl) return previewImageUrl;
    if (currentUser.details?.profileImageIpfsHash) {
      return getIpfsUrl(currentUser.details.profileImageIpfsHash);
    }
    return undefined;
  };

  const getFormattedDate = (timestamp: number | undefined | null) => {
    if (!timestamp) return "Not provided";
    if (!timestamp || timestamp === 0) return "Not provided";
    return formatDate(timestamp);
  };

  const getRoleDisplay = (role: Role): string => {
    const roleNames = Object.keys(Role);
    return roleNames[role] || "Unknown";
  };

  return (
    <Card className="bg-gray-800 border-gray-700 py-4">
      <CardHeader>
        <CardTitle className="text-lg text-blue-400 flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Image and Basic Info */}
        <div className="text-center">
          <Avatar className="h-28 w-28 mx-auto mb-4 ring-2 ring-blue-400/20">
            <AvatarImage className="object-cover" src={getImageUrl()} />
            <AvatarFallback className="bg-gray-700 text-lg">
              <User className="h-8 w-8 text-blue-400" />
            </AvatarFallback>
          </Avatar>
          
          <h3 className="text-lg font-semibold text-gray-200 mb-2">
            {getDisplayValue(
              watchedValues?.name,
              currentUser?.details?.name,
              "(Your Name)"
            )}
          </h3>
          
          <Badge className={cn("select-none", getRoleBadgeColor(currentUser?.role))}>
            {getRoleDisplay(currentUser?.role)}
          </Badge>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-gray-200 break-all">
                {getDisplayValue(
                  watchedValues?.email,
                  currentUser?.details?.email,
                  "(Your Email)"
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-400">Contact Number</p>
              <p className="text-gray-200">
                {getDisplayValue(
                  watchedValues?.contactNumber,
                  currentUser?.details?.contactNumber,
                  "(Contact Number)"
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-400">Date of Birth</p>
              <p className="text-gray-200">
                {watchedValues?.dateOfBirth && watchedValues?.dateOfBirth !== 0
                  ? getFormattedDate(watchedValues?.dateOfBirth)
                  : getFormattedDate(currentUser?.details?.dateOfBirth)
                }
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <IdCard className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-400">Identity Number</p>
              <p className="text-gray-200">
                {getDisplayValue(
                  watchedValues?.identityNumber,
                  currentUser?.details?.identityNumber,
                  "(Identity Number)"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {(watchedValues?.bio || currentUser?.details?.bio) && (
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-400 mb-2">Bio</p>
                <p className="text-gray-200 text-sm leading-relaxed">
                  {getDisplayValue(
                    watchedValues?.bio,
                    currentUser?.details?.bio,
                    "(No bio available)"
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Supportive Links */}
        {((watchedValues?.supportiveLinks && watchedValues?.supportiveLinks?.length > 0) ||
          (currentUser?.details?.supportiveLinks && currentUser?.details?.supportiveLinks?.length > 0)) && (
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-start gap-3">
              <ExternalLink className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-400 mb-2">Supportive Links</p>
                <div className="space-y-2">
                  {((watchedValues?.supportiveLinks?.length ?? 0) > 0 
                    ? watchedValues.supportiveLinks! 
                    : currentUser?.details?.supportiveLinks || []
                  ).map((link: string, index: number) => (
                    link?.trim() && (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-400 hover:text-blue-300 text-sm break-all transition-colors duration-200"
                      >
                        {link}
                      </a>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Completion Status */}
        <div className="border-t border-gray-700 pt-4">
          <div className="bg-gray-750 rounded-lg p-3">
            <p className="text-sm text-gray-400 mb-2">Profile Completion</p>
            <div className="space-y-1">
              {[
                { label: "Name", completed: !!(watchedValues?.name || currentUser?.details?.name) },
                { label: "Email", completed: !!(watchedValues?.email || currentUser?.details?.email) },
                { label: "Date of Birth", completed: !!(watchedValues?.dateOfBirth || currentUser?.details?.dateOfBirth) },
                { label: "Identity Number", completed: !!(watchedValues?.identityNumber || currentUser?.details?.identityNumber) },
                { label: "Contact Number", completed: !!(watchedValues?.contactNumber || currentUser?.details?.contactNumber) },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      item?.completed ? "bg-green-500" : "bg-gray-500"
                    }`}
                  />
                  <span className={`text-xs ${
                    item.completed ? "text-green-400" : "text-gray-500"
                  }`}>
                    {item?.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};