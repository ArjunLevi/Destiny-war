// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/// @title Destiny War: Arena — onchain leaderboard
/// @notice Players submit the highest wave they reached. Each submission is a
///         single, gas-only transaction on Base. When this app is registered on
///         base.dev, the Base App auto-appends your Builder Code to these
///         transactions, so every run counts toward your base.dev App Leaderboard
///         ranking and potential builder rewards.
contract ArenaLeaderboard {
    mapping(address => uint256) public bestWave;
    address[] private _players;
    mapping(address => bool) private _known;

    event ScoreSubmitted(address indexed player, uint256 wave, uint256 bestWave);

    /// @notice Record a finished run. Only updates storage if it beats the
    ///         player's previous best, but always emits an event + costs 1 tx.
    function submitScore(uint256 wave) external {
        if (!_known[msg.sender]) {
            _known[msg.sender] = true;
            _players.push(msg.sender);
        }
        if (wave > bestWave[msg.sender]) {
            bestWave[msg.sender] = wave;
        }
        emit ScoreSubmitted(msg.sender, wave, bestWave[msg.sender]);
    }

    function playerCount() external view returns (uint256) {
        return _players.length;
    }

    /// @notice Returns every player and their best wave. The client sorts and
    ///         slices the top N. Fine for a small game; for large scale, index
    ///         the ScoreSubmitted event offchain instead.
    function getAll()
        external
        view
        returns (address[] memory addrs, uint256[] memory waves)
    {
        uint256 n = _players.length;
        addrs = new address[](n);
        waves = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            addrs[i] = _players[i];
            waves[i] = bestWave[_players[i]];
        }
    }
}
