/**
 * Wallet Connection State Storage
 * Manages connection persistence and returning user detection
 */

const STORAGE_KEY = 'eventchain_wallet_connected';
const LAST_ACCOUNT_KEY = 'eventchain_last_account';
const CONNECTION_TIMESTAMP_KEY = 'eventchain_connection_time';

export interface WalletStorageData {
  isConnected: boolean;
  address: string | null;
  timestamp: number;
}

/**
 * Save wallet connection state
 */
export const saveWalletConnection = (address: string): void => {
  const data: WalletStorageData = {
    isConnected: true,
    address: address.toLowerCase(),
    timestamp: Date.now()
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  localStorage.setItem(LAST_ACCOUNT_KEY, address.toLowerCase());
  localStorage.setItem(CONNECTION_TIMESTAMP_KEY, Date.now().toString());
};

/**
 * Check if user has previously connected
 */
export const isReturningUser = (): boolean => {
  return localStorage.getItem(STORAGE_KEY) !== null;
};

/**
 * Get last connected account
 */
export const getLastConnectedAccount = (): string | null => {
  return localStorage.getItem(LAST_ACCOUNT_KEY);
};

/**
 * Check if auto-reconnect should happen
 * Returns true if user was connected within last 7 days
 */
export const shouldAutoReconnect = (): boolean => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return false;

  try {
    const data: WalletStorageData = JSON.parse(stored);
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return data.isConnected && data.timestamp > sevenDaysAgo;
  } catch {
    return false;
  }
};

/**
 * Clear wallet connection state (disconnect)
 */
export const clearWalletConnection = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LAST_ACCOUNT_KEY);
  localStorage.removeItem(CONNECTION_TIMESTAMP_KEY);
};

/**
 * Check if account has changed
 */
export const hasAccountChanged = (currentAccount: string): boolean => {
  const lastAccount = getLastConnectedAccount();
  if (!lastAccount) return true;
  return lastAccount.toLowerCase() !== currentAccount.toLowerCase();
};

/**
 * Get connection state
 */
export const getConnectionState = (): WalletStorageData | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};