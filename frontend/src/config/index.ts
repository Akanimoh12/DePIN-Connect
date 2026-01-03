import { dePINRegistryABI, paymentStreamABI } from './abi';

// Deployed on Cronos Testnet
export const dePINRegistryAddress = '0xfd2f67cD354545712f9d8230170015d7e30d133A';
export const paymentStreamAddress = '0xA5dd225Beb2Ec0009Fe143eb0B9309Ba07d23737';

export const dePINRegistry = {
  address: dePINRegistryAddress,
  abi: dePINRegistryABI,
};

export const paymentStream = {
  address: paymentStreamAddress,
  abi: paymentStreamABI,
};

export const CRONOS_TESTNET = {
  chainId: 338,
  name: 'Cronos Testnet',
  rpcUrl: 'https://evm-t3.cronos.org/',
  blockExplorer: 'https://explorer.cronos.org/testnet'
};
