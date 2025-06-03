import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Check, X, UserCheck } from 'lucide-react';
import { useState } from 'react';
import type { VerificationRequestData } from '../../store/slices/adminSlice';
import { EmptyState } from './EmptyState';

interface VerificationRequestsProps {
  requests: VerificationRequestData[];
  onProcessVerification: (userAddress: string, approved: boolean, feedback: string) => Promise<void>;
}

export const VerificationRequests = ({ requests, onProcessVerification }: VerificationRequestsProps) => {
  const [activeTab, setActiveTab] = useState("all");

  const filteredRequests = requests.filter(request => {
    if (activeTab === "all") return true;
    if (activeTab === "candidates") return request.requestedRole === 1;
    if (activeTab === "voters") return request.requestedRole === 2;
    return false;
  });

  return (
    <Card className="bg-gray-800 border-gray-700">
      {filteredRequests.length !== 0 && (
        <>
          <CardHeader>
            <CardTitle className="text-white">Verification Requests</CardTitle>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="candidates">Candidates</TabsTrigger>
                <TabsTrigger value="voters">Voters</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
        </>
      )}
      <CardContent>
        {filteredRequests.length === 0 ? (
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
                className="p-4 bg-gray-700 rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-white">{request.userAddress}</p>
                  <p className="text-sm text-gray-400">
                    {request.requestedRole === 1 ? 'Candidate' : 'Voter'} Application
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onProcessVerification(request.userAddress, true, '')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onProcessVerification(request.userAddress, false, '')}
                    variant="destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 