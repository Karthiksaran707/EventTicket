import { useState } from 'react';
import { Wallet, Ticket, LayoutDashboard, Settings, Menu, X, Home, LogOut, RefreshCw, Users, Globe } from 'lucide-react';
import { truncateAddress } from '../utils/web3';
import { ThemeToggle } from './ThemeToggle';
import { useWallet } from '../contexts/WalletContext';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: 'home' | 'myTickets' | 'dashboard' | 'admin') => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  
  const {
    walletAddress,
    isConnected,
    isConnecting,
    chainName,
    connect,
    disconnect,
    reconnect,
    switchWalletAccount
  } = useWallet();

  // Helper to determine network status color
  const getNetworkStatus = (name: string | null) => {
    if (!name) return { color: 'bg-gray-500', label: 'Unknown' };
    const n = name.toLowerCase();
    if (n.includes('local') || n.includes('hardhat')) return { color: 'bg-yellow-500', label: 'Localhost' };
    if (n.includes('testnet') || n.includes('sepolia') || n.includes('goerli')) return { color: 'bg-blue-500', label: 'Testnet' };
    if (n.includes('mainnet')) return { color: 'bg-green-500', label: 'Mainnet' };
    return { color: 'bg-purple-500', label: name };
  };

  const netStatus = getNetworkStatus(chainName);

  const navigationItems = [
    { id: 'home', label: 'Events', icon: Home },
    { id: 'myTickets', label: 'My Tickets', icon: Ticket },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin', label: 'Admin', icon: Settings },
  ];

  const handleNavigate = (page: 'home' | 'myTickets' | 'dashboard' | 'admin') => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  const handleDisconnect = () => {
    disconnect();
    setShowAccountMenu(false);
    setIsMobileMenuOpen(false);
    onNavigate('home');
  };

  const handleReconnect = async () => {
    setShowAccountMenu(false);
    await reconnect();
  };

  const handleSwitchAccount = async () => {
    setShowAccountMenu(false);
    await switchWalletAccount();
  };

  return (
    <>
      {/* Sticky Mobile-First Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 bg-card shadow-sm backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Left: Brand Icon + Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <button
                onClick={() => handleNavigate('home')}
                className="flex items-center gap-2 sm:gap-3 transition-all hover:scale-105 min-w-0"
              >
                <div className="bg-primary p-1.5 sm:p-2 rounded-lg shadow-lg flex-shrink-0">
                  <Ticket className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
                <span className="text-card-foreground font-black text-base sm:text-lg lg:text-xl tracking-tight truncate hidden xs:inline">
                  EventChain
                </span>
              </button>

              {/* Desktop Navigation */}
              {isConnected && (
                <nav className="hidden lg:flex items-center gap-1 xl:gap-2 ml-4">
                  {navigationItems.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => handleNavigate(id as any)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentPage === id
                          ? 'bg-primary/10 text-primary dark:text-primary'
                          : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </nav>
              )}
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Wallet Connection */}
              {isConnected ? (
                <>
                  {/* Desktop: Wallet Info + Account Menu */}
                  <div className="hidden sm:flex items-center gap-2">
                    {/* Network Indicator (New) */}
                    {isConnected && (
                      <div className="hidden md:flex items-center gap-2 bg-muted/50 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-full">
                        <Globe className="w-3 h-3 text-muted-foreground" />
                        <div className={`w-2 h-2 rounded-full ${netStatus.color}`} />
                        <span className="text-xs font-semibold text-foreground">{netStatus.label}</span>
                      </div>
                    )}

                    {/* Account Button with Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowAccountMenu(!showAccountMenu)}
                        className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 px-3 py-2 rounded-lg shadow-sm hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-800 dark:text-green-300 text-sm font-medium">
                          {truncateAddress(walletAddress!)}
                        </span>
                      </button>

                      {/* Account Dropdown Menu */}
                      {showAccountMenu && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowAccountMenu(false)}
                          />
                          <div className="absolute right-0 mt-2 w-56 bg-card border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-muted/50">
                              <p className="text-xs text-muted-foreground font-medium mb-1">Connected Account</p>
                              <p className="text-sm text-card-foreground font-mono break-all">{walletAddress}</p>
                            </div>
                            <div className="p-2">
                              <button
                                onClick={handleSwitchAccount}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-muted transition-colors text-card-foreground"
                              >
                                <Users className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium">Switch Account</span>
                              </button>
                              <button
                                onClick={handleReconnect}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-muted transition-colors text-card-foreground"
                              >
                                <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium">Reconnect</span>
                              </button>
                              <button
                                onClick={handleDisconnect}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                              >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm font-medium">Disconnect</span>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Mobile: Hamburger Menu */}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Toggle menu"
                  >
                    {isMobileMenuOpen ? (
                      <X className="w-6 h-6 text-card-foreground" />
                    ) : (
                      <Menu className="w-6 h-6 text-card-foreground" />
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={connect}
                  disabled={isConnecting}
                  className="flex items-center gap-1.5 sm:gap-2 bg-primary px-3 sm:px-4 py-2 rounded-lg text-primary-foreground hover:bg-primary/90 transition-all font-medium shadow-md text-xs sm:text-sm disabled:opacity-50"
                >
                  <Wallet className="w-4 h-4" />
                  <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Off-Canvas Navigation Drawer */}
      {isConnected && (
        <>
          {/* Overlay */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Drawer */}
          <div
            className={`fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-card border-l border-gray-200 dark:border-gray-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
              isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="bg-primary p-2 rounded-lg">
                    <Ticket className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-card-foreground font-bold text-lg">Menu</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-card-foreground" />
                </button>
              </div>

              {/* Wallet Info in Drawer */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-800 dark:text-green-300 text-sm font-medium">Connected</span>
                </div>
                <div className="text-card-foreground font-mono text-sm break-all bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 mb-2">
                  {walletAddress}
                </div>
                {chainName && (
                  <div className="text-xs text-muted-foreground">
                    Network: <span className="font-medium text-card-foreground">{chainName}</span>
                  </div>
                )}
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-2">
                  {navigationItems.map(({ id, label, icon: Icon }) => (
                    <li key={id}>
                      <button
                        onClick={() => handleNavigate(id as any)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                          currentPage === id
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'text-card-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{label}</span>
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Account Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-muted-foreground font-semibold uppercase mb-3 px-2">Account</p>
                  <button
                    onClick={handleSwitchAccount}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-muted transition-colors text-card-foreground"
                  >
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-medium">Switch Account</span>
                  </button>
                  <button
                    onClick={handleReconnect}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-muted transition-colors text-card-foreground"
                  >
                    <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium">Reconnect</span>
                  </button>
                </div>
              </nav>

              {/* Drawer Footer - Disconnect */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleDisconnect}
                  className="w-full px-4 py-3 rounded-lg border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect Wallet
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}