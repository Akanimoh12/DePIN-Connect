// This file contains the Application Binary Interface (ABI) for the DePINRegistry smart contract.
// The ABI is a JSON object that describes how to interact with the contract's functions.
// You should replace this with the actual ABI generated after compiling your smart contract.
export const dePINRegistryABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "deviceId",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "dataSchema",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "DeviceRegistered",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "deviceId",
          "type": "string"
        }
      ],
      "name": "getDevice",
      "outputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "dataSchema",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "registeredAt",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "provider",
          "type": "address"
        }
      ],
      "name": "getProviderDeviceCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "providerDevices",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalDevices",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "deviceId",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "dataSchema",
          "type": "string"
        }
      ],
      "name": "registerDevice",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

export const paymentStreamABI = [
  // Events
  "event StreamStarted(string indexed deviceId, address indexed buyer, address indexed provider, uint256 rate, uint256 deposit, uint256 timestamp)",
  "event StreamStopped(string indexed deviceId, address indexed buyer, uint256 refund)",
  "event DepositAdded(string indexed deviceId, address indexed buyer, uint256 amount)",
  "event PaymentProcessed(string indexed deviceId, address indexed buyer, address indexed provider, uint256 amount)",
  
  // Read functions
  "function getStream(string deviceId, address buyer) view returns (uint256 startTime, uint256 rate, uint256 lastPaymentTime, uint256 depositBalance, bool isActive)",
  "function getPendingPayment(string deviceId, address buyer) view returns (uint256)",
  "function getDeviceBuyers(string deviceId) view returns (address[])",
  "function minRate() view returns (uint256)",
  
  // Write functions
  "function startStream(string deviceId, uint256 rate) payable",
  "function stopStream(string deviceId)",
  "function addDeposit(string deviceId) payable",
  "function withdraw(string deviceId, address buyer)"
];
