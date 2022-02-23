// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";

contract MetaDuelLegacy {
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
        int8 ammo;
        int8 health;
        int8 shield;
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

    function _criticalHitCount(string memory nonce1, string memory nonce2)
        private
        view
        returns (int8)
    {
        bytes memory concatenated = abi.encode(nonce1, nonce2);
        bytes32 dataHash = keccak256(concatenated);
        bytes32 lastByteMask = 0x00000000000000000000000000000000000000000000000000000000000000ff;
        uint256 lastByte = uint256(dataHash & lastByteMask);

        // ~ 10% chance of critical hit (less than 25 of 256)
        return lastByte < 25 ? int8(2) : int8(1);
    }

    function _min(int8 a, int8 b) private pure returns (int8) {
        return a < b ? a : b;
    }

    function _validateSignature(
        bytes32 data,
        bytes memory signature,
        address maybeSigner
    ) public view returns (bool) {
        bytes32 messageHash = ECDSA.toEthSignedMessageHash(data);
        address signer = ECDSA.recover(messageHash, signature);

        return maybeSigner == signer;
    }

    function _validateMoves(
        uint8 duelerMoveType,
        uint8 dueleeMoveType,
        PlayerState memory duelerState,
        PlayerState memory dueleeState
    ) private view {
        require(
            duelerMoveType != Attack || duelerState.ammo > 0,
            "MetaDuelsGame: dueler cannot attack without ammo"
        );
        require(
            dueleeMoveType != Attack || dueleeState.ammo > 0,
            "MetaDuelsGame: duelee cannot attack without ammo"
        );
        require(
            duelerMoveType != Block || duelerState.shield > 0,
            "MetaDuelsGame: dueler cannot block without shield"
        );
        require(
            dueleeMoveType != Block || dueleeState.shield > 0,
            "MetaDuelsGame: duelee cannot block without shield"
        );
        require(
            duelerMoveType != Reload || duelerState.ammo < 3,
            "MetaDuelsGame: dueler cannot reload with full ammo"
        );
        require(
            dueleeMoveType != Reload || dueleeState.ammo < 3,
            "MetaDuelsGame: duelee cannot reload with full ammo"
        );
    }

    function _calculateAmmoChange(
        Move memory duelerMove,
        Move memory dueleeMove
    ) private view returns (int8, int8) {
        int8 duelerReload = (duelerMove.moveType == Reload)
            ? _criticalHitCount(duelerMove.nonce, dueleeMove.nonce)
            : int8(0);

        int8 dueleeReload = (dueleeMove.moveType == Reload)
            ? _criticalHitCount(dueleeMove.nonce, duelerMove.nonce)
            : int8(0);

        int8 duelerAmmoUsage = (duelerMove.moveType == Attack)
            ? int8(1)
            : int8(0);
        int8 dueleeAmmoUsage = (dueleeMove.moveType == Attack)
            ? int8(1)
            : int8(0);

        return (duelerReload - duelerAmmoUsage, dueleeReload - dueleeAmmoUsage);
    }

    function _calculateShieldChange(uint8 duelerMoveType, uint8 dueleeMoveType)
        private
        view
        returns (int8, int8)
    {
        int8 duelerShieldUse = duelerMoveType == Block ? -1 : int8(0);
        int8 dueleeShieldUse = dueleeMoveType == Block ? -1 : int8(0);

        return (duelerShieldUse, dueleeShieldUse);
    }

    function _calculateHealthChange(
        Move memory duelerMove,
        Move memory dueleeMove
    ) private view returns (int8, int8) {
        if (duelerMove.moveType == Attack && dueleeMove.moveType == Reload) {
            return (
                int8(0),
                -_criticalHitCount(duelerMove.nonce, dueleeMove.nonce)
            );
        }

        if (duelerMove.moveType == Reload && dueleeMove.moveType == Attack) {
            return (
                -_criticalHitCount(dueleeMove.nonce, duelerMove.nonce),
                int8(0)
            );
        }

        return (int8(0), int8(0));
    }

    function _updatePlayerStates(
        Move[] memory moves,
        uint256 currRound,
        PlayerState memory duelerState,
        PlayerState memory dueleeState
    ) internal view {
        Move memory duelerMove = moves[currRound * 2];
        Move memory dueleeMove = moves[currRound * 2 + 1];

        _validateMoves(
            duelerMove.moveType,
            dueleeMove.moveType,
            duelerState,
            dueleeState
        );

        bool shouldReplenishDuelerShield = false;
        bool shouldReplenishDueleeShield = false;

        // If they blocked two rounds ago, they should get their shield back
        if (currRound > 1) {
            uint256 twoRoundsAgo = currRound - 2;

            shouldReplenishDuelerShield =
                moves[twoRoundsAgo * 2].moveType == Block;
            shouldReplenishDueleeShield =
                moves[twoRoundsAgo * 2 + 1].moveType == Block;
        }

        (
            int8 duelerHealthChange,
            int8 dueleeHealthChange
        ) = _calculateHealthChange(duelerMove, dueleeMove);

        (int8 duelerAmmoChange, int8 dueleeAmmoChange) = _calculateAmmoChange(
            duelerMove,
            dueleeMove
        );

        (
            int8 duelerShieldChange,
            int8 dueleeShieldChange
        ) = _calculateShieldChange(duelerMove.moveType, dueleeMove.moveType);

        // update the state
        duelerState.health += duelerHealthChange;
        dueleeState.health += dueleeHealthChange;

        duelerState.ammo = _min(duelerState.ammo + duelerAmmoChange, int8(3));
        dueleeState.ammo = _min(dueleeState.ammo + dueleeAmmoChange, int8(3));

        duelerState.shield = shouldReplenishDuelerShield
            ? int8(1)
            : duelerState.shield + duelerShieldChange;
        dueleeState.shield = shouldReplenishDueleeShield
            ? int8(1)
            : dueleeState.shield + dueleeShieldChange;
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

    function _moveAsString(uint8 moveType)
        private
        view
        returns (string memory)
    {
        return moveType == Block ? "B" : moveType == Attack ? "A" : "R";
    }

    function _verifyAndExtractWinner(
        uint256 gameId,
        Move[] memory moves,
        bytes memory finalSignature
    ) public view returns (address) {
        address duelerAddress = _participants[gameId][0];
        address dueleeAddress = _participants[gameId][1];

        // initial state
        PlayerState memory duelerState = PlayerState({
            ammo: 1,
            health: 2,
            shield: 1
        });

        PlayerState memory dueleeState = PlayerState({
            ammo: 1,
            health: 2,
            shield: 1
        });

        bytes memory previousSignature = bytes("");

        uint256 round = 0;

        for (uint256 i = 0; i < moves.length; i++) {
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
                _updatePlayerStates(moves, round, duelerState, dueleeState);
                string memory m0 = _moveAsString(moves[i - 1].moveType);
                string memory m1 = _moveAsString(moves[i].moveType);

                console.log(
                    "ROUND %s, THE MOVES: Dueler %s, Duellee %s",
                    round,
                    m0,
                    m1
                );

                console.log(
                    "DUELER H%s, A%s, S%s",
                    uint8(duelerState.health),
                    uint8(duelerState.ammo),
                    uint8(duelerState.shield)
                );

                console.log(
                    "DUELEE H%s, A%s, S%s \n",
                    uint8(dueleeState.health),
                    uint8(dueleeState.ammo),
                    uint8(dueleeState.shield)
                );

                round++;
            }

            previousSignature = moves[i].signature;
        }

        bytes32 finalHash = _createSignatureInputHash(
            gameId,
            moves[moves.length - 1].moveType,
            moves[moves.length - 1].nonce,
            previousSignature
        );

        require(
            _validateSignature(finalHash, finalSignature, duelerAddress),
            "Metaduels: final signature is not valid"
        );

        return
            duelerState.health > dueleeState.health
                ? duelerAddress
                : dueleeAddress;
    }

    function endGame(
        uint256 gameId,
        Move[] memory moves,
        bytes memory finalSignature
    ) public returns (address) {
        address winner = _verifyAndExtractWinner(gameId, moves, finalSignature);

        // TODO - call exchange of contracts

        return winner;
    }
}
