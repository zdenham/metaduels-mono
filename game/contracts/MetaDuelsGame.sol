// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

// import "hardhat/console.sol";

contract MetaDuelsGame {
    using Counters for Counters.Counter;

    event GameStarted(
        address indexed dueler,
        address indexed duelee,
        uint256 gameId
    );
    event MoveSubmitted(
        uint256 indexed gameId,
        uint256 indexed stateVersion,
        address signer
    );
    event MoveRevealed(
        uint256 indexed gameId,
        uint256 indexed stateVersion,
        address revealer
    );
    event RoundCompleted(
        uint256 indexed gameId,
        uint256 indexed stateVersion,
        uint8 duelerMove,
        uint8 dueleeMove,
        bool isDuelerMoveCritical,
        bool isDueleeMoveCritical
    );
    event WinnerDeclared(
        uint256 indexed gameId,
        uint256 indexed stateVersion,
        address winner
    );

    // move types
    uint8 constant None = 0;
    uint8 constant Attack = 1;
    uint8 constant Block = 2;
    uint8 constant Reload = 3;
    bytes32 constant zeroHash = 0x0;

    struct Move {
        uint8 moveType;
        bytes32 moveHash;
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
        uint256 stateVersion;
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
                moveHash: zeroHash
            }),
            currDueleeMove: Move({
                moveType: None,
                nonce: "",
                moveHash: zeroHash
            }),
            stateVersion: 1
        });

        emit GameStarted(dueler, duelee, newGameId);
    }

    function submitMoveHash(uint256 gameId, bytes32 moveHash) public {
        Game storage game = _gameStates[gameId];
        address sender = msg.sender;
        require(
            sender == game.duelerAddress || sender == game.dueleeAddress,
            "MetaDuels: attempting to submit a move hash from an invalid address"
        );

        Move storage moveToUpdate = sender == game.duelerAddress
            ? game.currDuelerMove
            : game.currDueleeMove;

        require(
            moveToUpdate.moveHash == zeroHash,
            "Metaduels: player move hash has already been submitted for this round"
        );

        moveToUpdate.moveHash = moveHash;
        game.stateVersion = game.stateVersion + 1;

        emit MoveSubmitted(gameId, game.stateVersion, sender);
    }

    function revealMove(uint256 gameId, Move memory revealedMove) public {
        Game storage game = _gameStates[gameId];
        address sender = msg.sender;
        require(
            sender == game.duelerAddress || sender == game.dueleeAddress,
            "MetaDuels: attempting to submit a move hash from an invalid address"
        );

        Move storage moveToUpdate = sender == game.duelerAddress
            ? game.currDuelerMove
            : game.currDueleeMove;

        require(
            moveToUpdate.moveHash != zeroHash,
            "MetaDuels: a hash must be provided before revealing a move"
        );

        bytes32 calculatedHash = _createMoveHash(
            gameId,
            revealedMove.moveType,
            revealedMove.nonce
        );

        require(
            calculatedHash == moveToUpdate.moveHash,
            "MetaDuels: hash is invalid to reveal move"
        );

        moveToUpdate.nonce = revealedMove.nonce;
        moveToUpdate.moveType = revealedMove.moveType;
        game.stateVersion = game.stateVersion + 1;

        emit MoveRevealed(gameId, game.stateVersion, sender);

        if (
            game.currDuelerMove.moveType != None &&
            game.currDueleeMove.moveType != None
        ) {
            _updatePlayerStates(
                [game.currDuelerMove, game.currDueleeMove],
                game.duelerState,
                game.dueleeState
            );

            // _printGameState(gameId);

            bool isDuelerMoveCritical = _criticalHitCount(
                game.currDuelerMove.nonce,
                game.currDueleeMove.nonce
            ) > 1;
            bool isDueleeMoveCritical = _criticalHitCount(
                game.currDueleeMove.nonce,
                game.currDuelerMove.nonce
            ) > 1;

            game.stateVersion = game.stateVersion + 1;

            emit RoundCompleted(
                gameId,
                game.stateVersion,
                game.currDuelerMove.moveType,
                game.currDueleeMove.moveType,
                isDuelerMoveCritical,
                isDueleeMoveCritical
            );

            // reset the current moves
            game.currDuelerMove = Move({
                moveType: None,
                nonce: "",
                moveHash: zeroHash
            });

            game.currDueleeMove = Move({
                moveType: None,
                nonce: "",
                moveHash: zeroHash
            });
        }

        if (game.dueleeState.health == 0) {
            game.winner = game.duelerAddress;
            game.stateVersion = game.stateVersion + 1;
            emit WinnerDeclared(gameId, game.stateVersion, game.winner);
        }

        if (game.duelerState.health == 0) {
            game.winner = game.dueleeAddress;
            game.stateVersion = game.stateVersion + 1;
            emit WinnerDeclared(gameId, game.stateVersion, game.winner);
        }
    }

    function gameStateForId(uint256 gameId) public view returns (Game memory) {
        return _gameStates[gameId];
    }

    function _criticalHitCount(string memory nonce1, string memory nonce2)
        private
        pure
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

    function _validateMoves(
        uint8 duelerMoveType,
        uint8 dueleeMoveType,
        PlayerState memory duelerState,
        PlayerState memory dueleeState
    ) private pure {
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
    ) private pure returns (int8, int8) {
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
        pure
        returns (int8, int8)
    {
        int8 duelerShieldUse = duelerMoveType == Block ? -2 : int8(1);
        int8 dueleeShieldUse = dueleeMoveType == Block ? -2 : int8(1);

        return (duelerShieldUse, dueleeShieldUse);
    }

    function _calculateHealthChange(
        Move memory duelerMove,
        Move memory dueleeMove
    ) private pure returns (int8, int8) {
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

    function _createMoveHash(
        uint256 gameId,
        uint8 moveType,
        string memory nonce
    ) internal pure returns (bytes32) {
        return keccak256(abi.encode(gameId, moveType, nonce));
    }

    // function _printGameState(uint256 gameId) internal view {
    //     Game memory game = _gameStates[gameId];

    //     console.log(
    //         "\nDUELER MOVE: %s, DUELEE MOVE: %s",
    //         _moveAsString(game.currDuelerMove.moveType),
    //         _moveAsString(game.currDueleeMove.moveType)
    //     );

    //     console.log(
    //         "DUELER STATS A: %s, H: %s, S: %s",
    //         uint8(game.duelerState.ammo),
    //         uint8(game.duelerState.health),
    //         uint8(game.duelerState.shield)
    //     );

    //     console.log(
    //         "DUELEE STATS A: %s, H: %s, S: %s",
    //         uint8(game.dueleeState.ammo),
    //         uint8(game.dueleeState.health),
    //         uint8(game.dueleeState.shield)
    //     );
    // }

    function _moveAsString(uint8 moveType)
        private
        pure
        returns (string memory)
    {
        return moveType == Block ? "B" : moveType == Attack ? "A" : "R";
    }
}
