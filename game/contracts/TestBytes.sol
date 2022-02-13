// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TestBytes {
    bytes public myBytes;

    constructor() {}

    function setBytes(bytes memory message) public {
        myBytes = message;
    }
}
