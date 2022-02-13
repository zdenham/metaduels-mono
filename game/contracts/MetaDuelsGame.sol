// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";

contract MetaDuelGame {
    using Counters for Counters.Counter;

    enum MoveType {
        Attack,
        Block,
        Reload
    }

    struct Move {
        MoveType moveType;
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

    function letItBegin(
        address dueler,
        address duelee,
        bytes32 other
    ) public returns (uint256) {
        _gameIds.increment();
        uint256 newGameId = _gameIds.current();

        _participants[newGameId] = [dueler, duelee];

        return newGameId;
    }

    function _isCritical() public pure {}

    function _validateSignature(
        bytes memory data,
        bytes memory signature,
        address maybeSigner
    ) public pure returns (bool) {
        bytes32 messageHash = ECDSA.toEthSignedMessageHash(data);
        address signer = ECDSA.recover(messageHash, signature);

        return maybeSigner == signer;
    }

    function _calculatePlayerStates(
        Move memory duelerMove,
        Move memory dueleeMove
    ) internal pure returns (uint256, uint256) {
        if (
            duelerMove.moveType == MoveType.Attack &&
            dueleeMove.moveType == MoveType.Reload
        ) {
            return (0, 1);
        }

        if (
            dueleeMove.moveType == MoveType.Attack &&
            duelerMove.moveType == MoveType.Reload
        ) {
            return (1, 0);
        }

        return (0, 0);
    }

    function _createSignatureInputHash(
        uint256 gameId,
        MoveType moveType,
        string memory nonce,
        bytes memory prevSig
    ) public pure returns (bytes memory) {
        return
            abi.encode(
                keccak256(abi.encode(gameId, uint8(moveType), nonce, prevSig))
            );
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

            bytes memory dataHash = _createSignatureInputHash(
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

        bytes memory finalHash = _createSignatureInputHash(
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
        bytes memory finalSignature
    ) public {
        address winner = _verifyAndExtractWinner(gameId, moves, finalSignature);
    }
}
