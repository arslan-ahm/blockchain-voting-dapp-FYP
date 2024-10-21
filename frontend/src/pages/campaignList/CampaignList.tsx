import { useCampaignList } from "./useCampaignList";

export const CampaignList = () => {
  const { campaigns, loading, error } = useCampaignList();

  if (loading) return <div className="text-center text-gray-400 py-12">Loading campaigns...</div>;
  if (error) return <div className="text-center text-red-400 py-12">Error: {error}</div>;

  return (
    <div className="container mx-auto py-12">
      <h2 className="text-3xl font-bold mb-8 text-center text-blue-400">Active Campaigns</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-gray-800 p-4 rounded-lg text-gray-200">
            <h3>Campaign #{campaign.id}</h3>
            <p>Status: {campaign.isOpen ? "Open" : "Closed"}</p>
            {/* Add more campaign details */}
          </div>
        ))}
      </div>
    </div>
  );
};


// import { useGSAP } from "@gsap/react";
// import gsap from "gsap";
// import { useRef } from "react";
// import { PartyPopper } from "lucide-react";
// import { CampaignCard } from "../../components/campaignCard/CampaignCard";
// import { useCampaignList } from "./useCampaignList";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
// import { formatAddress } from "../../utils/formatters";
// import type { Campaign } from "../../types";

// export const CampaignList = () => {
//   const { campaigns, loading, error, winner, setWinner } = useCampaignList();
//   const dialogRef = useRef<HTMLDivElement>(null);

//   useGSAP(() => {
//     if (winner) {
//       gsap.from(dialogRef.current, {
//         scale: 0,
//         opacity: 0,
//         duration: 0.5,
//         ease: "back.out(1.7)",
//       });
//       gsap.to(dialogRef.current, {
//         keyframes: { scale: [1, 1.05, 1] },
//         duration: 1,
//         repeat: -1,
//         ease: "power1.inOut",
//       });
//       // Simulate confetti poppers
//       gsap.fromTo(
//         ".confetti",
//         { y: -20, opacity: 0 },
//         { y: 20, opacity: 1, stagger: 0.1, duration: 0.5, ease: "power2.out" }
//       );
//     }
//   }, [winner]);

//   if (loading) return <div className="text-center text-gray-400 py-12">Loading campaigns...</div>;
//   if (error) return <div className="text-center text-red-400 py-12">Error: {error}</div>;

//   return (
//     <div className="container mx-auto py-12">
//       <h2 className="text-3xl font-bold mb-8 text-center text-blue-400">Active Campaigns</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {campaigns.map((campaign: Campaign) => (
//           <CampaignCard key={campaign.id} campaign={campaign} />
//         ))}
//       </div>
//       <Dialog open={!!winner} onOpenChange={() => setWinner(null)}>
//         <DialogContent ref={dialogRef} className="bg-gray-800 border-gray-700 text-white">
//           <DialogHeader>
//             <DialogTitle className="text-2xl text-green-400 flex items-center gap-2">
//               <PartyPopper className="h-6 w-6 confetti" />
//               Campaign #{winner?.campaignId} Winner!
//             </DialogTitle>
//           </DialogHeader>
//           <div className="py-4 text-center">
//             <p className="text-lg">Congratulations to:</p>
//             <p className="text-2xl font-bold text-blue-400">{formatAddress(winner?.address || "")}</p>
//             <p className="text-gray-300 mt-2">The campaign has concluded successfully!</p>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

