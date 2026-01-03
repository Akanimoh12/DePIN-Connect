// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {DePINRegistry} from "../src/DePINRegistry.sol";
import {PaymentStream} from "../src/PaymentStream.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy DePINRegistry
        DePINRegistry dePINRegistry = new DePINRegistry();
        console.log("DePINRegistry deployed to:", address(dePINRegistry));
        
        // Minimum rate: 0.001 CRO per second (adjust as needed)
        uint256 minRate = 1e15; // 0.001 CRO per second

        // Deploy PaymentStream with registry address and min rate (using native CRO)
        PaymentStream paymentStream = new PaymentStream(
            address(dePINRegistry),
            minRate
        );
        console.log("PaymentStream deployed to:", address(paymentStream));
        console.log("Minimum rate set to:", minRate, "wei per second (0.001 CRO/sec)");

        vm.stopBroadcast();
    }
}
