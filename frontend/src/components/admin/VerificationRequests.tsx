import { useState } from 'react';
import { Check, X, UserCheck, Eye, User, Calendar, Phone, Mail, FileText, ExternalLink } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { EmptyState } from './EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Role, type VerificationRequestData } from '../../types';
import type { VerificationRequestsProps } from '../../types/verificationRequests';
import { getRoleBadgeColor } from '../../utils/helpers';

export const VerificationRequests = ({
  requests,
  onProcessVerification,
  isLoading = false,
  isProcessing = false
}: VerificationRequestsProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequestData | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const getRoleDisplay = (role: Role): string => {
    switch (role) {
      case Role.Candidate:
        return "Candidate";
      case Role.Voter:
        return "Voter";
      case Role.PendingVerification:
        return "Pending Verification";
      case Role.Unverified:
        return "Unverified";
      case Role.Admin:
        return "Admin";
      default:
        return "Unknown";
    }
  };

  const filteredRequests = requests.filter(request => {
    if (activeTab === "all") return true;
    if (activeTab === "candidates") return request.requestedRole === 2; // Candidates have role 2
    if (activeTab === "voters") return request.requestedRole === 1; // Voters have role 1
    return false;
  });

  const handleViewDetails = (request: VerificationRequestData) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const makeAccountShort = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  console.log(requests);

  return (
    <>
      <Card className="bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white mt-4">Verification Requests</CardTitle>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-gray-700 text-white">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
              <TabsTrigger value="voters">Voters</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <EmptyState
              icon={UserCheck}
              title={`No ${activeTab === "all" ? '' : activeTab === "candidates" ? "Candidate" : "Voter"} Requests`}
              description={
                activeTab === "all"
                  ? "There are no pending verification requests at the moment."
                  : `There are no pending ${activeTab === "candidates" ? "candidate" : "voter"} verification requests.`
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request.userAddress}
                  className="p-4 sm:p-6 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                      {/* Profile Image */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {request.userInfo?.profileImageIpfsHash ? (
                          <img
                            src={`https://gateway.pinata.cloud/ipfs/${request.userInfo.profileImageIpfsHash}`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                          <h3 className="font-semibold text-white text-base sm:text-lg truncate">
                            {request.userInfo?.name || request.userName || "Unknown User"}
                          </h3>
                          <Badge
                            className={cn(
                              "select-none text-xs w-fit",
                              getRoleBadgeColor(request.requestedRole as Role)
                            )}
                          >
                            {getRoleDisplay(request.requestedRole as Role)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-1 font-mono">
                          {makeAccountShort(request.userAddress)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Requested on {formatTimestamp(request.requestTimestamp)}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(request)}
                        className="bg-gray-600 hover:bg-gray-500 border-gray-500 text-white text-xs sm:text-sm"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Details</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onProcessVerification(request.userAddress, true, '')}
                        className="bg-primary text-white px-2 sm:px-3"
                        disabled={isProcessing}
                      >
                        <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onProcessVerification(request.userAddress, false, '')}
                        variant="destructive"
                        className='btn-red px-2 sm:px-3'
                        disabled={isProcessing}
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fully Responsive User Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-gray-800 text-white shadow-2xl
          w-[95vw] max-w-4xl 
          h-[90vh] max-h-[90vh] 
          p-0 
          overflow-hidden 
          rounded-2xl sm:rounded-3xl
          mx-auto
          sm:w-[90vw] 
          md:w-[80vw] 
          lg:w-[70vw]
          xl:max-w-4xl animate-fade-in border-0">
          {/* Fixed Header */}
          <DialogHeader className="p-4 sm:p-6 border-b border-gray-700 flex-shrink-0 bg-gray-800">
            <DialogTitle className="text-lg sm:text-2xl font-bold tracking-wide text-blue-200 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-blue-400" />
              Verification Request Details
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {selectedRequest && (
              <div className="space-y-4 sm:space-y-6">
                {/* User Profile Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-gray-700 rounded-lg">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {selectedRequest.userInfo?.profileImageIpfsHash ? (
                      <img
                        src={`https://gateway.pinata.cloud/ipfs/${selectedRequest.userInfo.profileImageIpfsHash}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-blue-100 mb-1 break-words">
                      {selectedRequest.userInfo?.name || selectedRequest.userName || "Unknown User"}
                    </h2>
                    <p className="text-blue-300 text-sm sm:text-base font-mono break-all">
                      {selectedRequest.userAddress}
                    </p>
                    <Badge
                      className={cn(
                        "select-none mt-2 text-xs bg-gradient-to-r from-blue-700 to-purple-700 text-white border-0 shadow",
                        getRoleBadgeColor(selectedRequest.requestedRole as Role)
                      )}
                    >
                      {getRoleDisplay(selectedRequest.requestedRole as Role)}
                    </Badge>
                  </div>
                </div>

                {/* Basic Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {selectedRequest.userInfo?.email && (
                    <div className="flex items-start sm:items-center space-x-2 p-3 bg-gray-700/60 rounded-lg">
                      <Mail className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm text-blue-300 block">Email:</span>
                        <span className="text-white text-sm break-all">{selectedRequest.userInfo.email}</span>
                      </div>
                    </div>
                  )}

                  {selectedRequest.userInfo?.contactNumber && (
                    <div className="flex items-start sm:items-center space-x-2 p-3 bg-gray-700/60 rounded-lg">
                      <Phone className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm text-blue-300 block">Phone:</span>
                        <span className="text-white text-sm">{selectedRequest.userInfo.contactNumber}</span>
                      </div>
                    </div>
                  )}

                  {selectedRequest.userInfo?.dateOfBirth && selectedRequest.userInfo.dateOfBirth > 0 && (
                    <div className="flex items-start sm:items-center space-x-2 p-3 bg-gray-700/60 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm text-blue-300 block">Date of Birth:</span>
                        <span className="text-white text-sm">
                          {new Date(selectedRequest.userInfo.dateOfBirth * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedRequest.userInfo?.identityNumber && (
                    <div className="flex items-start sm:items-center space-x-2 p-3 bg-gray-700/60 rounded-lg">
                      <FileText className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm text-blue-300 block">Identity Number:</span>
                        <span className="text-white text-sm break-all">{selectedRequest.userInfo.identityNumber}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bio Section */}
                {selectedRequest.userInfo?.bio && (
                  <div className="p-3 sm:p-4 bg-gray-700 rounded-lg">
                    <h3 className="font-semibold text-blue-200 mb-2 text-sm sm:text-base">Bio</h3>
                    <p className="text-blue-100 text-sm sm:text-base leading-relaxed break-words">
                      {selectedRequest.userInfo.bio}
                    </p>
                  </div>
                )}

                {/* Supportive Links */}
                {selectedRequest.userInfo?.supportiveLinks && selectedRequest.userInfo.supportiveLinks.length > 0 && (
                  <div className="p-3 sm:p-4 bg-gray-700 rounded-lg">
                    <h3 className="font-semibold text-blue-200 mb-2 text-sm sm:text-base">Supportive Links</h3>
                    <div className="space-y-2">
                      {selectedRequest.userInfo.supportiveLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start space-x-2 text-blue-300 hover:text-white text-sm break-all p-2 rounded bg-gradient-to-r from-blue-800/60 to-blue-600/40 hover:from-blue-700/80 hover:to-blue-500/60 transition-colors shadow"
                        >
                          <ExternalLink className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-200" />
                          <span className="break-all">{link}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Request Information */}
                <div className="p-3 sm:p-4 bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-blue-200 mb-3 text-sm sm:text-base">Request Information</h3>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-blue-300 text-sm">Request Date:</span>
                      <span className="text-white text-sm">{formatTimestamp(selectedRequest.requestTimestamp)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-blue-300 text-sm">Status:</span>
                      <span className="text-white text-sm">
                        {selectedRequest.status === 0 ? "Pending" : "Processed"}
                      </span>
                    </div>
                    {selectedRequest.verificationDocIpfsHash && (
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 items-center">
                        <span className="text-blue-300 text-sm">Verification Document:</span>
                        <a
                          href={`https://gateway.pinata.cloud/ipfs/${selectedRequest.verificationDocIpfsHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-700 to-purple-700 text-white font-semibold shadow hover:from-blue-800 hover:to-purple-800 transition-all duration-200 border-0"
                        >
                          <ExternalLink className="w-4 h-4 text-white" />
                          View Document
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fixed Footer with Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-700 flex-shrink-0 bg-gray-800">
            <Button
              onClick={() => {
                if (selectedRequest) {
                  onProcessVerification(selectedRequest.userAddress, false, '');
                }
                setIsDetailsOpen(false);
              }}
              variant="destructive"
              className='btn-red w-full sm:w-auto shadow-lg'
              disabled={isProcessing}
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => {
                if (selectedRequest) {
                  onProcessVerification(selectedRequest.userAddress, true, '');
                }
                setIsDetailsOpen(false);
              }}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto shadow-lg"
              disabled={isProcessing}
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};