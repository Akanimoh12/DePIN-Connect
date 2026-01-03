// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.ason";

contract PaymentStream {
    struct Stream {
        address payable buyer;
        address payable provider;
        uint256 rate; // Amount per second
        uint256 lastPayment;
        bool active;
    }

    mapping(string => Stream) public streams;
    IERC20 public paymentToken;

    event StreamStarted(string deviceId, address indexed buyer, address indexed provider, uint256 rate);
    event StreamStopped(string deviceId, address indexed buyer);

    constructor(address tokenAddress) {
        paymentToken = IERC20(tokenAddress);
    }

    function startStream(string memory deviceId, address payable provider, uint256 rate) public {
        require(streams[deviceId].active == false, "Stream already active");

        streams[deviceId] = Stream({
            buyer: payable(msg.sender),
            provider: provider,
            rate: rate,
            lastPayment: block.timestamp,
            active: true
        });

        emit StreamStarted(deviceId, msg.sender, provider, rate);
    }

    function stopStream(string memory deviceId) public {
        require(streams[deviceId].active == true, "Stream not active");
        require(streams[deviceId].buyer == msg.sender, "Only buyer can stop stream");

        withdraw(deviceId);
        streams[deviceId].active = false;

        emit StreamStopped(deviceId, msg.sender);
    }

    function withdraw(string memory deviceId) public {
        Stream storage stream = streams[deviceId];
        require(stream.active == true, "Stream not active");

        uint256 timeElapsed = block.timestamp - stream.lastPayment;
        uint256 amountToWithdraw = timeElapsed * stream.rate;

        if (amountToWithdraw > 0) {
            require(paymentToken.transferFrom(stream.buyer, stream.provider, amountToWithdraw), "Token transfer failed");
            stream.lastPayment = block.timestamp;
        }
    }

    function getStream(string memory deviceId) public view returns (address, address, uint256, uint256, bool) {
        Stream memory stream = streams[deviceId];
        return (stream.buyer, stream.provider, stream.rate, stream.lastPayment, stream.active);
    }
}
