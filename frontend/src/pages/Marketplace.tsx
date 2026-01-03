import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Set page title
const PAGE_TITLE = 'Marketplace - Discover Data Streams | DePIN Connect';
import { MapView, getRandomCoordinates } from '../components/MapView';
import { DeviceModal } from '../components/DeviceModal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { dePINRegistry } from '../config';
import { 
  MagnifyingGlassIcon, 
  MapIcon, 
  ListBulletIcon,
  CpuChipIcon,
  SignalIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

interface Device {
  deviceId: string;
  owner: string;
  dataSchema: string;
  isActive: boolean;
  registeredAt: number;
  coordinates: [number, number];
  activeSubscribers?: number;
  price?: string;
}

const Marketplace = () => {
  const { provider, isCorrectNetwork, switchToCorrectNetwork, account } = useWallet();
  const { showToast } = useToast();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalDevices, setTotalDevices] = useState(0);
  const [activeStreams, setActiveStreams] = useState(0);

  // Set page title
  useEffect(() => {
    document.title = PAGE_TITLE;
  }, []);

  // Fetch devices from contract
  const fetchDevices = async () => {
    if (!provider) return;

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(
        dePINRegistry.address,
        dePINRegistry.abi,
        provider
      );

      const total = await contract.totalDevices();
      setTotalDevices(Number(total));

      // Fetch devices using events (production approach)
      const devicesList: Device[] = [];
      
      try {
        // Query DeviceRegistered events from the past (last 100,000 blocks)
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 100000);
        
        const filter = contract.filters.DeviceRegistered();
        const events = await contract.queryFilter(filter, fromBlock, 'latest');
        
        console.log(`Found ${events.length} DeviceRegistered events`);
        
        // Get unique device IDs from events
        const deviceIds = new Set<string>();
        events.forEach((event: any) => {
          if (event.args && event.args.deviceId) {
            deviceIds.add(event.args.deviceId);
          }
        });
        
        // Fetch current data for each device
        for (const deviceId of deviceIds) {
          try {
            const deviceData = await contract.getDevice(deviceId);
            if (deviceData.owner !== ethers.ZeroAddress) {
              devicesList.push({
                deviceId,
                owner: deviceData.owner,
                dataSchema: deviceData.dataSchema,
                isActive: deviceData.isActive,
                registeredAt: Number(deviceData.registeredAt),
                coordinates: getRandomCoordinates(),
                activeSubscribers: Math.floor(Math.random() * 10),
                price: '1000000000000000', // 0.001 CRO/sec
              });
            }
          } catch (error) {
            console.error(`Error fetching device ${deviceId}:`, error);
          }
        }
      } catch (eventError) {
        console.error('Error querying events, falling back to sample data:', eventError);
        // Fallback: Try to fetch some hardcoded sample devices for testing
        const sampleDeviceIds = ['weather-station-001', 'sensor-001', 'iot-device-001', 'air-quality-monitor', 'traffic-sensor'];
        
        for (const deviceId of sampleDeviceIds) {
          try {
            const deviceData = await contract.getDevice(deviceId);
            if (deviceData.owner !== ethers.ZeroAddress) {
              devicesList.push({
                deviceId,
                owner: deviceData.owner,
                dataSchema: deviceData.dataSchema,
                isActive: deviceData.isActive,
                registeredAt: Number(deviceData.registeredAt),
                coordinates: getRandomCoordinates(),
                activeSubscribers: Math.floor(Math.random() * 10),
                price: '1000000000000000', // 0.001 CRO/sec
              });
            }
          } catch (error) {
            // Device doesn't exist, skip
          }
        }
      }

      setDevices(devicesList);
      
      // Calculate active streams
      const activeCount = devicesList.filter(d => d.isActive).length;
      setActiveStreams(activeCount);
    } catch (error) {
      console.error('Error fetching devices:', error);
      showToast('Failed to fetch devices', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDevices, 30000);
    return () => clearInterval(interval);
  }, [provider]);

  // Filter devices based on search
  const filteredDevices = devices.filter(device =>
    device.deviceId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeviceClick = (device: Device) => {
    setSelectedDevice(device);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Refresh devices after closing modal in case subscription was made
    setTimeout(() => fetchDevices(), 500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Device Modal */}
      <DeviceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        device={selectedDevice}
      />

      {/* Network Warning Banner */}
      {account && !isCorrectNetwork && (
        <Card className="border-red-500/50 bg-red-500/10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/20 p-2 rounded-lg">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Wrong Network Detected</p>
                <p className="text-gray-400 text-sm">Please switch to Cronos Testnet to subscribe to devices.</p>
              </div>
            </div>
            <Button onClick={switchToCorrectNetwork} variant="danger" size="sm">
              Switch Network
            </Button>
          </div>
        </Card>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 lg:p-12 shadow-2xl">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 animate-slide-up">
            Discover Real-World Data Streams
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Access live IoT sensor data from devices worldwide. Pay only for what you use.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search devices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
              />
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CpuChipIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalDevices}</div>
                  <div className="text-sm text-white/80">Devices Available</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <SignalIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{activeStreams}</div>
                  <div className="text-sm text-white/80">Active Streams</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <GlobeAltIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{devices.length}</div>
                  <div className="text-sm text-white/80">Locations</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">
          {viewMode === 'map' ? 'Map View' : 'List View'}
        </h2>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                viewMode === 'map'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Map</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ListBulletIcon className="w-5 h-5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton variant="rectangle" className="h-[600px]" />
        </div>
      ) : devices.length === 0 ? (
        <Card>
          <EmptyState
            icon={CpuChipIcon}
            title="No Devices Available"
            description="There are currently no devices registered in the marketplace. Check back soon!"
          />
        </Card>
      ) : (
        <>
          {viewMode === 'map' ? (
            <MapView
              devices={filteredDevices}
              isLoading={isLoading}
              onDeviceClick={handleDeviceClick}
              selectedDevice={selectedDevice}
            />
          ) : (
            /* List View */
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDevices.map((device, index) => (
                <Card
                  key={`${device.deviceId}-${index}`}
                  hover
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="p-6 space-y-4">
                    {/* Device Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600/20 rounded-lg">
                          <CpuChipIcon className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {device.deviceId}
                          </h3>
                          <p className="text-sm text-gray-400 font-mono">
                            {device.owner.slice(0, 6)}...{device.owner.slice(-4)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={device.isActive ? 'success' : 'neutral'}>
                        {device.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {/* Data Schema Preview */}
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Data Schema</div>
                      <div className="p-3 bg-gray-900/50 rounded-lg">
                        <code className="text-xs text-gray-300 font-mono">
                          {device.dataSchema.slice(0, 100)}
                          {device.dataSchema.length > 100 && '...'}
                        </code>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                      <div>
                        <div className="text-xs text-gray-400">Price</div>
                        <div className="text-sm font-bold text-indigo-400">
                          0.001 CRO/sec
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">Subscribers</div>
                        <div className="text-sm font-bold text-white">
                          {device.activeSubscribers}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => handleDeviceClick(device)}
                      disabled={!device.isActive}
                    >
                      {device.isActive ? 'View Details' : 'Inactive'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Filter Panel - Future Enhancement */}
      {/* This can be expanded in the future with actual filters */}
    </div>
  );
};

export default Marketplace;
