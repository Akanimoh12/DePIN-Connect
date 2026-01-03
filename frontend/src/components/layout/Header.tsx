import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const Header = () => {
  const { account, connectWallet, disconnectWallet } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-gray-800/30 backdrop-blur-md sticky top-0 z-50 border-b border-gray-700/50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img 
              src="/logo.svg" 
              alt="DePIN Connect Logo" 
              className="w-10 h-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent-pink bg-clip-text text-transparent">
              DePIN Connect
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Badge variant="info" className="mr-2">
              Cronos Testnet
            </Badge>
            {account ? (
              <div className="flex items-center space-x-3">
                <span className="text-white bg-gray-700/50 px-4 py-2 rounded-lg border border-gray-600">
                  {truncateAddress(account)}
                </span>
                <Button onClick={disconnectWallet} variant="outline" size="sm">
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={connectWallet} variant="primary">
                Connect Wallet
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2 hover:bg-gray-700/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 animate-slide-down">
            <div className="flex justify-center mb-3">
              <Badge variant="info">Cronos Testnet</Badge>
            </div>
            {account ? (
              <div className="space-y-2">
                <div className="text-white bg-gray-700/50 px-4 py-2 rounded-lg text-center border border-gray-600">
                  {truncateAddress(account)}
                </div>
                <Button onClick={disconnectWallet} variant="outline" fullWidth>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={connectWallet} variant="primary" fullWidth>
                Connect Wallet
              </Button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
