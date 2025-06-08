import { useEffect, useCallback, useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { useAppDispatch } from './useRedux';
import { setUser, clearUser } from '../store/slices/userSlice';

export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isLoggedOut, setIsLoggedOut] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const connect = useCallback(async () => {
    try {
      if (!window.ethereum) {
        toast.error('Please install MetaMask');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum!);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      console.log("Step 0 - Connected signer:", signer);

      setAccount(accounts[0]);
      setProvider(provider);
      setSigner(signer);
      
      // FIXED: Only store serializable data in Redux
      dispatch(setUser({ 
        account: accounts[0],
        providerConnected: true,
        signerConnected: true
      }));
      
      console.log('Wallet connected:', {
        account: accounts[0],
        hasProvider: !!provider,
        hasSigner: !!signer
      });
      
      toast.success('Wallet connected');
    } catch (error) {
      toast.error('Failed to connect wallet');
      console.error(error);
    }
  }, [dispatch]);

  const disconnect = useCallback(async () => {
    try {
      if (window.ethereum) {
        // Attempt to revoke permissions (MetaMask-specific)
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        });
      }
    } catch (error) {
      console.warn('Failed to revoke MetaMask permissions:', error);
    }

    setAccount(null);
    setProvider(null);
    setSigner(null);
    setIsLoggedOut(true);
    dispatch(clearUser());
    toast.info('Wallet disconnected');
  }, [dispatch]);

  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum!);
        const accounts = await provider.send('eth_accounts', []);
        if (accounts.length > 0 && !isLoggedOut) {
          const signer = await provider.getSigner();
          setAccount(accounts[0]);
          setProvider(provider);
          setSigner(signer);
          
          // FIXED: Only store serializable data in Redux
          dispatch(setUser({ 
            account: accounts[0],
            providerConnected: true,
            signerConnected: true
          }));
          
          console.log('Auto-connected wallet:', {
            account: accounts[0],
            hasProvider: !!provider,
            hasSigner: !!signer
          });
        }
      } catch (error) {
        console.error('Failed to check wallet connection:', error);
      }
    };

    checkConnection();
  }, [dispatch, isLoggedOut]);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (...args: unknown[]) => {
        const accounts = args[0] as string[] | undefined;
        if (!accounts || accounts.length === 0) {
          disconnect();
        } else {
          // Update with new account
          try {
            const provider = new ethers.BrowserProvider(window.ethereum!);
            const signer = await provider.getSigner();
            
            setAccount(accounts[0]);
            setProvider(provider);
            setSigner(signer);
            
            // FIXED: Only store serializable data in Redux
            dispatch(setUser({ 
              account: accounts[0],
              providerConnected: true,
              signerConnected: true
            }));
            
            console.log('Account changed:', accounts[0]);
          } catch (error) {
            console.error('Failed to update account:', error);
          }
        }
      };
      
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        }
      };
    }
  }, [disconnect, dispatch]);

  // Export a function to get current signer for use in thunks
  const getCurrentSigner = useCallback(() => signer, [signer]);

  return { account, provider, signer, connect, disconnect, getCurrentSigner };
};