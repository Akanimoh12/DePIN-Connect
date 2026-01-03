// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DePINRegistry {
    struct Device {
        address owner;
        string dataSchema;
    }

    mapping(string => Device) public devices;
    mapping(address => string[]) public providerDevices;

    event DeviceRegistered(string deviceId, address indexed owner, string dataSchema);

    function registerDevice(string memory deviceId, string memory dataSchema) public {
        require(devices[deviceId].owner == address(0), "Device already registered");
        
        devices[deviceId] = Device(msg.sender, dataSchema);
        providerDevices[msg.sender].push(deviceId);
        
        emit DeviceRegistered(deviceId, msg.sender, dataSchema);
    }

    function getDevice(string memory deviceId) public view returns (address, string memory) {
        require(devices[deviceId].owner != address(0), "Device not found");
        Device memory device = devices[deviceId];
        return (device.owner, device.dataSchema);
    }
}
