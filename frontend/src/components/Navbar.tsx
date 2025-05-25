// src/components/Navbar.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WalletConnect } from './WalletConnect';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { getIpfsUrl } from '../utils/ipfs';
import { formatAddress } from '../utils/formatters';
import { LogOut, Menu, User, X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import { clearUser } from '../store/slices/userSlice';
import { fetchUserDetails } from '../store/thunks/userThunks';
import { toast } from 'sonner';
import { useWallet } from '../hooks/useWallet';
import { Role } from '../types';
import { getNavigationLinks } from '../constants/navigation';
import { ROLE } from '../constants/pages';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const { disconnect, account } = useWallet();
  const navigate = useNavigate();

  // Determine if user is authenticated and get their role
  const isAuthenticated = !!user.account;
  const userRole = user.role;

  // Get navigation links based on authentication status and role
  const navLinks = getNavigationLinks(isAuthenticated, userRole);

  useEffect(() => {
    // Only fetch user details if we have an account but no user data yet
    if (account && !user.account && user.role !== Role.Admin) {
      console.log("Wallet connected, fetching user details for:", account);
      dispatch(fetchUserDetails(account));
    }
  }, [account, dispatch, user.account, user.role]);

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out...', user.account);
      
      // Clear user state first
      dispatch(clearUser());
      
      // Disconnect wallet
      await disconnect();
      
      // Close mobile menu
      closeMenu();
      
      // Navigate to home
      navigate('/');
      
      // Show success message
      toast.info('Wallet disconnected');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
    }
  };

  const handleLinkClick = () => {
    closeMenu();
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-400 tracking-tight">
          Blockchain Voting
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-gray-200 hover:text-blue-400 transition-colors duration-200 relative group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <WalletConnect />
          ) : (
            <div className="flex items-center gap-2">
              {/* User Address (Desktop only) */}
              <span className="text-gray-400 text-sm hidden md:block">
                {formatAddress(user.account ?? "")}
              </span>

              {/* User Menu for Non-Admin Users */}
              {userRole !== Role.Admin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 ring ring-blue-400 transition-all cursor-pointer hover:ring-2">
                      <AvatarImage 
                        src={user.details?.profileImageIpfsHash ? getIpfsUrl(user.details.profileImageIpfsHash) : undefined} 
                        alt="Profile"
                      />
                      <AvatarFallback>
                        <User className="h-5 w-5 text-blue-400" />
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-700 text-gray-200 w-48">
                    <DropdownMenuItem asChild>
                      <Link 
                        to="/profile" 
                        className="flex items-center gap-2 hover:bg-gray-700 cursor-pointer w-full"
                      >
                        <User size={16} />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="flex items-center gap-2 hover:bg-gray-700 cursor-pointer text-red-400 hover:text-red-300"
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
                  className="text-gray-200 hover:text-red-400 hover:bg-gray-700"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              )}
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-gray-200">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-gray-800 border-gray-700 w-64">
              <div className="flex flex-col gap-6 mt-6">
                {/* Mobile Navigation Links */}
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={handleLinkClick}
                      className="text-gray-200 hover:text-blue-400 transition-colors text-lg py-2 border-b border-gray-700 last:border-b-0"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Mobile User Section */}
                {!isAuthenticated ? (
                  <div className="pt-4 border-t border-gray-700">
                    <WalletConnect />
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-700 space-y-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={user.details?.profileImageIpfsHash ? getIpfsUrl(user.details.profileImageIpfsHash) : undefined} 
                          alt="Profile"
                        />
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-gray-200 text-sm font-medium">
                          {formatAddress(user.account ?? "")}
                        </span>
                        <span className="text-gray-400 text-xs capitalize">
                          {ROLE[userRole]?.toLowerCase() || 'User'}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Profile Link (Non-Admin only) */}
                    {userRole !== Role.Admin && (
                      <Link 
                        to="/profile" 
                        onClick={handleLinkClick}
                        className="flex items-center gap-2 text-gray-200 hover:text-blue-400 transition-colors text-lg py-2"
                      >
                        <User size={18} />
                        Profile
                      </Link>
                    )}

                    {/* Mobile Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-lg py-2 w-full text-left"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};