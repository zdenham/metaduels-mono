// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {FxBaseRootTunnel} from "./FxBaseRootTunnel.sol";

contract RootTunnel is FxBaseRootTunnel {
    bytes public latestData;

    constructor(address _checkpointManager)
        FxBaseRootTunnel(_checkpointManager)
    {}

    function setLatestData(bytes memory data) public {
        latestData = data;
    }

    function _processMessageFromChild(bytes memory data) internal override {
        latestData = data;
    }
}
