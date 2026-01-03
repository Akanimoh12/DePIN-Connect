import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { CRONOS_TESTNET } from '../config';

interface WalletContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToCorrectNetwork: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);

  const checkNetwork = async (currentProvider: ethers.BrowserProvider) => {
    try {
      const network = await currentProvider.getNetwork();
      const currentChainId = Number(network.chainId);
      setChainId(currentChainId);
      setIsCorrectNetwork(currentChainId === CRONOS_TESTNET.chainId);
      return currentChainId === CRONOS_TESTNET.chainId;
    } catch (error) {
      console.error("Error checking network", error);
      return false;
    }
  };

  const switchToCorrectNetwork = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    try {
      // Try to switch to Cronos Testnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CRONOS_TESTNET.chainId.toString(16)}` }], // 0x152
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${CRONOS_TESTNET.chainId.toString(16)}`,
                chainName: CRONOS_TESTNET.name,
                rpcUrls: [CRONOS_TESTNET.rpcUrl],
                nativeCurrency: {
                  name: 'TCRO',
                  symbol: 'TCRO',
                  decimals: 18,
                },
                blockExplorerUrls: [CRONOS_TESTNET.blockExplorer],
              },
            ],
          });
        } catch (addError) {
          console.error("Error adding Cronos Testnet to MetaMask", addError);
          throw addError;
        }
      } else {
        console.error("Error switching to Cronos Testnet", switchError);
        throw switchError;
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await newProvider.send('eth_requestAccounts', []);
        setProvider(newProvider);
        setAccount(accounts[0]);
        
        // Check if on correct network
        const correctNetwork = await checkNetwork(newProvider);
        
        // Prompt user to switch if on wrong network
        if (!correctNetwork) {
          const shouldSwitch = confirm(
            `You are connected to the wrong network.\n\nThis app requires Cronos Testnet (Chain ID: ${CRONOS_TESTNET.chainId}).\n\nWould you like to switch networks now?`
          );
          if (shouldSwitch) {
            await switchToCorrectNetwork();
          }
        }
      } catch (error) {
        console.error("Error connecting to MetaMask", error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setChainId(null);
    setIsCorrectNetwork(false);
  };

  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        disconnectWallet();
      }
    };

    const handleChainChanged = async () => {
      // Reload the page when chain changes (recommended by MetaMask)
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Check network on mount if already connected
      const checkInitialConnection = async () => {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const newProvider = new ethers.BrowserProvider(window.ethereum);
            setProvider(newProvider);
            setAccount(accounts[0]);
            await checkNetwork(newProvider);
          }
        } catch (error) {
          console.error("Error checking initial connection", error);
        }
      };
      
      checkInitialConnection();
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  return (
    <WalletContext.Provider 
      value={{ 
        account, 
        provider, 
        chainId, 
        isCorrectNetwork, 
        connectWallet, 
        disconnectWallet, 
        switchToCorrectNetwork 
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
