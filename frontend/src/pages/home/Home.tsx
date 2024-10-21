import { useHome } from "./useHome";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { Button } from "../../components/ui/button";

export const Home = () => {
  const { featuredCampaigns } = useHome();
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(heroRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
    });
  }, []);

  return (
    <div className="min-h-screen text-white">
      <section ref={heroRef} className="container mx-auto py-20 text-center">
        <h1 className="text-5xl py-2 font-bold mb-4 gradient-text">
          Secure, Transparent Voting
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Powered by Blockchain and IPFS for trust and integrity.
        </p>
        <Link to="/campaigns">
          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-lg px-8 py-3">
            Explore Campaigns
          </Button>
        </Link>
      </section>
      <section className="container mx-auto py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCampaigns.map((campaign) => (
            <div key={campaign.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl text-blue-400">Campaign #{campaign.id}</h3>
              <p className="text-gray-300">Status: {campaign.isOpen ? "Open" : "Closed"}</p>
              <Link to="/campaigns">
                <Button variant="outline" className="mt-4 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white">
                  View Details
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};