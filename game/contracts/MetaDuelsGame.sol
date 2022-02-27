// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";

contract MetaDuelsGame {
    using Counters for Counters.Counter;

    event GameStarted(
        address indexed dueler,
        address indexed duelee,
        uint256 gameId
    );
    event MoveSubmitted(uint256 indexed gameId, address signer);
    event MoveRevealed(uint256 indexed gameId, address revealer);
    event RoundCompleted(
        uint256 indexed gameId,
        uint8 duelerMove,
        uint8 dueleeMove
    );
    event WinnerDeclared(uint256 indexed gameId, address winner);

    // move types
    uint8 None = 0;
    uint8 Attack = 1;
    uint8 Block = 2;
    uint8 Reload = 3;
    bytes32 blankSig = keccak256(bytes(""));

    struct Move {
        uint8 moveType;
        bytes signature;
        string nonce;
    }

    struct Game {
        address winner;
        address duelerAddress;
        address dueleeAddress;
        PlayerState duelerState;
        PlayerState dueleeState;
        Move currDuelerMove;
        Move currDueleeMove;
    }

    struct PlayerState {
        int8 ammo;
        int8 health;
        int8 shield;
    }

    Counters.Counter private _gameIds;
    mapping(uint256 => Game) _gameStates;

    constructor() {}

    function letItBegin(address dueler, address duelee) public {
        _gameIds.increment();
        uint256 newGameId = _gameIds.current();

        _gameStates[newGameId] = Game({
            winner: address(0x0),
            duelerAddress: dueler,
            dueleeAddress: duelee,
            duelerState: PlayerState({ammo: 1, health: 2, shield: 2}),
            dueleeState: PlayerState({ammo: 1, health: 2, shield: 2}),
            currDuelerMove: Move({
                moveType: None,
                nonce: "",
                signature: bytes("")
            }),
            currDueleeMove: Move({
                moveType: None,
                nonce: "",
                signature: bytes("")
            })
        });

        emit GameStarted(dueler, duelee, newGameId);
    }

    function submitMoveSignature(uint256 gameId, bytes memory signature)
        public
    {
        Game storage game = _gameStates[gameId];
        address sender = msg.sender;
        require(
            sender == game.duelerAddress || sender == game.dueleeAddress,
            "MetaDuels: attempting to submit a move signature from an invalid address"
        );

        Move storage moveToUpdate = sender == game.duelerAddress
            ? game.currDuelerMove
            : game.currDueleeMove;

        require(
            keccak256(moveToUpdate.signature) == blankSig,
            "Metaduels: player move signature has already been submitted for this round"
        );

        moveToUpdate.signature = signature;

        emit MoveSubmitted(gameId, sender);
    }

    function revealMove(uint256 gameId, Move memory revealedMove) public {
        Game storage game = _gameStates[gameId];
        address sender = msg.sender;
        require(
            sender == game.duelerAddress || sender == game.dueleeAddress,
            "MetaDuels: attempting to submit a move signature from an invalid address"
        );

        Move storage moveToUpdate = sender == game.duelerAddress
            ? game.currDuelerMove
            : game.currDueleeMove;

        require(
            keccak256(moveToUpdate.signature) != blankSig,
            "MetaDuels: a signature must be provided before revealing a move"
        );

        bytes32 inputHash = _createSignatureInputHash(
            gameId,
            revealedMove.moveType,
            revealedMove.nonce
        );

        require(
            _validateSignature(inputHash, moveToUpdate.signature, sender),
            "MetaDuels: signature is invalid to reveal move"
        );

        moveToUpdate.nonce = revealedMove.nonce;
        moveToUpdate.moveType = revealedMove.moveType;

        emit MoveRevealed(gameId, sender);

        if (
            game.currDuelerMove.moveType != None &&
            game.currDueleeMove.moveType != None
        ) {
            _updatePlayerStates(
                [game.currDuelerMove, game.currDueleeMove],
                game.duelerState,
                game.dueleeState
            );

            _printGameState(gameId);

            emit RoundCompleted(
                gameId,
                game.currDuelerMove.moveType,
                game.currDueleeMove.moveType
            );

            // reset the current moves
            game.currDuelerMove = Move({
                moveType: None,
                nonce: "",
                signature: bytes("")
            });

            game.currDueleeMove = Move({
                moveType: None,
                nonce: "",
                signature: bytes("")
            });
        }

        if (game.dueleeState.health == 0) {
            game.winner = game.duelerAddress;
            emit WinnerDeclared(gameId, game.winner);
        }

        if (game.duelerState.health == 0) {
            game.winner = game.dueleeAddress;
            emit WinnerDeclared(gameId, game.winner);
        }
    }

    function gameStateForId(uint256 gameId) public view returns (Game memory) {
        return _gameStates[gameId];
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
            duelerMoveType != Block || duelerState.shield == 2,
            "MetaDuelsGame: dueler cannot block without shield"
        );
        require(
            dueleeMoveType != Block || dueleeState.shield == 2,
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
        int8 duelerShieldUse = duelerMoveType == Block ? -2 : int8(1);
        int8 dueleeShieldUse = dueleeMoveType == Block ? -2 : int8(1);

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
        Move[2] memory moves,
        PlayerState storage duelerState,
        PlayerState storage dueleeState
    ) internal {
        Move memory duelerMove = moves[0];
        Move memory dueleeMove = moves[1];

        _validateMoves(
            duelerMove.moveType,
            dueleeMove.moveType,
            duelerState,
            dueleeState
        );

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

        duelerState.shield = _min(
            duelerState.shield + duelerShieldChange,
            int8(2)
        );
        dueleeState.shield = _min(
            dueleeState.shield + dueleeShieldChange,
            int8(2)
        );
    }

    function _createSignatureInputHash(
        uint256 gameId,
        uint8 moveType,
        string memory nonce
    ) public view returns (bytes32) {
        return keccak256(abi.encode(gameId, moveType, nonce));
    }

    function _printGameState(uint256 gameId) internal view {
        Game memory game = _gameStates[gameId];

        console.log(
            "\nDUELER MOVE: %s, DUELEE MOVE: %s",
            _moveAsString(game.currDuelerMove.moveType),
            _moveAsString(game.currDueleeMove.moveType)
        );

        console.log(
            "DUELER STATS A: %s, H: %s, S: %s",
            uint8(game.duelerState.ammo),
            uint8(game.duelerState.health),
            uint8(game.duelerState.shield)
        );

        console.log(
            "DUELEE STATS A: %s, H: %s, S: %s",
            uint8(game.dueleeState.ammo),
            uint8(game.dueleeState.health),
            uint8(game.dueleeState.shield)
        );
    }

    function _moveAsString(uint8 moveType)
        private
        view
        returns (string memory)
    {
        return moveType == Block ? "B" : moveType == Attack ? "A" : "R";
    }
}
