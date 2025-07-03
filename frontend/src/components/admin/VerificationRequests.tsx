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
      <Card className="bg-gray-800 border-gray-700">
        {requests.length > 0 && (
          <CardHeader>
            <CardTitle className="text-white mt-4">Verification Requests</CardTitle>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="candidates">Candidates</TabsTrigger>
                <TabsTrigger value="voters">Voters</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
        )}
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <EmptyState
              icon={UserCheck}
              title="No Verification Requests"
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
                  className="p-6 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Profile Image */}
                      <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                        {request.userInfo?.profileImageIpfsHash ? (
                          <img
                            src={`https://gateway.pinata.cloud/ipfs/${request.userInfo.profileImageIpfsHash}`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-semibold text-white text-lg">
                            {request.userInfo?.name || request.userName || "Unknown User"}
                          </h3>
                          <Badge 
                            className={cn(
                              "select-none text-xs",
                              getRoleBadgeColor(request.requestedRole as Role)
                            )}
                          >
                            {getRoleDisplay(request.requestedRole as Role)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-1">
                          {makeAccountShort(request.userAddress)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Requested on {formatTimestamp(request.requestTimestamp)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(request)}
                        className="bg-gray-600 hover:bg-gray-500 border-gray-500 text-white"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onProcessVerification(request.userAddress, true, '')}
                        className="bg-primary text-white"
                        disabled={isProcessing}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onProcessVerification(request.userAddress, false, '')}
                        variant="destructive"
                        disabled={isProcessing}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Verification Request Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* User Profile Section */}
              <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                  {selectedRequest.userInfo?.profileImageIpfsHash ? (
                    <img
                      src={`https://gateway.pinata.cloud/ipfs/${selectedRequest.userInfo.profileImageIpfsHash}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedRequest.userInfo?.name || selectedRequest.userName || "Unknown User"}
                  </h2>
                  <p className="text-gray-400">{selectedRequest.userAddress}</p>
                  <Badge 
                    className={cn(
                      "select-none mt-2",
                      getRoleBadgeColor(selectedRequest.requestedRole as Role)
                    )}
                  >
                    {getRoleDisplay(selectedRequest.requestedRole as Role)}
                  </Badge>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedRequest.userInfo?.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Email:</span>
                    <span className="text-white">{selectedRequest.userInfo.email}</span>
                  </div>
                )}
                
                {selectedRequest.userInfo?.contactNumber && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Phone:</span>
                    <span className="text-white">{selectedRequest.userInfo.contactNumber}</span>
                  </div>
                )}
                
                {selectedRequest.userInfo?.dateOfBirth && selectedRequest.userInfo.dateOfBirth > 0 && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Date of Birth:</span>
                    <span className="text-white">
                      {new Date(selectedRequest.userInfo.dateOfBirth * 1000).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {selectedRequest.userInfo?.identityNumber && (
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Identity Number:</span>
                    <span className="text-white">{selectedRequest.userInfo.identityNumber}</span>
                  </div>
                )}
              </div>

              {/* Bio Section */}
              {selectedRequest.userInfo?.bio && (
                <div className="p-4 bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">Bio</h3>
                  <p className="text-gray-300">{selectedRequest.userInfo.bio}</p>
                </div>
              )}

              {/* Supportive Links */}
              {selectedRequest.userInfo?.supportiveLinks && selectedRequest.userInfo.supportiveLinks.length > 0 && (
                <div className="p-4 bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">Supportive Links</h3>
                  <div className="space-y-2">
                    {selectedRequest.userInfo.supportiveLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>{link}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Request Information */}
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-white mb-2">Request Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Request Date:</span>
                    <span className="text-white">{formatTimestamp(selectedRequest.requestTimestamp)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-white">
                      {selectedRequest.status === 0 ? "Pending" : "Processed"}
                    </span>
                  </div>
                  {selectedRequest.verificationDocIpfsHash && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Verification Document:</span>
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${selectedRequest.verificationDocIpfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600">
                <Button
                  onClick={() => {
                    onProcessVerification(selectedRequest.userAddress, false, '');
                    setIsDetailsOpen(false);
                  }}
                  variant="destructive"
                  disabled={isProcessing}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    onProcessVerification(selectedRequest.userAddress, true, '');
                    setIsDetailsOpen(false);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isProcessing}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};