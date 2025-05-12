import { Button } from "./ui/button";
import { useWallet } from "../hooks/useWallet";
import { setUser, clearUser } from "../store/slices/userSlice";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Wallet, LogOut } from "lucide-react";
import { useRef } from "react";

export const WalletConnect = () => {
  const { account, provider, signer, connect, disconnect } = useWallet();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const walletButton = containerRef.current?.querySelector('.wallet-button');
    if (walletButton) {
      gsap.fromTo(
        walletButton,
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
      const walletAddress = containerRef.current?.querySelector('.wallet-address');
      if (walletAddress) {
        gsap.fromTo(
          walletAddress,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, delay: 0.2, ease: 'power2.out' }
        );
      }
    }
  }, [user.account]);

  const handleConnect = async () => {
    try {
      await connect();
      dispatch(setUser({ account, provider, signer }));
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error("Failed to connect wallet");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    dispatch(clearUser());
    toast.info("Wallet disconnected");
  };

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center">
      <Button
        variant={user.account ? "outline" : "default"}
        size="lg"
        onClick={user.account ? handleDisconnect : handleConnect}
        className={`wallet-button relative overflow-hidden transition-all duration-300 ${
          user.account
            ? 'border-gray-600 text-gray-200 hover:text-blue-400 px-4'
            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-6'
        }`}
      >
        <span className="flex items-center gap-2">
          {user.account ? (
            <>
              <LogOut size={16} />
              Disconnect
            </>
          ) : (
            <>
              <Wallet size={16} />
              Connect Wallet
            </>
          )}
        </span>
      </Button>
      {user.account && (
        <div className="wallet-address mt-2 text-sm text-gray-400">
          Connected: {formatAddress(user.account)}
        </div>
      )}
    </div>
  );
};