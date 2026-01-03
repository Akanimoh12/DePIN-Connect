import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { paymentStream } from '../config';

interface StreamData {
  startTime: number;
  rate: bigint;
  lastPaymentTime: number;
  depositBalance: bigint;
  isActive: boolean;
}

export const usePaymentStream = (deviceId: string) => {
  const { account, provider } = useWallet();
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStream = async () => {
    if (!provider || !account || !deviceId) return;
    
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(
        paymentStream.address,
        paymentStream.abi,
        provider
      );
      
      const stream = await contract.getStream(deviceId, account);
      setStreamData({
        startTime: Number(stream.startTime),
        rate: stream.rate,
        lastPaymentTime: Number(stream.lastPaymentTime),
        depositBalance: stream.depositBalance,
        isActive: stream.isActive
      });
    } catch (error) {
      console.error('Error fetching stream:', error);
      setStreamData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStream();
  }, [deviceId, account, provider]);

  return { streamData, isLoading, refetch: fetchStream };
};
