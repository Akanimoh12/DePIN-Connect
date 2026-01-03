import { useState, useEffect, useRef } from 'react';
import * as React from 'react';
import { ethers } from 'ethers';

// Set page title
const PAGE_TITLE = 'Provider Dashboard | DePIN Connect';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { dePINRegistry } from '../config';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  CurrencyDollarIcon, 
  CalendarIcon 
} from '@heroicons/react/24/outline';

interface Device {
  deviceId: string;
  owner: string;
  dataSchema: string;
  isActive: boolean;
  registeredAt: number;
}

const Dashboard = () => {
  const { account, provider } = useWallet();
  const { showToast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);
  
  const [deviceId, setDeviceId] = useState('');
  const [dataSchema, setDataSchema] = useState('');
  const [userDevices, setUserDevices] = useState<Device[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isFetchingDevices, setIsFetchingDevices] = useState(true);

  // Stats state
  const [stats, setStats] = useState({
    totalDevices: 0,
    activeStreams: 0,
    totalEarned: '0.00',
    thisMonth: '0.00'
  });

  // Set page title
  useEffect(() => {
    document.title = PAGE_TITLE;
  }, []);

  const fetchUserDevices = async () => {
    if (!provider || !account) return;
    
    setIsFetchingDevices(true);
    try {
      const contract = new ethers.Contract(dePINRegistry.address, dePINRegistry.abi, provider);
      
      // Fetch all devices for this provider
      // Note: This is simplified - in production, use events or indexed database
      const deviceIds: string[] = [];
      const devicesData: Device[] = [];
      
      // Try to fetch devices from providerDevices mapping
      // This is a limitation - we'd need events to track all device IDs properly
      try {
        let i = 0;
        while (i < 100) { // Limit to 100 for safety
          const deviceIdFromContract = await contract.providerDevices(account, i);
          if (deviceIdFromContract) {
            deviceIds.push(deviceIdFromContract);
            i++;
          } else {
            break;
          }
        }
      } catch (err) {
        // Reached end of array or error
        console.log('Finished fetching device IDs');
      }
      
      // Fetch details for each device
      for (const devId of deviceIds) {
        try {
          const device = await contract.getDevice(devId);
          devicesData.push({
            deviceId: devId,
            owner: device[0],
            dataSchema: device[1],
            isActive: device[2],
            registeredAt: Number(device[3])
          });
        } catch (err) {
          console.error(`Error fetching device ${devId}:`, err);
        }
      }
      
      setUserDevices(devicesData);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalDevices: devicesData.length,
        activeStreams: devicesData.filter(d => d.isActive).length
      }));
    } catch (err) {
      console.error("Error fetching user devices:", err);
      showToast("Failed to fetch your devices", "error");
    } finally {
      setIsFetchingDevices(false);
    }
  };

  useEffect(() => {
    fetchUserDevices();
  }, [account, provider]);

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!provider || !account) {
      showToast('Please connect your wallet first', 'warning');
      return;
    }
    
    if (!deviceId || !dataSchema) {
      showToast('Please fill in both Device ID and Data Schema', 'warning');
      return;
    }

    // Validate JSON
    try {
      JSON.parse(dataSchema);
    } catch (err) {
      showToast('Invalid JSON format in Data Schema', 'error');
      return;
    }

    setIsRegistering(true);

    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(dePINRegistry.address, dePINRegistry.abi, signer);
      
      showToast('Transaction submitted...', 'info');
      const tx = await contract.registerDevice(deviceId, dataSchema);
      await tx.wait();
      
      showToast('Device registered successfully!', 'success');
      setDeviceId('');
      setDataSchema('');
      fetchUserDevices(); // Refresh the list
    } catch (err: any) {
      console.error("Error registering device:", err);
      const errorMessage = err.reason || err.message || 'Failed to register device';
      showToast(errorMessage, 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Provider Dashboard</h1>
      
      {/* Stats Overview Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatsCard
          icon={CpuChipIcon}
          label="Total Devices"
          value={stats.totalDevices.toString()}
          loading={isFetchingDevices}
        />
        <StatsCard
          icon={ChartBarIcon}
          label="Active Streams"
          value={stats.activeStreams.toString()}
          loading={isFetchingDevices}
        />
        <StatsCard
          icon={CurrencyDollarIcon}
          label="Total Earned"
          value={`${stats.totalEarned} CRO`}
          loading={isFetchingDevices}
        />
        <StatsCard
          icon={CalendarIcon}
          label="This Month"
          value={`${stats.thisMonth} CRO`}
          loading={isFetchingDevices}
        />
      </div>

      {/* Device Registration Form */}
      <Card className="mb-8" ref={formRef}>
        <h2 className="text-xl font-semibold text-white mb-4">Register a New Device</h2>
        <form onSubmit={handleRegisterDevice} className="space-y-4">
          <div>
            <label htmlFor="deviceId" className="block text-sm font-medium text-gray-300 mb-1">
              Device ID
            </label>
            <input
              type="text"
              id="deviceId"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="e.g., weather-station-001"
              required
              minLength={3}
              aria-label="Device ID"
              aria-describedby="deviceId-help"
            />
            <p id="deviceId-help" className="mt-1 text-xs text-gray-400">Unique identifier for your IoT device</p>
          </div>
          
          <div>
            <label htmlFor="dataSchema" className="block text-sm font-medium text-gray-300 mb-1">
              Data Schema (JSON format)
            </label>
            <textarea
              id="dataSchema"
              rows={5}
              value={dataSchema}
              onChange={(e) => setDataSchema(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm font-mono"
              placeholder='{ "temperature": "number", "humidity": "number", "location": { "lat": "number", "lng": "number" } }'
              required
              minLength={10}
              aria-label="Data Schema"
              aria-describedby="dataSchema-help"
            />
            <p id="dataSchema-help" className="mt-1 text-xs text-gray-400">Define the structure of data your device will provide (valid JSON)</p>
          </div>
          
          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            isLoading={isRegistering}
            className="md:w-auto"
          >
            {isRegistering ? 'Registering...' : 'Register Device'}
          </Button>
        </form>
      </Card>

      {/* Registered Devices Section */}
      <Card>
        <h2 className="text-xl font-semibold text-white mb-6">Your Registered Devices</h2>
        
        {isFetchingDevices ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} padding="sm">
                <Skeleton height="200px" />
              </Card>
            ))}
          </div>
        ) : userDevices.length === 0 ? (
          <EmptyState
            icon={CpuChipIcon}
            title="No Devices Yet"
            description="Register your first IoT device to start earning from your data"
            action={{
              label: 'Register Device',
              onClick: scrollToForm
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userDevices.map((device) => (
              <DeviceCard key={device.deviceId} device={device} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

// Stats Card Component
interface StatsCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  loading?: boolean;
}

const StatsCard = ({ icon: Icon, label, value, loading }: StatsCardProps) => {
  return (
    <Card hover padding="md" className="animate-slide-up">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-primary/20 rounded-lg transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-400">{label}</p>
          {loading ? (
            <Skeleton width="60px" height="32px" />
          ) : (
            <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent-pink bg-clip-text text-transparent transition-all duration-300">
              {value}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

// Device Card Component
interface DeviceCardProps {
  device: Device;
}

const DeviceCard = ({ device }: DeviceCardProps) => {
  const schemaPreview = device.dataSchema.substring(0, 100) + (device.dataSchema.length > 100 ? '...' : '');
  
  return (
    <Card 
      hover 
      padding="sm" 
      className="border-l-4 border-primary"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-white">{device.deviceId}</h3>
          <Badge variant={device.isActive ? 'success' : 'neutral'}>
            {device.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        
        <div>
          <p className="text-xs text-gray-400 mb-1">Data Schema:</p>
          <pre className="text-xs text-gray-300 bg-gray-900/50 p-2 rounded overflow-x-auto">
            {schemaPreview}
          </pre>
        </div>
        
        <div className="text-xs text-gray-400">
          <p>Registered: {new Date(device.registeredAt * 1000).toLocaleDateString()}</p>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button variant="primary" size="sm" className="flex-1">
            View Details
          </Button>
          {device.isActive && (
            <Button variant="outline" size="sm">
              Manage
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export { Dashboard };
export default Dashboard;
