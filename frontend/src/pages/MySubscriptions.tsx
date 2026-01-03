import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Set page title
const PAGE_TITLE = 'My Subscriptions | DePIN Connect';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { dePINRegistry, paymentStream } from '../config';
import {
  CpuChipIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  FunnelIcon,
  PlusIcon,
  StopIcon,
} from '@heroicons/react/24/outline';

interface Subscription {
  deviceId: string;
  startTime: number;
  rate: bigint;
  depositBalance: bigint;
  isActive: boolean;
  deviceOwner?: string;
  dataSchema?: string;
}

const MySubscriptions = () => {
  const { account, provider } = useWallet();
  const { showToast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'stopped'>('all');
  const [addDepositAmount, setAddDepositAmount] = useState<{ [key: string]: string }>({});
  const [loadingActions, setLoadingActions] = useState<{ [key: string]: boolean }>({});
  const [totalSpent, setTotalSpent] = useState('0');

  // Set page title
  useEffect(() => {
    document.title = PAGE_TITLE;
  }, []);

  useEffect(() => {
    if (account && provider) {
      fetchSubscriptions();
    }
  }, [account, provider]);

  const fetchSubscriptions = async () => {
    if (!provider || !account) return;

    setIsLoading(true);
    try {
      const registryContract = new ethers.Contract(
        dePINRegistry.address,
        dePINRegistry.abi,
        provider
      );

      const streamContract = new ethers.Contract(
        paymentStream.address,
        paymentStream.abi,
        provider
      );

      // Get total devices to iterate through
      const totalDevices = await registryContract.totalDevices();
      const subs: Subscription[] = [];

      // Check each device for active streams
      // Note: In production, use events or backend indexer
      
      // Try to get device IDs (this is simplified - production would use events)
      for (let i = 0; i < Math.min(Number(totalDevices), 100); i++) {
        try {
          // This is a workaround - in production, track device IDs via events
          const deviceId = `device-${i}`; // Placeholder
          const stream = await streamContract.getStream(deviceId, account);
          
          if (stream[4]) { // isActive
            const deviceData = await registryContract.getDevice(deviceId);
            subs.push({
              deviceId,
              startTime: Number(stream[0]),
              rate: stream[1],
              depositBalance: stream[3],
              isActive: stream[4],
              deviceOwner: deviceData[0],
              dataSchema: deviceData[1],
            });
          }
        } catch (error) {
          // Device doesn't exist or no stream
          continue;
        }
      }

      setSubscriptions(subs);

      // Calculate total spent (mock for now)
      let spent = 0;
      subs.forEach(sub => {
        // Estimate spent based on time elapsed
        const elapsed = Date.now() / 1000 - sub.startTime;
        const spentWei = sub.rate * BigInt(Math.floor(elapsed));
        spent += Number(ethers.formatEther(spentWei));
      });
      setTotalSpent(spent.toFixed(2));
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      showToast('Failed to fetch subscriptions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDeposit = async (deviceId: string) => {
    const amount = addDepositAmount[deviceId];
    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount', 'warning');
      return;
    }

    if (!provider || !account) return;

    setLoadingActions({ ...loadingActions, [`add-${deviceId}`]: true });

    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        paymentStream.address,
        paymentStream.abi,
        signer
      );

      const depositWei = ethers.parseEther(amount);
      const tx = await contract.addDeposit(deviceId, { value: depositWei });

      showToast('Transaction submitted...', 'info');
      await tx.wait();

      showToast('Deposit added successfully!', 'success');
      setAddDepositAmount({ ...addDepositAmount, [deviceId]: '' });
      await fetchSubscriptions();
    } catch (error: any) {
      console.error('Error adding deposit:', error);
      const errorMessage = error.reason || error.message || 'Failed to add deposit';
      showToast(errorMessage, 'error');
    } finally {
      setLoadingActions({ ...loadingActions, [`add-${deviceId}`]: false });
    }
  };

  const handleStopStream = async (deviceId: string) => {
    if (!provider || !account) return;

    if (!confirm('Are you sure you want to stop this subscription? Remaining balance will be refunded.')) {
      return;
    }

    setLoadingActions({ ...loadingActions, [`stop-${deviceId}`]: true });

    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        paymentStream.address,
        paymentStream.abi,
        signer
      );

      const tx = await contract.stopStream(deviceId);

      showToast('Stopping stream...', 'info');
      await tx.wait();

      showToast('Stream stopped successfully!', 'success');
      await fetchSubscriptions();
    } catch (error: any) {
      console.error('Error stopping stream:', error);
      const errorMessage = error.reason || error.message || 'Failed to stop stream';
      showToast(errorMessage, 'error');
    } finally {
      setLoadingActions({ ...loadingActions, [`stop-${deviceId}`]: false });
    }
  };

  const getRemainingHours = (sub: Subscription): number => {
    if (!sub.isActive) return 0;
    const seconds = Number(sub.depositBalance / sub.rate);
    return seconds / 3600;
  };

  const getBalancePercentage = (sub: Subscription): number => {
    const hours = getRemainingHours(sub);
    if (hours > 24) return 100;
    if (hours > 12) return 75;
    if (hours > 6) return 50;
    if (hours > 2) return 25;
    return 10;
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (filter === 'active') return sub.isActive;
    if (filter === 'stopped') return !sub.isActive;
    return true;
  });

  const activeCount = subscriptions.filter(s => s.isActive).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Subscriptions</h1>
          <p className="text-gray-400 mt-1">
            Manage your active data stream subscriptions
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600/20 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Subscriptions</p>
              <p className="text-2xl font-bold text-white">{subscriptions.length}</p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-600/20 rounded-lg">
              <CpuChipIcon className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Streams</p>
              <p className="text-2xl font-bold text-white">{activeCount}</p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-600/20 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold text-white">{totalSpent} CRO</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <FunnelIcon className="w-5 h-5 text-gray-400" />
        <div className="flex gap-2">
          {(['all', 'active', 'stopped'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton height="200px" />
            </Card>
          ))}
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <EmptyState
          icon={CpuChipIcon}
          title="No Subscriptions Found"
          description={
            filter === 'all'
              ? "You haven't subscribed to any devices yet. Visit the marketplace to get started!"
              : `No ${filter} subscriptions found.`
          }
          action={
            filter === 'all'
              ? {
                  label: 'Browse Marketplace',
                  onClick: () => (window.location.href = '/marketplace'),
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredSubscriptions.map((sub) => {
            const remainingHours = getRemainingHours(sub);
            const percentage = getBalancePercentage(sub);
            const progressColor = getProgressColor(percentage);

            return (
              <Card key={sub.deviceId} className="hover:border-indigo-500/50 transition-all duration-300">
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-600/20 rounded-lg">
                        <CpuChipIcon className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{sub.deviceId}</h3>
                        <p className="text-sm text-gray-400 font-mono">
                          {sub.deviceOwner ? `${sub.deviceOwner.slice(0, 6)}...${sub.deviceOwner.slice(-4)}` : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={sub.isActive ? 'success' : 'neutral'}>
                      {sub.isActive ? 'Active' : 'Stopped'}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-gray-700/50">
                    <div>
                      <p className="text-xs text-gray-400">Balance</p>
                      <p className="text-lg font-bold text-white">
                        {ethers.formatEther(sub.depositBalance)} CRO
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Remaining</p>
                      <p className="text-lg font-bold text-white">
                        ~{remainingHours.toFixed(1)}h
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Rate</p>
                      <p className="text-lg font-bold text-white">
                        {ethers.formatEther(sub.rate)}/sec
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Started</p>
                      <p className="text-lg font-bold text-white">
                        {new Date(sub.startTime * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {sub.isActive && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Deposit Usage</span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${progressColor} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      {percentage < 20 && (
                        <p className="mt-2 text-xs text-red-400">
                          ⚠️ Low balance! Add more funds soon.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {sub.isActive && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Add Deposit */}
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={addDepositAmount[sub.deviceId] || ''}
                          onChange={(e) =>
                            setAddDepositAmount({
                              ...addDepositAmount,
                              [sub.deviceId]: e.target.value,
                            })
                          }
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Amount"
                          min="0"
                          step="0.1"
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAddDeposit(sub.deviceId)}
                          isLoading={loadingActions[`add-${sub.deviceId}`]}
                          disabled={!addDepositAmount[sub.deviceId] || parseFloat(addDepositAmount[sub.deviceId]) <= 0}
                        >
                          <PlusIcon className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Stop Stream */}
                      <Button
                        variant="danger"
                        size="sm"
                        fullWidth
                        onClick={() => handleStopStream(sub.deviceId)}
                        isLoading={loadingActions[`stop-${sub.deviceId}`]}
                      >
                        <StopIcon className="w-4 h-4 mr-2" />
                        Stop Stream
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MySubscriptions;
