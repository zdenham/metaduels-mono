// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
// import "hardhat/console.sol";
import "./VerifyIPFS.sol";
import "./JsmnSolLib.sol";

contract MetadataValidator {
    constructor() {}

    function _substring(
        string memory str,
        uint256 startIndex,
        uint256 endIndex
    ) private pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }

    function _calculateOldCID(
        string memory newMeta,
        uint256 additionStartIndex,
        uint256 additionEndIndex
    ) private pure returns (string memory) {
        string memory start = _substring(newMeta, 0, additionStartIndex);
        string memory end = _substring(
            newMeta,
            additionEndIndex,
            bytes(newMeta).length
        );

        string memory oldMeta = string(abi.encodePacked(start, end));

        return string(verifyIPFS.generateHash(oldMeta));
    }

    function _validateAdditionSignature(
        string memory message,
        bytes memory signature,
        address ownerEthAddress
    ) private pure returns (bool) {
        bytes32 messageHash = ECDSA.toEthSignedMessageHash(bytes(message));
        address signer = ECDSA.recover(messageHash, signature);

        return ownerEthAddress == signer;
    }

    function _addressToAsciiString(address x)
        private
        pure
        returns (string memory)
    {
        bytes memory s = new bytes(40);
        for (uint256 i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint256(uint160(x)) / (2**(8 * (19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2 * i] = _char(hi);
            s[2 * i + 1] = _char(lo);
        }
        return string(abi.encodePacked(bytes("0x"), s));
    }

    function _char(bytes1 b) private pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }

    function _validateAdditionIncludesContractAddress(
        string memory addedJSON,
        JsmnSolLib.Token[] memory jsonTokens
    ) private pure returns (bool) {
        bool hasCorrectTypes = jsonTokens[1].jsmnType ==
            JsmnSolLib.JsmnType.STRING &&
            jsonTokens[2].jsmnType == JsmnSolLib.JsmnType.STRING;

        if (!hasCorrectTypes) {
            return false;
        }

        string memory key = _substring(
            addedJSON,
            jsonTokens[1].start,
            jsonTokens[1].end
        );

        bool includedKey = keccak256(bytes(key)) == keccak256(bytes("updater"));

        if (!includedKey) {
            return false;
        }

        string memory val = _substring(
            addedJSON,
            jsonTokens[2].start,
            jsonTokens[2].end
        );

        // string memory sender = _addressToAsciiString(_msgSender());

        // return keccak256(bytes(sender)) == keccak256(bytes(val));

        return true;
    }

    function _parseAddedJSON(
        string memory newMeta,
        uint256 additionStartIndex,
        uint256 additionEndIndex
    )
        private
        pure
        returns (
            string memory,
            JsmnSolLib.Token[] memory,
            bool
        )
    {
        string memory comma = _substring(
            newMeta,
            additionStartIndex,
            additionStartIndex + 1
        );

        string memory addedJSON = _substring(
            newMeta,
            additionStartIndex + 1,
            additionEndIndex
        );

        (uint256 result, JsmnSolLib.Token[] memory tokens, ) = JsmnSolLib.parse(
            addedJSON,
            10
        );

        bool success = keccak256(bytes(comma)) == keccak256(bytes(",")) &&
            result == 0;

        return (addedJSON, tokens, success);
    }

    function validateMetadata(
        address ownerEthAddress,
        string memory newJSONMeta,
        uint256 additionStartIndex,
        uint256 additionEndIndex,
        bytes memory ownerSignature,
        address sender
    ) public view returns (string memory, string memory) {
        (
            string memory addedJSON,
            JsmnSolLib.Token[] memory jsonTokens,
            bool isValidJSONAddition
        ) = _parseAddedJSON(newJSONMeta, additionStartIndex, additionEndIndex);

        require(
            isValidJSONAddition,
            "AdditiveNFT: added content contains invalid JSON"
        );

        require(
            _validateAdditionSignature(
                addedJSON,
                ownerSignature,
                ownerEthAddress
            ),
            "AdditiveNFT: signature for added content does not match provided owner"
        );

        require(
            _validateAdditionIncludesContractAddress(addedJSON, jsonTokens),
            "AdditiveNFT: updater address in the added content must equal the message sender"
        );

        string memory oldCid = _calculateOldCID(
            newJSONMeta,
            additionStartIndex,
            additionEndIndex
        );

        string memory newCid = string(verifyIPFS.generateHash(newJSONMeta));

        return (oldCid, newCid);
    }
}
