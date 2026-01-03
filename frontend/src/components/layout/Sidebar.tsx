import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, RectangleStackIcon, BoltIcon } from '@heroicons/react/24/outline';
import { useWallet } from '../../contexts/WalletContext';
import Badge from '../ui/Badge';

const Sidebar = () => {
  const location = useLocation();
  const { account, provider } = useWallet();
  const [activeCount, setActiveCount] = useState(0);
  
  useEffect(() => {
    if (account && provider) {
      fetchActiveSubscriptionsCount();
    }
  }, [account, provider]);

  const fetchActiveSubscriptionsCount = async () => {
    if (!provider || !account) return;

    try {
      // This is a simplified count - in production, use events or backend
      // For now, we'll show a placeholder
      setActiveCount(0);
    } catch (error) {
      console.error('Error fetching subscription count:', error);
    }
  };

  const navigation = [
    { name: 'Marketplace', href: '/', icon: HomeIcon },
    { name: 'Dashboard', href: '/dashboard', icon: RectangleStackIcon },
    { name: 'My Subscriptions', href: '/subscriptions', icon: BoltIcon, badge: activeCount },
  ];
  
  return (
    <aside className="hidden lg:block w-64 bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6 sticky top-24 h-fit">
      {/* Branding Section */}
      <div className="flex items-center space-x-3 mb-8 pb-6 border-b border-gray-700/50">
        <img 
          src="/logo.svg" 
          alt="DePIN Connect" 
          className="w-8 h-8"
        />
        <div>
          <h3 className="font-semibold text-white">DePIN Connect</h3>
          <p className="text-xs text-gray-400">IoT Data Network</p>
        </div>
      </div>
      
      <div className="flex flex-col space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center justify-between p-3 text-base font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <item.icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="ml-3">{item.name}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <Badge variant="success" className="text-xs ml-2">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Network Status */}
      <div className="mt-8 pt-6 border-t border-gray-700/50">
        <div className="text-sm text-gray-400 mb-2">Network Status</div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <Badge variant="success" className="text-xs">Connected</Badge>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
