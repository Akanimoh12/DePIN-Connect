// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IDePINRegistry {
    function getDevice(string memory deviceId) external view returns (address owner, string memory dataSchema, bool isActive, uint256 registeredAt);
    function isDeviceActive(string memory deviceId) external view returns (bool);
}

contract PaymentStream is ReentrancyGuard {
    struct Stream {
        address payable buyer;
        address payable provider;
        uint256 rate; // Amount per second in wei
        uint256 lastPayment;
        uint256 totalPaid;
        uint256 depositBalance;
        bool active;
    }

    mapping(string => mapping(address => Stream)) public streams; // deviceId => buyer => Stream
    mapping(string => address[]) public deviceBuyers; // Track all buyers per device
    IDePINRegistry public registry;
    uint256 public minRate;

    event StreamStarted(string indexed deviceId, address indexed buyer, address indexed provider, uint256 rate, uint256 deposit, uint256 timestamp);
    event StreamStopped(string indexed deviceId, address indexed buyer, uint256 totalPaid, uint256 refunded);
    event PaymentWithdrawn(string indexed deviceId, address indexed buyer, address indexed provider, uint256 amount);
    event DepositAdded(string indexed deviceId, address indexed buyer, uint256 amount);
    event MinRateUpdated(uint256 newMinRate);

    constructor(address registryAddress, uint256 _minRate) {
        require(registryAddress != address(0), "Invalid registry address");
        registry = IDePINRegistry(registryAddress);
        minRate = _minRate;
    }

    function startStream(string memory deviceId, uint256 rate) public payable nonReentrant {
        require(bytes(deviceId).length > 0, "Device ID cannot be empty");
        require(rate >= minRate, "Rate below minimum");
        require(!streams[deviceId][msg.sender].active, "Stream already active for this buyer");
        require(msg.value > 0, "Must deposit funds for stream");
        
        // Verify device exists and is active
        (address provider, , bool isActive, ) = registry.getDevice(deviceId);
        require(isActive, "Device is not active");
        require(provider != msg.sender, "Cannot subscribe to own device");

        streams[deviceId][msg.sender] = Stream({
            buyer: payable(msg.sender),
            provider: payable(provider),
            rate: rate,
            lastPayment: block.timestamp,
            totalPaid: 0,
            depositBalance: msg.value,
            active: true
        });

        deviceBuyers[deviceId].push(msg.sender);

        emit StreamStarted(deviceId, msg.sender, provider, rate, msg.value, block.timestamp);
    }

    function addDeposit(string memory deviceId) public payable nonReentrant {
        Stream storage stream = streams[deviceId][msg.sender];
        require(stream.active, "Stream not active");
        require(msg.value > 0, "Must send funds");
        
        stream.depositBalance += msg.value;
        emit DepositAdded(deviceId, msg.sender, msg.value);
    }

    function stopStream(string memory deviceId) public nonReentrant {
        Stream storage stream = streams[deviceId][msg.sender];
        require(stream.active, "Stream not active");
        require(stream.buyer == msg.sender, "Only buyer can stop stream");

        _processPayment(deviceId, msg.sender);
        stream.active = false;

        // Refund remaining deposit
        uint256 refundAmount = stream.depositBalance;
        if (refundAmount > 0) {
            stream.depositBalance = 0;
            (bool success, ) = stream.buyer.call{value: refundAmount}("");
            require(success, "Refund failed");
        }

        emit StreamStopped(deviceId, msg.sender, stream.totalPaid, refundAmount);
    }

    function withdraw(string memory deviceId, address buyer) public nonReentrant {
        Stream storage stream = streams[deviceId][buyer];
        require(stream.active, "Stream not active");
        require(msg.sender == stream.provider, "Only provider can withdraw");

        _processPayment(deviceId, buyer);
    }

    function _processPayment(string memory deviceId, address buyer) internal {
        Stream storage stream = streams[deviceId][buyer];
        
        uint256 timeElapsed = block.timestamp - stream.lastPayment;
        uint256 amountToWithdraw = timeElapsed * stream.rate;

        if (amountToWithdraw > 0) {
            // Can only withdraw what's in deposit
            if (amountToWithdraw > stream.depositBalance) {
                amountToWithdraw = stream.depositBalance;
            }

            if (amountToWithdraw > 0) {
                stream.depositBalance -= amountToWithdraw;
                stream.lastPayment = block.timestamp;
                stream.totalPaid += amountToWithdraw;

                (bool success, ) = stream.provider.call{value: amountToWithdraw}("");
                require(success, "Payment transfer failed");

                emit PaymentWithdrawn(deviceId, stream.buyer, stream.provider, amountToWithdraw);
            }
        }
    }

    function getStream(string memory deviceId, address buyer) public view returns (
        address buyerAddr,
        address provider,
        uint256 rate,
        uint256 lastPayment,
        uint256 totalPaid,
        uint256 depositBalance,
        bool active
    ) {
        Stream memory stream = streams[deviceId][buyer];
        return (stream.buyer, stream.provider, stream.rate, stream.lastPayment, stream.totalPaid, stream.depositBalance, stream.active);
    }

    function getPendingPayment(string memory deviceId, address buyer) public view returns (uint256) {
        Stream memory stream = streams[deviceId][buyer];
        if (!stream.active) return 0;
        
        uint256 timeElapsed = block.timestamp - stream.lastPayment;
        uint256 pending = timeElapsed * stream.rate;
        
        // Can't withdraw more than deposit
        if (pending > stream.depositBalance) {
            return stream.depositBalance;
        }
        return pending;
    }

    function getDeviceBuyers(string memory deviceId) public view returns (address[] memory) {
        return deviceBuyers[deviceId];
    }

    receive() external payable {}
}
