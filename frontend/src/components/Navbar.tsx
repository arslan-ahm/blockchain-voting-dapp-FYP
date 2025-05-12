import { useState } from 'react';
import { Link } from 'react-router-dom';
import { WalletConnect } from './WalletConnect';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { getIpfsUrl } from '../utils/ipfs';
import { formatAddress } from '../utils/formatters';
import { LogOut, Menu, User, X } from 'lucide-react';
import { useAppSelector } from '../hooks/useRedux';
import { Role } from '../types';
import { useAppDispatch } from '../hooks/useRedux';
import { clearUser } from '../store/slices/userSlice';
import { toast } from 'sonner';
import { useWallet } from '../hooks/useWallet';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const { disconnect } = useWallet();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    console.log('Logging out...', user.account);
    disconnect();
    dispatch(clearUser());
    toast.info('Wallet disconnected');
    setIsOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/campaigns', label: 'Campaigns' },
    ...(user.role === Role.Admin ? [{ to: '/admin', label: 'Dashboard' }] : []),
    ...(user.account ? [{ to: '/profile', label: 'Profile' }] : []),
  ];

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Title (Left) */}
        <Link to="/" className="text-2xl font-bold text-blue-400 tracking-tight">
          Blockchain Voting
        </Link>

        {/* Navigation Links (Center) */}
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

        {/* Wallet Connect / Avatar Dropdown (Right) */}
        <div className="flex items-center gap-4">
          {!user.account ? (
            <WalletConnect />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm hidden md:block">{formatAddress(user.account)}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 ring ring-blue-400 transition-all cursor-pointer">
                    <AvatarImage src={user.details?.profileImageIpfsHash ? getIpfsUrl(user.details.profileImageIpfsHash) : undefined} />
                    <AvatarFallback>
                      <User className="h-5 w-5 text-blue-400" />
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-gray-200 w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-700 cursor-pointer">
                      <User size={16} />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 hover:bg-gray-700 cursor-pointer">
                    <LogOut size={16} />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <Sheet open={isOpen} onOpenChange={toggleMenu}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                {isOpen ? <X className="h-6 w-6 text-gray-200" /> : <Menu className="h-6 w-6 text-gray-200" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-gray-800 border-gray-700 w-64">
              <div className="flex flex-col gap-4 mt-4">
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
                {!user.account ? (
                  <WalletConnect />
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.details?.profileImageIpfsHash ? getIpfsUrl(user.details.profileImageIpfsHash) : undefined} />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-gray-200 hover:text-blue-400">{formatAddress(user.account)}</span>
                    </div>
                    <Link to="/profile" onClick={toggleMenu} className="text-gray-200 hover:text-blue-400 transition-colors text-lg">
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-gray-200 hover:text-blue-400 transition-colors text-lg text-left"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};