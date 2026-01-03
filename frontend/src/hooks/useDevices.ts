import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { dePINRegistry } from '../config';

export interface Device {
  deviceId: string;
  owner: string;
  dataSchema: string;
  isActive: boolean;
  registeredAt: number;
}

export const useDevices = () => {
  const { provider } = useWallet();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDevices = async () => {
    if (!provider) return;
    
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(
        dePINRegistry.address,
        dePINRegistry.abi,
        provider
      );
      
      // Get total devices count
      const totalDevices = await contract.totalDevices();
      console.log(`Total devices in registry: ${totalDevices}`);
      
      // Note: This is a simplified approach for the hackathon
      // In production, you should use events or maintain a list of device IDs
      // For now, we'll just return an empty array since we don't have a way
      // to iterate through all device IDs without knowing them
      
      setDevices([]);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setDevices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [provider]);

  return { devices, isLoading, refetch: fetchDevices };
};

// Hook to fetch devices for a specific provider (for Dashboard)
export const useProviderDevices = (providerAddress?: string) => {
  const { provider, account } = useWallet();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProviderDevices = async () => {
    const address = providerAddress || account;
    if (!provider || !address) return;
    
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(
        dePINRegistry.address,
        dePINRegistry.abi,
        provider
      );
      
      const deviceIds: string[] = [];
      const devicesData: Device[] = [];
      
      // Try to fetch devices from providerDevices mapping
      // This is a limitation - we'd need events to track all device IDs properly
      try {
        let i = 0;
        while (i < 100) { // Limit to 100 for safety
          const deviceIdFromContract = await contract.providerDevices(address, i);
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
      
      setDevices(devicesData);
    } catch (error) {
      console.error('Error fetching provider devices:', error);
      setDevices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderDevices();
  }, [provider, providerAddress, account]);

  return { devices, isLoading, refetch: fetchProviderDevices };
};
