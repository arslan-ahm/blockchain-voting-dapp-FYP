import { ethers } from "ethers";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Progress } from "../../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatAddress, formatUnixTimestamp } from "../../utils/formatters";
import { useAdminDashboard } from "./useAdminDashboard";
import { getIpfsUrl } from "../../utils/ipfs";
import { ROLE } from "../../constants/pages";
import { Role } from "../../types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "../../utils/cn";
import { Input } from "../../components/ui/input";
import { DASHBOARD_CONSTANTS, FORM_LABELS, BUTTON_TEXT, TABS } from "../../constants/editor";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import RichTextEditor from "../../components/RichTextEditor";

export const AdminDashboard = () => {
  const {
    campaigns,
    verificationRequests,
    campaignForm,
    onCreateCampaign,
    handleDeleteCampaign,
    handleProcessVerification,
    handleUploadDocument,
    isLoading,
    requestData,
    campaignStats,
    roleRequestStats,
  } = useAdminDashboard();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState(TABS.ALL);
  const [isUploading, setIsUploading] = useState(false);

  useGSAP(() => {
    gsap.from(dashboardRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
    });
  }, []);

  const filteredRequests = verificationRequests.filter((request) => {
    if (activeTab === TABS.ALL) return true;
    if (activeTab === TABS.CANDIDATES) return request.requestedRole === Role.Candidate;
    if (activeTab === TABS.VOTERS) return request.requestedRole === Role.Voter;
    return false;
  });

  const handleUpload = async (contentOrFile: string | File) => {
    const startDate = campaignForm.getValues("startDate");
    const endDate = campaignForm.getValues("endDate");
    let ipfsHash = "";
    
    if (typeof contentOrFile === "string" && contentOrFile.trim()) {
      ipfsHash = await handleUploadDocument(contentOrFile, startDate, endDate, setIsUploading);
    } else if (contentOrFile instanceof File) {
      ipfsHash = await handleUploadDocument("", startDate, endDate, setIsUploading);
      campaignForm.setValue("campaignDocument", contentOrFile);
    }

    if (ipfsHash) {
      campaignForm.setValue("campaignDocument", undefined);
    }
  };

  return (
    <ErrorBoundary>
      <div ref={dashboardRef} className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold mb-10 text-center text-white tracking-tight">
          {DASHBOARD_CONSTANTS.TITLE}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-gray-800 border-gray-600 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-white font-semibold">
                {DASHBOARD_CONSTANTS.VERIFICATION_REQUESTS_TITLE}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={requestData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                  <XAxis dataKey="date" stroke="#e5e7eb" />
                  <YAxis stroke="#e5e7eb" />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", color: "#fff" }} />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Requests" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-600 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-white font-semibold">
                {DASHBOARD_CONSTANTS.CAMPAIGN_PARTICIPANTS_TITLE}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={campaignStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                  <XAxis dataKey="campaignId" stroke="#e5e7eb" />
                  <YAxis stroke="#e5e7eb" />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", color: "#fff" }} />
                  <Legend />
                  <Bar dataKey="voters" fill="#3b82f6" name="Voters" />
                  <Bar dataKey="candidates" fill="#8b5cf6" name="Candidates" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-600 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-white font-semibold">
                {DASHBOARD_CONSTANTS.ROLE_REQUEST_DISTRIBUTION_TITLE}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={TABS.ALL} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 bg-gray-700 rounded-lg p-1">
                  <TabsTrigger
                    value={TABS.ALL}
                    className={cn(
                      "text-white py-2",
                      activeTab === TABS.ALL ? "bg-blue-600 rounded-md shadow-sm" : "text-gray-300 hover:bg-gray-600"
                    )}
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value={TABS.CANDIDATES}
                    className={cn(
                      "text-white py-2",
                      activeTab === TABS.CANDIDATES ? "bg-blue-600 rounded-md shadow-sm" : "text-gray-300 hover:bg-gray-600"
                    )}
                  >
                    Candidates
                  </TabsTrigger>
                  <TabsTrigger
                    value={TABS.VOTERS}
                    className={cn(
                      "text-white py-2",
                      activeTab === TABS.VOTERS ? "bg-blue-600 rounded-md shadow-sm" : "text-gray-300 hover:bg-gray-600"
                    )}
                  >
                    Voters
                  </TabsTrigger>
                </TabsList>
                <TabsContent value={TABS.ALL} className="mt-4">
                  <div className="text-white text-lg">Total: {roleRequestStats.all}</div>
                </TabsContent>
                <TabsContent value={TABS.CANDIDATES} className="mt-4">
                  <div className="text-white text-lg">Candidates: {roleRequestStats.candidates}</div>
                </TabsContent>
                <TabsContent value={TABS.VOTERS} className="mt-4">
                  <div className="text-white text-lg">Voters: {roleRequestStats.voters}</div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="bg-gray-800 border-gray-600 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl text-white font-semibold">Campaign #{campaign.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-white">Start: {formatUnixTimestamp(campaign.startDate)}</p>
                    <p className="text-white">End: {formatUnixTimestamp(campaign.endDate)}</p>
                    <p className="text-white">Status: {campaign.isOpen ? "Open" : "Closed"}</p>
                    <p className="text-white">Winner: {campaign.winner === ethers.ZeroAddress ? "N/A" : formatAddress(campaign.winner)}</p>
                  </div>
                  <Progress
                    value={
                      campaign.isOpen
                        ? ((Date.now() / 1000 - campaign.startDate) / (campaign.endDate - campaign.startDate)) * 100
                        : 100
                    }
                    className="bg-gray-600 h-2"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gray-800 border-gray-600 mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-white font-semibold">
              {DASHBOARD_CONSTANTS.CREATE_CAMPAIGN_TITLE}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...campaignForm}>
              <form onSubmit={campaignForm.handleSubmit(onCreateCampaign)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={campaignForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">{FORM_LABELS.START_DATE}</FormLabel>
                        <FormControl>
                          <DatePicker
                            selected={field.value ? new Date(field.value * 1000) : null}
                            onChange={(date: Date | null) => field.onChange(date ? Math.floor(date.getTime() / 1000) : 0)}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select start date"
                            minDate={new Date()}
                            showYearDropdown
                            scrollableYearDropdown
                            className="bg-gray-700 border-gray-600 text-white w-full rounded-md p-2 focus:ring-blue-400 focus:border-blue-400"
                            wrapperClassName="w-full"
                          />
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
                        <FormLabel className="text-white">{FORM_LABELS.END_DATE}</FormLabel>
                        <FormControl>
                          <DatePicker
                            selected={field.value ? new Date(field.value * 1000) : null}
                            onChange={(date: Date | null) => field.onChange(date ? Math.floor(date.getTime() / 1000) : 0)}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select end date"
                            minDate={new Date()}
                            showYearDropdown
                            scrollableYearDropdown
                            className="bg-gray-700 border-gray-600 text-white w-full rounded-md p-2 focus:ring-blue-400 focus:border-blue-400"
                            wrapperClassName="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={campaignForm.control}
                  name="campaignDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">{FORM_LABELS.CAMPAIGN_RULES}</FormLabel>
                        <FormControl>
                        <RichTextEditor
                          value={field.value as string}
                          onChange={(value: string) => field.onChange(value)}
                          onUpload={handleUpload}
                          isUploading={isUploading}
                          placeholder="Enter campaign rules..."
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
                  {isLoading ? BUTTON_TEXT.CREATING : BUTTON_TEXT.CREATE_CAMPAIGN}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-600 mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-white font-semibold">
              {DASHBOARD_CONSTANTS.MANAGE_CAMPAIGNS_TITLE}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600">
                  <TableHead className="text-white">ID</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="border-gray-600">
                    <TableCell className="text-white">{campaign.id}</TableCell>
                    <TableCell className="text-white">{campaign.isOpen ? "Open" : "Closed"}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        variant="destructive"
                        className="bg-red-500 hover:bg-red-600"
                        disabled={!campaign.isOpen || campaign.endDate <= Math.floor(Date.now() / 1000)}
                      >
                        {BUTTON_TEXT.DELETE}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-600 mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-white font-semibold">
              {DASHBOARD_CONSTANTS.VERIFICATION_REQUESTS_TABLE_TITLE}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600">
                  <TableHead className="text-white">User</TableHead>
                  <TableHead className="text-white">Role</TableHead>
                  <TableHead className="text-white">Document</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.userAddress} className="border-gray-600">
                    <TableCell className="text-white">{formatAddress(request.userAddress)}</TableCell>
                    <TableCell className="text-white">{ROLE[request.requestedRole]}</TableCell>
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
                          <Button className="bg-green-500 hover:bg-green-600">{BUTTON_TEXT.APPROVE}</Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-800 border-gray-600">
                          <DialogHeader>
                            <DialogTitle className="text-white">Approve Verification</DialogTitle>
                          </DialogHeader>
                          <Form {...campaignForm}>
                            <form
                              onSubmit={campaignForm.handleSubmit((values) =>
                                handleProcessVerification(request.userAddress, true, values.feedback ?? "")
                              )}
                              className="space-y-4"
                            >
                              <FormField
                                control={campaignForm.control}
                                name="feedback"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">{FORM_LABELS.FEEDBACK}</FormLabel>
                                    <FormControl>
                                      <Input className="bg-gray-700 border-gray-600 text-white" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">
                                {BUTTON_TEXT.CONFIRM_APPROVAL}
                              </Button>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                            {BUTTON_TEXT.REJECT}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-800 border-gray-600">
                          <DialogHeader>
                            <DialogTitle className="text-white">Reject Verification</DialogTitle>
                          </DialogHeader>
                          <Form {...campaignForm}>
                            <form
                              onSubmit={campaignForm.handleSubmit((values) =>
                                handleProcessVerification(request.userAddress, false, values.feedback ?? "")
                              )}
                              className="space-y-4"
                            >
                              <FormField
                                control={campaignForm.control}
                                name="feedback"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">{FORM_LABELS.FEEDBACK}</FormLabel>
                                    <FormControl>
                                      <Input className="bg-gray-700 border-gray-600 text-white" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button type="submit" className="w-full bg-red-500 hover:bg-red-600">
                                {BUTTON_TEXT.CONFIRM_REJECTION}
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
    </ErrorBoundary>
  );
};