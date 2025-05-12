import { Button } from './ui/button';
import { useWallet } from '../hooks/useWallet';
import { setUser } from '../store/slices/userSlice';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { Wallet } from 'lucide-react';

export const WalletConnect = () => {
  const { account, connect } = useWallet();
  const dispatch = useAppDispatch();
  const isConnecting = useAppSelector((state) => state.user.loading);

  const handleConnect = async () => {
    try {
      await connect();
      dispatch(setUser({ account }));
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className={`bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 px-6 ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isConnecting ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Connecting...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Wallet size={16} />
          Connect Wallet
        </span>
      )}
    </Button>
  );
};