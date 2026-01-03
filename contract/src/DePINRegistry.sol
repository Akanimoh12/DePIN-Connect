// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DePINRegistry {
    struct Device {
        address owner;
        string dataSchema;
        bool isActive;
        uint256 registeredAt;
    }

    mapping(string => Device) public devices;
    mapping(address => string[]) public providerDevices;
    uint256 public totalDevices;

    event DeviceRegistered(string indexed deviceId, address indexed owner, string dataSchema, uint256 timestamp);
    event DeviceUpdated(string indexed deviceId, string newDataSchema);
    event DeviceDeactivated(string indexed deviceId, address indexed owner);
    event DeviceOwnershipTransferred(string indexed deviceId, address indexed previousOwner, address indexed newOwner);

    modifier onlyDeviceOwner(string memory deviceId) {
        require(devices[deviceId].owner == msg.sender, "Not device owner");
        _;
    }

    function registerDevice(string memory deviceId, string memory dataSchema) public {
        require(bytes(deviceId).length > 0, "Device ID cannot be empty");
        require(bytes(dataSchema).length > 0, "Data schema cannot be empty");
        require(devices[deviceId].owner == address(0), "Device already registered");
        
        devices[deviceId] = Device({
            owner: msg.sender,
            dataSchema: dataSchema,
            isActive: true,
            registeredAt: block.timestamp
        });
        providerDevices[msg.sender].push(deviceId);
        totalDevices++;
        
        emit DeviceRegistered(deviceId, msg.sender, dataSchema, block.timestamp);
    }

    function updateDeviceSchema(string memory deviceId, string memory newDataSchema) public onlyDeviceOwner(deviceId) {
        require(devices[deviceId].isActive, "Device is not active");
        require(bytes(newDataSchema).length > 0, "Data schema cannot be empty");
        
        devices[deviceId].dataSchema = newDataSchema;
        emit DeviceUpdated(deviceId, newDataSchema);
    }

    function deactivateDevice(string memory deviceId) public onlyDeviceOwner(deviceId) {
        require(devices[deviceId].isActive, "Device already inactive");
        
        devices[deviceId].isActive = false;
        emit DeviceDeactivated(deviceId, msg.sender);
    }

    function transferDeviceOwnership(string memory deviceId, address newOwner) public onlyDeviceOwner(deviceId) {
        require(newOwner != address(0), "Invalid new owner address");
        require(devices[deviceId].isActive, "Device is not active");
        
        address previousOwner = devices[deviceId].owner;
        devices[deviceId].owner = newOwner;
        providerDevices[newOwner].push(deviceId);
        
        emit DeviceOwnershipTransferred(deviceId, previousOwner, newOwner);
    }

    function getDevice(string memory deviceId) public view returns (address owner, string memory dataSchema, bool isActive, uint256 registeredAt) {
        require(devices[deviceId].owner != address(0), "Device not found");
        Device memory device = devices[deviceId];
        return (device.owner, device.dataSchema, device.isActive, device.registeredAt);
    }

    function isDeviceActive(string memory deviceId) public view returns (bool) {
        return devices[deviceId].isActive;
    }

    function getProviderDeviceCount(address provider) public view returns (uint256) {
        return providerDevices[provider].length;
    }
}
