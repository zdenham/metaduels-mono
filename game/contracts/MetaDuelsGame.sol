// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";

contract MetaDuelGame {
    using Counters for Counters.Counter;

    uint8 Attack = 1;
    uint8 Block = 2;
    uint8 Reload = 3;

    struct Move {
        uint8 moveType;
        bytes signature;
        string nonce;
    }

    struct PlayerState {
        uint8 amo;
        uint8 health;
        uint8 shield;
    }

    Counters.Counter private _gameIds;
    mapping(uint256 => address[2]) _participants;

    constructor() {}

    function letItBegin(address dueler, address duelee)
        public
        returns (uint256)
    {
        _gameIds.increment();
        uint256 newGameId = _gameIds.current();

        _participants[newGameId] = [dueler, duelee];

        return newGameId;
    }

    function _isCritical() public pure {}

    function _validateSignature(
        bytes32 data,
        bytes memory signature,
        address maybeSigner
    ) public view returns (bool) {
        bytes32 messageHash = ECDSA.toEthSignedMessageHash(data);
        address signer = ECDSA.recover(messageHash, signature);

        console.log("THE SIGNER %s, %s", signer, maybeSigner);
        return maybeSigner == signer;
    }

    function _calculatePlayerStates(
        Move memory duelerMove,
        Move memory dueleeMove
    ) internal view returns (uint256, uint256) {
        if (duelerMove.moveType == Attack && dueleeMove.moveType == Reload) {
            return (0, 1);
        }

        if (dueleeMove.moveType == Attack && duelerMove.moveType == Reload) {
            return (1, 0);
        }

        return (0, 0);
    }

    function _createSignatureInputHash(
        uint256 gameId,
        uint8 moveType,
        string memory nonce,
        bytes memory prevSig
    ) public view returns (bytes32) {
        bytes32 input = keccak256(abi.encode(gameId, moveType, nonce, prevSig));

        return keccak256(abi.encode(gameId, moveType, nonce, prevSig));
    }

    function _verifyAndExtractWinner(
        uint256 gameId,
        Move[6] memory moves,
        bytes memory finalSignature
    ) public view returns (address) {
        address duelerAddress = _participants[gameId][0];
        address dueleeAddress = _participants[gameId][1];
        uint256 totalDuelerDamage = 0;
        uint256 totalDueleeDamage = 0;

        bytes memory previousSignature = bytes("");

        for (uint256 i = 0; i < 6; i++) {
            address currSigner = i % 2 == 0 ? duelerAddress : dueleeAddress;
            Move memory currMove = moves[i];

            bytes32 dataHash = _createSignatureInputHash(
                gameId,
                currMove.moveType,
                currMove.nonce,
                previousSignature
            );

            require(
                _validateSignature(dataHash, currMove.signature, currSigner),
                "MetaDuels: signature does not match for a move"
            );

            // round end
            if (i % 2 == 1) {
                (
                    uint256 duelerDamage,
                    uint256 dueleeDamage
                ) = _calculatePlayerStates(moves[i - 1], moves[i]);

                totalDuelerDamage += duelerDamage;
                totalDueleeDamage += dueleeDamage;
            }

            previousSignature = moves[i].signature;
        }

        bytes32 finalHash = _createSignatureInputHash(
            gameId,
            moves[5].moveType,
            moves[5].nonce,
            previousSignature
        );

        require(
            _validateSignature(finalHash, finalSignature, duelerAddress),
            "Metaduels: final signature is not valid"
        );

        require(
            totalDuelerDamage != totalDueleeDamage,
            "Metaduels: dueler and duelee have the same damage"
        );

        return
            totalDuelerDamage < totalDueleeDamage
                ? duelerAddress
                : dueleeAddress;
    }

    function endGame(
        uint256 gameId,
        Move[6] memory moves,
        bytes memory finalSignature,
        bytes32 input
    ) public {
        address winner = _verifyAndExtractWinner(gameId, moves, finalSignature);
    }
}
