/**
 * Enhanced Web3 Utilities with Disconnect/Reconnect Support
 */

import {
  saveWalletConnection,
  clearWalletConnection,
  isReturningUser,
  hasAccountChanged,
  shouldAutoReconnect,
  getLastConnectedAccount
} from './walletStorage';

declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Connect wallet with proper permissions handling
 */
export const connectWallet = async (forcePermissions = false): Promise<string | null> => {
  if (typeof window.ethereum === 'undefined') {
    alert('Please install MetaMask to use this application!');
    return null;
  }

  try {
    const returning = isReturningUser();
    
    // For new users or when explicitly requested, ask for permissions
    if (!returning || forcePermissions) {
      console.log('Requesting wallet permissions...');
      
      // Request permissions first (shows account selector)
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [
          {
            eth_accounts: {}
          }
        ]
      });
    }

    // Get accounts
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
      params: [
        {
          eth_accounts: {}
        }
      ]
    });

    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const address = accounts[0];
    
    // Save connection state
    saveWalletConnection(address);
    
    console.log('✅ Wallet connected:', address);
    return address;
    
  } catch (error: any) {
    console.error('Error connecting wallet:', error);
    
    if (error.code === 4001) {
      alert('Please connect to MetaMask.');
    } else if (error.code === -32002) {
      alert('Connection request already pending. Please check MetaMask.');
    } else {
      alert('Error connecting to wallet. Please try again.');
    }
    
    return null;
  }
};

/**
 * Disconnect wallet and clear state
 */
export const disconnectWallet = (): void => {
  clearWalletConnection();
  console.log('✅ Wallet disconnected');
};

/**
 * Reconnect with account switching support
 * Forces permission request to allow account selection
 */
export const reconnectWallet = async (): Promise<string | null> => {
  console.log('Reconnecting wallet with account selector...');
  return await connectWallet(true); // Force permissions = show account selector
};

/**
 * Auto-reconnect on app load (silent, no popup)
 */
export const autoReconnect = async (): Promise<string | null> => {
  if (!shouldAutoReconnect()) {
    return null;
  }

  if (typeof window.ethereum === 'undefined') {
    return null;
  }

  try {
    // Silent check for existing connection
    const accounts = await window.ethereum.request({
      method: 'eth_accounts'
    });

    if (accounts.length > 0) {
      const address = accounts[0];
      const lastAccount = getLastConnectedAccount();
      
      // Check if account changed (user switched in MetaMask)
      if (lastAccount && hasAccountChanged(address)) {
        console.log('⚠️ Account changed detected');
      }
      
      // Update stored address
      saveWalletConnection(address);
      
      console.log('✅ Auto-reconnected:', address);
      return address;
    }
    
    return null;
  } catch (error) {
    console.error('Auto-reconnect failed:', error);
    return null;
  }
};

/**
 * Switch to a different account
 * Opens MetaMask account selector
 */
export const switchAccount = async (): Promise<string | null> => {
  console.log('Opening account switcher...');
  
  try {
    // Request permissions to show account selector
    await window.ethereum.request({
      method: 'wallet_requestPermissions',
      params: [
        {
          eth_accounts: {}
        }
      ]
    });

    // Get the newly selected account
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (accounts.length > 0) {
      const newAddress = accounts[0];
      saveWalletConnection(newAddress);
      console.log('✅ Switched to account:', newAddress);
      return newAddress;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error switching account:', error);
    
    if (error.code === 4001) {
      console.log('User cancelled account switch');
    } else {
      alert('Failed to switch account. Please try again.');
    }
    
    return null;
  }
};

/**
 * Subscribe to account changes
 */
export const subscribeToAccountChanges = (callback: (accounts: string[]) => void) => {
  if (typeof window.ethereum === 'undefined') {
    return null;
  }

  const handleAccountsChanged = (accounts: string[]) => {
    console.log('🔄 Accounts changed:', accounts);
    
    if (accounts.length > 0) {
      const newAddress = accounts[0];
      const lastAccount = getLastConnectedAccount();
      
      if (lastAccount && hasAccountChanged(newAddress)) {
        console.log('Account switched:', lastAccount, '→', newAddress);
        saveWalletConnection(newAddress);
      }
      
      callback(accounts);
    } else {
      // User disconnected from MetaMask
      console.log('⚠️ All accounts disconnected');
      clearWalletConnection();
      callback([]);
    }
  };

  window.ethereum.on('accountsChanged', handleAccountsChanged);

  // Return cleanup function
  return () => {
    if (window.ethereum.removeListener) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    }
  };
};

/**
 * Subscribe to chain changes
 */
export const subscribeToChainChanges = (callback: (chainId: string) => void) => {
  if (typeof window.ethereum === 'undefined') {
    return null;
  }

  const handleChainChanged = (chainId: string) => {
    console.log('🔄 Chain changed:', chainId);
    callback(chainId);
  };

  window.ethereum.on('chainChanged', handleChainChanged);

  // Return cleanup function
  return () => {
    if (window.ethereum.removeListener) {
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };
};

/**
 * Get current connected account (no popup)
 */
export const getCurrentAccount = async (): Promise<string | null> => {
  if (typeof window.ethereum === 'undefined') {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts'
    });

    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

/**
 * Truncate address for display
 */
export const truncateAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Check if MetaMask is installed
 */
export const isMetaMaskInstalled = (): boolean => {
  return typeof window.ethereum !== 'undefined';
};

/**
 * Get network information
 */
export const getNetworkInfo = async (): Promise<{
  chainId: string;
  chainName: string;
} | null> => {
  if (!isMetaMaskInstalled()) return null;

  try {
    const chainId = await window.ethereum.request({
      method: 'eth_chainId'
    });

    const chainNames: { [key: string]: string } = {
      '0x1': 'Ethereum Mainnet',
      '0x5': 'Goerli Testnet',
      '0xaa36a7': 'Sepolia Testnet',
      '0x7a69': 'Hardhat Local',
      '0x539': 'Localhost'
    };

    return {
      chainId,
      chainName: chainNames[chainId] || `Chain ${chainId}`
    };
  } catch (error) {
    console.error('Error getting network info:', error);
    return null;
  }
};