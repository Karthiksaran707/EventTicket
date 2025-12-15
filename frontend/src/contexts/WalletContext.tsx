/**
 * Wallet Context - Global wallet state management
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  connectWallet,
  disconnectWallet,
  reconnectWallet,
  autoReconnect,
  switchAccount,
  subscribeToAccountChanges,
  subscribeToChainChanges,
  getCurrentAccount,
  getNetworkInfo
} from '../utils/web3';

interface WalletContextType {
  // State
  walletAddress: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: string | null;
  chainName: string | null;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
  switchWalletAccount: () => Promise<void>;
  
  // Utilities
  refreshConnection: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<string | null>(null);
  const [chainName, setChainName] = useState<string | null>(null);

  const isConnected = walletAddress !== null;

  // Initialize: Auto-reconnect on mount
  useEffect(() => {
    const init = async () => {
      setIsConnecting(true);
      try {
        const address = await autoReconnect();
        if (address) {
          setWalletAddress(address);
          await updateNetworkInfo();
        }
      } catch (error) {
        console.error('Auto-reconnect error:', error);
      } finally {
        setIsConnecting(false);
      }
    };

    init();
  }, []);

  // Subscribe to account changes
  useEffect(() => {
    const unsubscribe = subscribeToAccountChanges((accounts) => {
      if (accounts.length > 0) {
        const newAddress = accounts[0];
        console.log('Account changed in context:', newAddress);
        setWalletAddress(newAddress);
      } else {
        console.log('Disconnected from MetaMask');
        setWalletAddress(null);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Subscribe to chain changes
  useEffect(() => {
    const unsubscribe = subscribeToChainChanges(async (newChainId) => {
      console.log('Chain changed in context:', newChainId);
      setChainId(newChainId);
      await updateNetworkInfo();
      
      // Optionally reload page on chain change
      // window.location.reload();
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Update network information
  const updateNetworkInfo = async () => {
    const networkInfo = await getNetworkInfo();
    if (networkInfo) {
      setChainId(networkInfo.chainId);
      setChainName(networkInfo.chainName);
    }
  };

  // Connect wallet
  const connect = async () => {
    if (isConnecting) return;

    setIsConnecting(true);
    try {
      const address = await connectWallet(false);
      if (address) {
        setWalletAddress(address);
        await updateNetworkInfo();
      }
    } catch (error) {
      console.error('Connect error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    disconnectWallet();
    setWalletAddress(null);
    setChainId(null);
    setChainName(null);
  };

  // Reconnect with account selector
  const reconnect = async () => {
    if (isConnecting) return;

    setIsConnecting(true);
    try {
      const address = await reconnectWallet();
      if (address) {
        setWalletAddress(address);
        await updateNetworkInfo();
      }
    } catch (error) {
      console.error('Reconnect error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Switch account
  const switchWalletAccount = async () => {
    if (isConnecting) return;

    setIsConnecting(true);
    try {
      const address = await switchAccount();
      if (address) {
        setWalletAddress(address);
        await updateNetworkInfo();
      }
    } catch (error) {
      console.error('Switch account error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Refresh connection (check current state)
  const refreshConnection = async () => {
    try {
      const address = await getCurrentAccount();
      if (address) {
        setWalletAddress(address);
        await updateNetworkInfo();
      } else {
        setWalletAddress(null);
      }
    } catch (error) {
      console.error('Refresh connection error:', error);
    }
  };

  const value: WalletContextType = {
    walletAddress,
    isConnected,
    isConnecting,
    chainId,
    chainName,
    connect,
    disconnect,
    reconnect,
    switchWalletAccount,
    refreshConnection
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};