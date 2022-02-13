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
        uint8 ammo;
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

        return maybeSigner == signer;
    }

    function _calculatePlayerStates(
        uint8 duelerMove,
        uint8 dueleeMove,
        PlayerState memory currDuelerState,
        PlayerState memory currDueleeState
    ) internal view returns (PlayerState memory, PlayerState memory) {}

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
        Move[] memory moves,
        bytes memory finalSignature
    ) public view returns (address) {
        address duelerAddress = _participants[gameId][0];
        address dueleeAddress = _participants[gameId][1];

        PlayerState memory duelerPlayerState = PlayerState({
            ammo: 1,
            health: 2,
            shield: 1
        });

        PlayerState memory dueleePlayerState = PlayerState({
            ammo: 1,
            health: 2,
            shield: 1
        });

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
                    PlayerState memory nextDuelerState,
                    PlayerState memory nextDueleeState
                ) = _calculatePlayerStates(
                        moves[i - 1].moveType,
                        moves[i].moveType,
                        duelerPlayerState,
                        dueleePlayerState
                    );
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

        return duelerAddress;

        // require(
        //     totalDuelerDamage != totalDueleeDamage,
        //     "Metaduels: dueler and duelee have the same damage"
        // );

        // return
        //     totalDuelerDamage < totalDueleeDamage
        //         ? duelerAddress
        //         : dueleeAddress;
    }

    function endGame(
        uint256 gameId,
        Move[] memory moves,
        bytes memory finalSignature
    ) public {
        address winner = _verifyAndExtractWinner(gameId, moves, finalSignature);
    }
}
