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

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const { disconnect, account } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (account && !user.account) {
      console.log("Wallet connected, fetching user details for:", account);
      dispatch(fetchUserDetails(account));
    }
  }, [account, dispatch, user.account]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    console.log('Logging out...', user.account);
    disconnect();
    dispatch(clearUser());
    toast.info('Wallet disconnected');
    setIsOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/campaigns', label: 'Campaigns' },
    ...(user.role === Role.Admin ? [{ to: '/admin', label: 'Dashboard' }] : []),
    ...(user.account && user.role !== Role.Admin ? [{ to: '/profile', label: 'Profile' }] : []),
  ];

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 sticky top-0 z-50">
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
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {!user.account ? (
            <WalletConnect />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm hidden md:block">{formatAddress(user.account)}</span>
              {user.role !== Role.Admin && (
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
              )}
              {user.role === Role.Admin && (
                <Button onClick={handleLogout} variant="ghost" className="text-gray-200 hover:text-blue-400">
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              )}
            </div>
          )}
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
                    {user.role !== Role.Admin && (
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
                      </>
                    )}
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