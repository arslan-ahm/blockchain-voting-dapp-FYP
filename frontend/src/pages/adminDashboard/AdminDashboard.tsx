import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { useAdminDashboard } from "./useAdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { getIpfsUrl } from "../../utils/ipfs";
import { formatAddress } from "../../utils/formatters";
import { Role, type Campaign, type VerificationRequest } from "../../types";

export const AdminDashboard = () => {
  const {
    campaigns,
    verificationRequests,
    campaignForm,
    onCreateCampaign,
    handleDeleteCampaign,
    handleProcessVerification,
    isLoading,
  } = useAdminDashboard();
  const dashboardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(dashboardRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
    });
  }, []);

  return (
    <div ref={dashboardRef} className="container mx-auto py-12">
      <h2 className="text-3xl font-bold mb-8 text-center text-blue-400">Admin Dashboard</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-blue-400">Create Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...campaignForm}>
              <form onSubmit={campaignForm.handleSubmit(onCreateCampaign)} className="space-y-6">
                <FormField
                  control={campaignForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Start Date (Unix timestamp)</FormLabel>
                      <FormControl>
                        <Input type="number" className="bg-gray-700 border-gray-600 text-gray-200" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={campaignForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">End Date (Unix timestamp)</FormLabel>
                      <FormControl>
                        <Input type="number" className="bg-gray-700 border-gray-600 text-gray-200" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={campaignForm.control}
                  name="detailsIpfsHash"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Details IPFS Hash</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-gray-700 border-gray-600 text-gray-200"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
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
                  {isLoading ? "Creating..." : "Create Campaign"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-blue-400">Manage Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-200">ID</TableHead>
                  <TableHead className="text-gray-200">Status</TableHead>
                  <TableHead className="text-gray-200">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign: Campaign) => (
                  <TableRow key={campaign.id} className="border-gray-700">
                    <TableCell className="text-gray-200">{campaign.id}</TableCell>
                    <TableCell className="text-gray-200">{campaign.isOpen ? "Open" : "Closed"}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        variant="destructive"
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-gray-800 border-gray-700 mt-8">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">Verification Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-200">User</TableHead>
                <TableHead className="text-gray-200">Role</TableHead>
                <TableHead className="text-gray-200">Document</TableHead>
                <TableHead className="text-gray-200">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verificationRequests.map((request: VerificationRequest) => (
                <TableRow key={request.userAddress} className="border-gray-700">
                  <TableCell className="text-gray-200">{formatAddress(request.userAddress)}</TableCell>
                  <TableCell className="text-gray-200">{Role[request.requestedRole]}</TableCell>
                  <TableCell>
                    <a
                      href={getIpfsUrl(request.verificationDocIpfsHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      View Document
                    </a>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-green-500 hover:bg-green-600">Approve</Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-800 border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-blue-400">Approve Verification</DialogTitle>
                        </DialogHeader>
                        <Form {...campaignForm}>
                          <form
                            onSubmit={campaignForm.handleSubmit((values: { feedback: string }) =>
                              handleProcessVerification(request.userAddress, true, values.feedback)
                            )}
                            className="space-y-4"
                          >
                            <FormField
                              control={campaignForm.control}
                              name="feedback"
                              render={({ field }: { field: { value: string; onChange: (value: string) => void } }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-200">Feedback</FormLabel>
                                  <FormControl>
                                    <Input
                                      className="bg-gray-700 border-gray-600 text-gray-200"
                                      value={field.value}
                                      onChange={(e) => field.onChange(e.target.value)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="submit"
                              className="w-full bg-green-500 hover:bg-green-600"
                            >
                              Confirm Approval
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-800 border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-blue-400">Reject Verification</DialogTitle>
                        </DialogHeader>
                        <Form {...campaignForm}>
                          <form
                            onSubmit={campaignForm.handleSubmit((values: { feedback: string }) =>
                              handleProcessVerification(request.userAddress, false, values.feedback)
                            )}
                            className="space-y-4"
                          >
                            <FormField
                              control={campaignForm.control}
                              name="feedback"
                              render={({
                                field,
                              }: {
                                field: {
                                  value: string;
                                  onChange: (value: string) => void;
                                };
                              }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-200">Feedback</FormLabel>
                                  <FormControl>
                                    <Input
                                      className="bg-gray-700 border-gray-600 text-gray-200"
                                      value={field.value}
                                      onChange={(e) => field.onChange(e.target.value)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="submit"
                              className="w-full bg-red-500 hover:bg-red-600"
                            >
                              Confirm Rejection
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};