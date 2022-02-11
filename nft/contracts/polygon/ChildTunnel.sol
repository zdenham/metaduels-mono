// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {FxBaseChildTunnel} from "./FxBaseChildTunnel.sol";

contract ChildTunnel is FxBaseChildTunnel {
    constructor(address _fxChild) FxBaseChildTunnel(_fxChild) {}

    function sendMessageToRoot(bytes memory message) public {
        _sendMessageToRoot(message);
    }
}
