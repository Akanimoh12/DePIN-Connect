import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { ethers } from 'ethers';
import { 
  XMarkIcon, 
  CpuChipIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ClockIcon,
  SignalIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { paymentStream, CRONOS_TESTNET } from '../config';

interface Device {
  deviceId: string;
  owner: string;
  dataSchema: string;
  isActive: boolean;
  registeredAt: number;
  coordinates?: [number, number];
  activeSubscribers?: number;
  price?: string;
}

interface StreamData {
  startTime: number;
  rate: bigint;
  lastPaymentTime: number;
  depositBalance: bigint;
  isActive: boolean;
}

interface DeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device | null;
}

interface ActivityEvent {
  type: 'started' | 'deposited' | 'stopped' | 'processed';
  timestamp: number;
  amount?: string;
  txHash?: string;
}

export const DeviceModal = ({ isOpen, onClose, device }: DeviceModalProps) => {
  const { account, provider } = useWallet();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [depositAmount, setDepositAmount] = useState('10');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [addDepositAmount, setAddDepositAmount] = useState('');
  const [isAddingDeposit, setIsAddingDeposit] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [activities] = useState<ActivityEvent[]>([]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Fetch stream data when modal opens and user is connected
  useEffect(() => {
    if (isOpen && device && provider && account) {
      fetchStreamData();
    }
  }, [isOpen, device, provider, account]);

  const fetchStreamData = async () => {
    if (!provider || !account || !device) return;

    setIsLoadingStream(true);
    try {
      const contract = new ethers.Contract(
        paymentStream.address,
        paymentStream.abi,
        provider
      );

      const stream = await contract.getStream(device.deviceId, account);
      setStreamData({
        startTime: Number(stream[0]),
        rate: stream[1],
        lastPaymentTime: Number(stream[2]),
        depositBalance: stream[3],
        isActive: stream[4],
      });
    } catch (error) {
      console.error('Error fetching stream:', error);
    } finally {
      setIsLoadingStream(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Address copied to clipboard', 'success');
  };

  const calculateDuration = (amount: string, ratePerSec: bigint): number => {
    try {
      const depositWei = ethers.parseEther(amount);
      const seconds = Number(depositWei / ratePerSec);
      return seconds / 3600; // Convert to hours
    } catch {
      return 0;
    }
  };

  const formatCRO = (wei: bigint): string => {
    return ethers.formatEther(wei);
  };

  const handleStartStream = async () => {
    if (!provider || !account || !device) {
      showToast('Please connect your wallet', 'warning');
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      showToast('Please enter a valid deposit amount', 'warning');
      return;
    }

    // Rate is 0.001 CRO/sec (1e15 wei)
    const rate = ethers.parseUnits('0.001', 18);
    const duration = calculateDuration(depositAmount, rate);

    if (duration < 1) {
      showToast('Deposit must last at least 1 hour', 'warning');
      return;
    }

    setIsSubscribing(true);

    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        paymentStream.address,
        paymentStream.abi,
        signer
      );

      const deposit = ethers.parseEther(depositAmount);

      showToast('Preparing transaction...', 'info');
      const tx = await contract.startStream(device.deviceId, rate, { value: deposit });

      showToast('Confirm in wallet...', 'info');
      await tx.wait();

      showToast('Stream activated successfully!', 'success');
      await fetchStreamData();
      setActiveTab(2); // Switch to Manage Subscription tab
    } catch (error: any) {
      console.error('Error starting stream:', error);
      const errorMessage = error.reason || error.message || 'Failed to start stream';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleAddDeposit = async () => {
    if (!provider || !account || !device) return;

    if (!addDepositAmount || parseFloat(addDepositAmount) <= 0) {
      showToast('Please enter a valid amount', 'warning');
      return;
    }

    setIsAddingDeposit(true);

    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        paymentStream.address,
        paymentStream.abi,
        signer
      );

      const amount = ethers.parseEther(addDepositAmount);
      const tx = await contract.addDeposit(device.deviceId, { value: amount });

      showToast('Transaction submitted...', 'info');
      await tx.wait();

      showToast('Deposit added successfully!', 'success');
      setAddDepositAmount('');
      await fetchStreamData();
    } catch (error: any) {
      console.error('Error adding deposit:', error);
      const errorMessage = error.reason || error.message || 'Failed to add deposit';
      showToast(errorMessage, 'error');
    } finally {
      setIsAddingDeposit(false);
    }
  };

  const handleStopStream = async () => {
    if (!provider || !account || !device) return;

    setIsStopping(true);

    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        paymentStream.address,
        paymentStream.abi,
        signer
      );

      const tx = await contract.stopStream(device.deviceId);

      showToast('Stopping stream...', 'info');
      await tx.wait();

      showToast('Stream stopped successfully! Remaining deposit refunded.', 'success');
      setShowStopConfirm(false);
      onClose();
    } catch (error: any) {
      console.error('Error stopping stream:', error);
      const errorMessage = error.reason || error.message || 'Failed to stop stream';
      showToast(errorMessage, 'error');
    } finally {
      setIsStopping(false);
    }
  };

  const getRemainingHours = (): number => {
    if (!streamData || !streamData.isActive) return 0;
    const rate = streamData.rate;
    const balance = streamData.depositBalance;
    if (rate === 0n) return 0;
    const seconds = Number(balance / rate);
    return seconds / 3600;
  };

  const getBalancePercentage = (): number => {
    if (!streamData) return 100;
    // Estimate: assuming they started with similar balance
    const hours = getRemainingHours();
    if (hours > 24) return 100;
    if (hours > 12) return 75;
    if (hours > 6) return 50;
    if (hours > 2) return 25;
    return 10;
  };

  const getProgressColor = (): string => {
    const percentage = getBalancePercentage();
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!device) return null;

  const rate = ethers.parseUnits('0.001', 18); // 0.001 CRO/sec
  const estimatedDuration = calculateDuration(depositAmount, rate);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-3xl bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 p-6 shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600/20 rounded-xl">
                      <CpuChipIcon className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                      <Dialog.Title className="text-2xl font-bold text-white">
                        {device.deviceId}
                      </Dialog.Title>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={device.isActive ? 'success' : 'neutral'}>
                          {device.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <button
                          onClick={() => copyToClipboard(device.owner)}
                          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          <span className="font-mono">{device.owner.slice(0, 6)}...{device.owner.slice(-4)}</span>
                          {copied ? (
                            <CheckIcon className="w-4 h-4 text-green-400" />
                          ) : (
                            <ClipboardDocumentIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Tabs */}
                <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
                  <Tab.List className="flex space-x-1 rounded-xl bg-gray-900/50 p-1 mb-6">
                    {['Overview', 'Subscribe', 'Manage', 'Activity'].map((tab) => (
                      <Tab
                        key={tab}
                        className={({ selected }) =>
                          `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200
                          ${
                            selected
                              ? 'bg-indigo-600 text-white shadow'
                              : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                          }`
                        }
                      >
                        {tab}
                      </Tab>
                    ))}
                  </Tab.List>

                  <Tab.Panels className="mt-4">
                    {/* Tab 1: Overview */}
                    <Tab.Panel className="space-y-6 animate-fade-in">
                      {/* Device Info */}
                      <div className="text-sm text-gray-400">
                        Registered: {new Date(device.registeredAt * 1000).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>

                      {/* Data Schema */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Data Structure</h3>
                        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                          <pre className="text-sm text-gray-300 font-mono overflow-x-auto">
                            {JSON.stringify(JSON.parse(device.dataSchema), null, 2)}
                          </pre>
                        </div>
                      </div>

                      {/* Pricing Section */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Pricing</h3>
                        <Card>
                          <div className="text-center py-4">
                            <div className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent mb-2">
                              0.001 CRO/second
                            </div>
                            <div className="space-y-1 text-sm text-gray-400">
                              <div>~0.06 CRO/minute</div>
                              <div>~3.6 CRO/hour</div>
                              <div>~86.4 CRO/day</div>
                            </div>
                          </div>
                        </Card>
                      </div>

                      {/* Statistics */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Statistics</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <Card padding="sm">
                            <div className="text-center">
                              <ChartBarIcon className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-white">{device.activeSubscribers || 0}</div>
                              <div className="text-xs text-gray-400">Subscribers</div>
                            </div>
                          </Card>
                          <Card padding="sm">
                            <div className="text-center">
                              <SignalIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-white">1.2M</div>
                              <div className="text-xs text-gray-400">Data Points</div>
                            </div>
                          </Card>
                          <Card padding="sm">
                            <div className="text-center">
                              <ClockIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-white">99.9%</div>
                              <div className="text-xs text-gray-400">Uptime</div>
                            </div>
                          </Card>
                          <Card padding="sm">
                            <div className="text-center">
                              <CurrencyDollarIcon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-white">2m ago</div>
                              <div className="text-xs text-gray-400">Last Update</div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    </Tab.Panel>

                    {/* Tab 2: Subscribe */}
                    <Tab.Panel className="space-y-6 animate-fade-in">
                      {isLoadingStream ? (
                        <div className="flex justify-center py-12">
                          <LoadingSpinner size="lg" />
                        </div>
                      ) : streamData?.isActive ? (
                        /* Already subscribed - show message */
                        <Card>
                          <div className="text-center py-8">
                            <CheckIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">
                              You're Already Subscribed
                            </h3>
                            <p className="text-gray-400 mb-6">
                              Manage your subscription in the "Manage" tab
                            </p>
                            <Button
                              variant="primary"
                              onClick={() => setActiveTab(2)}
                            >
                              Go to Manage Subscription
                            </Button>
                          </div>
                        </Card>
                      ) : (
                        /* Subscription Form */
                        <>
                          {!account && (
                            <Card>
                              <div className="text-center py-6">
                                <ExclamationTriangleIcon className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                                <p className="text-gray-400">
                                  Please connect your wallet to subscribe
                                </p>
                              </div>
                            </Card>
                          )}

                          {account && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Deposit Amount (CRO)
                                </label>
                                <input
                                  type="number"
                                  value={depositAmount}
                                  onChange={(e) => setDepositAmount(e.target.value)}
                                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="Enter amount"
                                  min="0"
                                  step="0.1"
                                />
                                <p className="mt-1 text-sm text-gray-400">
                                  This deposit will be used to pay for the data stream
                                </p>

                                {/* Duration Calculation */}
                                {depositAmount && parseFloat(depositAmount) > 0 && (
                                  <div className="mt-3 p-3 bg-indigo-600/10 border border-indigo-600/30 rounded-lg">
                                    <p className="text-sm text-indigo-300">
                                      Your deposit of <span className="font-bold">{depositAmount} CRO</span> will last approximately{' '}
                                      <span className="font-bold">{estimatedDuration.toFixed(1)} hours</span>
                                    </p>
                                  </div>
                                )}

                                {/* Quick Select Buttons */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {[10, 50, 100, 500].map((amount) => (
                                    <button
                                      key={amount}
                                      onClick={() => setDepositAmount(amount.toString())}
                                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                                    >
                                      {amount} CRO
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Rate Display */}
                              <Card>
                                <h4 className="font-semibold text-white mb-3">Subscription Breakdown</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Deposit:</span>
                                    <span className="text-white font-semibold">{depositAmount} CRO</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Rate:</span>
                                    <span className="text-white font-semibold">0.001 CRO/second</span>
                                  </div>
                                  <div className="flex justify-between pt-2 border-t border-gray-700">
                                    <span className="text-gray-400">Est. Duration:</span>
                                    <span className="text-indigo-400 font-bold">
                                      {estimatedDuration.toFixed(1)} hours
                                    </span>
                                  </div>
                                </div>
                              </Card>

                              {/* Subscribe Button */}
                              <Button
                                variant="primary"
                                size="lg"
                                fullWidth
                                onClick={handleStartStream}
                                isLoading={isSubscribing}
                                disabled={!device.isActive || parseFloat(depositAmount) <= 0}
                              >
                                {isSubscribing ? 'Processing...' : 'Start Data Stream'}
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </Tab.Panel>

                    {/* Tab 3: Manage Subscription */}
                    <Tab.Panel className="space-y-6 animate-fade-in">
                      {isLoadingStream ? (
                        <div className="flex justify-center py-12">
                          <LoadingSpinner size="lg" />
                        </div>
                      ) : !streamData?.isActive ? (
                        <Card>
                          <div className="text-center py-8">
                            <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">
                              No Active Subscription
                            </h3>
                            <p className="text-gray-400 mb-6">
                              Subscribe to this device to manage your stream
                            </p>
                            <Button
                              variant="primary"
                              onClick={() => setActiveTab(1)}
                            >
                              Subscribe Now
                            </Button>
                          </div>
                        </Card>
                      ) : (
                        <>
                          {/* Subscription Status */}
                          <Card>
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold text-white">Subscription Status</h4>
                              <Badge variant="success">Active</Badge>
                            </div>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Started:</span>
                                <span className="text-white">
                                  {new Date(streamData.startTime * 1000).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Deposit Balance:</span>
                                <span className="text-white font-semibold">
                                  {formatCRO(streamData.depositBalance)} CRO
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Duration Remaining:</span>
                                <span className="text-white font-semibold">
                                  ~{getRemainingHours().toFixed(1)} hours
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Rate:</span>
                                <span className="text-white">
                                  {formatCRO(streamData.rate)} CRO/sec
                                </span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-4">
                              <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Deposit Usage</span>
                                <span>{getBalancePercentage()}%</span>
                              </div>
                              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${getProgressColor()} transition-all duration-500`}
                                  style={{ width: `${getBalancePercentage()}%` }}
                                />
                              </div>
                              {getBalancePercentage() < 20 && (
                                <div className="mt-2 p-2 bg-red-900/20 border border-red-900/50 rounded-lg">
                                  <p className="text-xs text-red-400">
                                    ⚠️ Low balance! Add more funds to continue your subscription.
                                  </p>
                                </div>
                              )}
                            </div>
                          </Card>

                          {/* Add Deposit */}
                          <Card>
                            <h4 className="font-semibold text-white mb-3">Add Deposit</h4>
                            <div className="flex gap-3">
                              <input
                                type="number"
                                value={addDepositAmount}
                                onChange={(e) => setAddDepositAmount(e.target.value)}
                                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Amount in CRO"
                                min="0"
                                step="0.1"
                              />
                              <Button
                                variant="primary"
                                onClick={handleAddDeposit}
                                isLoading={isAddingDeposit}
                                disabled={!addDepositAmount || parseFloat(addDepositAmount) <= 0}
                              >
                                Add Deposit
                              </Button>
                            </div>
                          </Card>

                          {/* Stop Stream */}
                          <Card>
                            <h4 className="font-semibold text-white mb-3">Stop Subscription</h4>
                            <p className="text-sm text-gray-400 mb-4">
                              Stop your subscription and receive a refund for the remaining deposit balance.
                            </p>
                            {!showStopConfirm ? (
                              <Button
                                variant="danger"
                                onClick={() => setShowStopConfirm(true)}
                              >
                                Stop Stream
                              </Button>
                            ) : (
                              <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg">
                                <p className="text-sm text-red-400 mb-3">
                                  Are you sure? Remaining deposit ({formatCRO(streamData.depositBalance)} CRO) will be refunded.
                                </p>
                                <div className="flex gap-3">
                                  <Button
                                    variant="danger"
                                    onClick={handleStopStream}
                                    isLoading={isStopping}
                                  >
                                    Confirm Stop
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setShowStopConfirm(false)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Card>
                        </>
                      )}
                    </Tab.Panel>

                    {/* Tab 4: Activity */}
                    <Tab.Panel className="space-y-6 animate-fade-in">
                      {activities.length === 0 ? (
                        <Card>
                          <div className="text-center py-8">
                            <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">
                              No Activity Yet
                            </h3>
                            <p className="text-gray-400">
                              Subscription events will appear here
                            </p>
                          </div>
                        </Card>
                      ) : (
                        <div className="space-y-3">
                          {activities.map((event, index) => (
                            <Card key={index} padding="sm">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${
                                  event.type === 'started' ? 'bg-green-900/20' :
                                  event.type === 'deposited' ? 'bg-blue-900/20' :
                                  event.type === 'stopped' ? 'bg-red-900/20' :
                                  'bg-gray-900/20'
                                }`}>
                                  <ClockIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-white font-medium">
                                        {event.type === 'started' && 'Stream Started'}
                                        {event.type === 'deposited' && 'Deposit Added'}
                                        {event.type === 'stopped' && 'Stream Stopped'}
                                        {event.type === 'processed' && 'Payment Processed'}
                                      </p>
                                      <p className="text-sm text-gray-400">
                                        {new Date(event.timestamp * 1000).toLocaleString()}
                                      </p>
                                    </div>
                                    {event.amount && (
                                      <span className="text-white font-semibold">
                                        {event.amount} CRO
                                      </span>
                                    )}
                                  </div>
                                  {event.txHash && (
                                    <a
                                      href={`${CRONOS_TESTNET.blockExplorer}/tx/${event.txHash}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 inline-block"
                                    >
                                      View Transaction →
                                    </a>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
