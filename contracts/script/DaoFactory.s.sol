// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/DaoFactory.sol";

contract DeployDaoFactory is Script {
    function run() external {
        vm.startBroadcast();

        new DaoFactory();

        vm.stopBroadcast();
    }
}
