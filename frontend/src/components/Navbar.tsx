// src/components/Navbar.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { WalletConnect } from "./WalletConnect";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { getIpfsUrl } from "../utils/ipfs";
import { formatAddress } from "../utils/formatters";
import { LogOut, Menu, User, X, Vote } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../hooks/useRedux";
import { clearUser } from "../store/slices/userSlice";
import { fetchUserDetails } from "../store/thunks/userThunks";
import { toast } from "sonner";
import { useWallet } from "../hooks/useWallet";
import { Role } from "../types";
import { cn } from "../utils/cn";
import { LANDING_PAGE_SECTIONS } from "../constants/navigation";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const { disconnect, account } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();
  const { provider } = useWallet();

  // Determine if user is authenticated and get their role
  const isAuthenticated = !!user.account;
  const userRole = user.role;
  const isHomePage = location.pathname === "/";

  // Get navigation links based on authentication status and role
  const getAuthenticatedLinks = () => {
    if (userRole === Role.Admin) {
      return [
        { label: "Campaigns", to: "/campaigns" },
        { label: "Admin", to: "/admin" }
      ];
    }
    return [
      { label: "Campaigns", to: "/campaigns" },
      { label: "Profile", to: "/profile" },
    ];
  };

  const handleSmoothScroll = (sectionId: string) => {
    if (!isHomePage) {
      navigate("/", { state: { scrollTo: sectionId } });
      return;
    }

    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    closeMenu();
  };

  useEffect(() => {
    // Handle scroll to section when navigating from another page
    if (isHomePage && location.state?.scrollTo) {
      const sectionId = location.state.scrollTo;
      setTimeout(() => {
        const element = document.querySelector(sectionId);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [isHomePage, location.state]);

  useEffect(() => {
    if (account && !user.account && user.role !== Role.Admin && provider) {
      console.log("Wallet connected, fetching user details for:", account);
      dispatch(fetchUserDetails({ account, provider }));
    }
  }, [account, dispatch, user.account, user.role, provider]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out...", user.account);
      dispatch(clearUser());
      await disconnect();
      closeMenu();
      navigate("/");
      toast.info("Wallet disconnected");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error during logout");
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8",
        "bg-gray-900/80 backdrop-blur-lg border-b border-gray-700/50",
        isScrolled ? "py-3" : "py-5"
      )}
    >
      <div className="max-w-[1540px] container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse flex items-center justify-center">
            <Vote className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl md:text-2xl font-bold text-white">
            Block
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Vote
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center">
          {/* Landing page sections - Always visible */}
          <div className="flex items-center space-x-4">
            {LANDING_PAGE_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSmoothScroll(section.id)}
                className="px-3 py-2 text-sm rounded-md transition-all duration-300 text-gray-300 hover:text-blue-400 relative group"
              >
                {section.label}
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
              </button>
            ))}
          </div>

          {/* Authenticated routes - Show after vertical line if logged in */}
          {isAuthenticated && (
            <div className="flex items-center ml-6 pl-6 border-l border-gray-700/50 space-x-4">
              {getAuthenticatedLinks().map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-3 py-2 text-sm rounded-md transition-all duration-300 text-gray-300 hover:text-blue-400 relative group"
                >
                  {link.label}
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <WalletConnect />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm hidden md:block">
                {formatAddress(user.account ?? "")}
              </span>

              {/* User Menu for Non-Admin Users */}
              {userRole !== Role.Admin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 ring-2 ring-blue-400/50 transition-all cursor-pointer hover:ring-blue-400">
                      <AvatarImage
                        src={
                          user.details?.profileImageIpfsHash
                            ? getIpfsUrl(user.details.profileImageIpfsHash)
                            : undefined
                        }
                        alt="Profile"
                      />
                      <AvatarFallback>
                        <User className="h-5 w-5 text-blue-400" />
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="bg-gray-800/90 backdrop-blur-lg border-gray-700 text-gray-200 pl-2 pr-8"
                    align="end"
                  >
                    <DropdownMenuItem asChild>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 hover:bg-blue-500/10 cursor-pointer w-full"
                      >
                        <User size={16} />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-2 hover:bg-red-500/10 cursor-pointer text-red-400 hover:text-red-300"
                    >
                      <LogOut size={16} />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Admin Logout Button */}
              {userRole === Role.Admin && (
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="text-red-400 bg-red-500/10 rounded-full"
                >
                  <LogOut size={16} />
                  <span className="hidden min-[400px]:inline-block">Logout</span>
                </Button>
              )}
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-gray-300 border border-gray-600 hover:border-gray-500 transition-colors"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-gray-800/95 backdrop-blur-lg border-gray-700/50 w-64"
            >
              <SheetHeader>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Open mobile navigation menu
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-6 mt-6">
                {/* Mobile Navigation Links */}
                <div className="flex flex-col gap-4">
                  {/* Landing page sections - Always visible */}
                  {LANDING_PAGE_SECTIONS.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        handleSmoothScroll(section.id);
                        closeMenu();
                      }}
                      className="px-4 py-2 text-gray-200 hover:text-blue-400 transition-colors text-lg relative group text-left"
                    >
                      {section.label}
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                    </button>
                  ))}

                  {/* Authenticated routes for mobile */}
                  {isAuthenticated && (
                    <>
                      <div className="my-2 border-t border-gray-700/50" />
                      {getAuthenticatedLinks().map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={closeMenu}
                          className="px-4 py-2 text-gray-200 hover:text-blue-400 transition-colors text-lg relative group"
                        >
                          {link.label}
                          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
