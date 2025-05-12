import { useState } from "react";
import { Link } from "react-router-dom";
import { WalletConnect } from "./WalletConnect";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { getIpfsUrl } from "../utils/ipfs";
import { formatAddress } from "../utils/formatters";
import { Menu, X } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { useAppSelector } from "../hooks/useRedux";
import { Role } from "../types";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAppSelector((state) => state.user);
  const navRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(navRef.current, {
      y: -50,
      opacity: 0,
      duration: 0.5,
    });
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    gsap.to(menuRef.current, {
      x: isOpen ? "-100%" : 0,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/campaigns", label: "Campaigns" },
    ...(user.role === Role.Admin ? [{ to: "/admin", label: "Dashboard" }] : []),
    ...(user.account ? [{ to: "/profile", label: "Profile" }] : []),
  ];

  return (
    <nav ref={navRef} className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-400 tracking-tight">
          Blockchain Voting
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-gray-200 hover:text-blue-400 transition-colors duration-200 relative group"
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, { scale: 1.05, duration: 0.2 });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, { scale: 1, duration: 0.2 });
              }}
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          <WalletConnect />
          {user.account && (
            <Link to="/profile">
              <Avatar className="h-8 w-8 hover:ring-2 hover:ring-blue-400 transition-all">
                <AvatarImage src={user.details?.profileImageIpfsHash ? getIpfsUrl(user.details.profileImageIpfsHash) : undefined} />
                <AvatarFallback>{user.account.slice(2, 4).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>
        <Sheet open={isOpen} onOpenChange={toggleMenu}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              {isOpen ? <X className="h-6 w-6 text-gray-200" /> : <Menu className="h-6 w-6 text-gray-200" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-gray-800 border-gray-700 w-64">
            <div ref={menuRef} className="flex flex-col gap-4 mt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={toggleMenu}
                  className="text-gray-200 hover:text-blue-400 transition-colors text-lg"
                >
                  {link.label}
                </Link>
              ))}
              <WalletConnect />
              {user.account && (
                <Link to="/profile" onClick={toggleMenu} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.details?.profileImageIpfsHash ? getIpfsUrl(user.details.profileImageIpfsHash) : undefined} />
                    <AvatarFallback>{user.account.slice(2, 4).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-gray-200 hover:text-blue-400">{formatAddress(user.account)}</span>
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};