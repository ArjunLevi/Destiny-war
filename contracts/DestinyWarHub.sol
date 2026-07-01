// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Destiny War Hub — mint heroes, daily energy, stat upgrades, spin wheel, weekly leaderboard
/// @notice Gas can be sponsored via Coinbase Paymaster on Base (client-side); mint uses USDC only.
contract DestinyWarHub is ERC721, Ownable {
    IERC20 public immutable usdc;

    uint256 public constant MINT_PRICE = 10_000; // 0.01 USDC (6 decimals)
    uint256 public constant MAX_CLASSES = 7;
    uint256 public constant MAX_PER_TX = 20;

    uint8 public constant STAT_INITIAL = 10;
    uint8 public constant STAT_MAX = 100;
    uint256 public constant DAILY_ENERGY = 9; // 9/day × 30 days = 270 = max one hero (3×90)
    uint256 public constant STREAK7_ENERGY = 18;
    uint256 public constant SPIN_COST = 30;
    uint256 public constant WEEK_SECONDS = 7 days;

    // Spin slots: 0, 20, 30, 60, 20, 30 — weights favor 30
    uint256[6] private SPIN_REWARDS = [0, 20, 30, 60, 20, 30];
    uint256[6] private SPIN_WEIGHTS = [10, 15, 30, 5, 15, 25];

    struct HeroStats {
        uint8 classId;
        uint8 power;
        uint8 strength;
        uint8 speed;
    }

    struct Player {
        uint256 energy;
        uint256 lastCheckInDay;
        uint256 streakDay;
        uint256 totalCheckIns;
        uint256 totalSpins;
        uint256 totalUpgrades;
    }

    uint256 private _nextId = 1;
    mapping(uint256 => HeroStats) public heroStats;
    mapping(address => uint256[]) private _holderTokens;
    mapping(address => Player) public players;
    mapping(address => uint256) public ecosystemBonus;
    mapping(uint256 => mapping(address => uint256)) public weeklyScores;

    event HeroMinted(address indexed to, uint256 indexed tokenId, uint8 classId);
    event CheckedIn(address indexed player, uint256 streakDay, uint256 reward, uint256 energy);
    event StatUpgraded(
        address indexed player,
        uint256 indexed tokenId,
        uint8 statType,
        uint8 newValue,
        uint256 energy
    );
    event Spun(address indexed player, uint8 outcome, uint256 reward, uint256 energy);
    event EcosystemBonusSet(address indexed player, uint256 points);
    event WeeklyScoreUpdated(address indexed player, uint256 weekId, uint256 score);
    event Withdrawn(address indexed to, uint256 amount);

    constructor(address usdcAddress) ERC721("DestinyWarHero", "DWH") Ownable(msg.sender) {
        usdc = IERC20(usdcAddress);
    }

    function mintHero(uint8 classId, uint256 quantity) external {
        require(classId >= 1 && classId <= MAX_CLASSES, "Invalid class");
        require(quantity >= 1 && quantity <= MAX_PER_TX, "Bad quantity");
        uint256 cost = MINT_PRICE * quantity;
        require(usdc.transferFrom(msg.sender, address(this), cost), "USDC transfer failed");
        for (uint256 i = 0; i < quantity; i++) {
            uint256 id = _nextId++;
            _safeMint(msg.sender, id);
            heroStats[id] = HeroStats({
                classId: classId,
                power: STAT_INITIAL,
                strength: STAT_INITIAL,
                speed: STAT_INITIAL
            });
            _holderTokens[msg.sender].push(id);
            emit HeroMinted(msg.sender, id, classId);
        }
        _updateWeeklyScore(msg.sender);
    }

    function checkIn() external {
        Player storage p = players[msg.sender];
        uint256 today = block.timestamp / 1 days;
        require(p.lastCheckInDay < today, "Already checked in");

        if (p.lastCheckInDay > 0 && p.lastCheckInDay < today - 1) {
            p.streakDay = 0;
        }

        p.streakDay = p.streakDay >= 7 ? 1 : p.streakDay + 1;
        uint256 reward = p.streakDay == 7 ? STREAK7_ENERGY : DAILY_ENERGY;
        p.energy += reward;
        p.lastCheckInDay = today;
        p.totalCheckIns += 1;

        emit CheckedIn(msg.sender, p.streakDay, reward, p.energy);
        _updateWeeklyScore(msg.sender);
    }

    /// @param statType 0 = power, 1 = strength, 2 = speed
    function upgradeStat(uint256 tokenId, uint8 statType) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(statType <= 2, "Bad stat");
        Player storage p = players[msg.sender];
        require(p.energy >= 1, "Need 1 energy");

        HeroStats storage h = heroStats[tokenId];
        p.energy -= 1;
        p.totalUpgrades += 1;

        if (statType == 0 && h.power < STAT_MAX) h.power += 1;
        else if (statType == 1 && h.strength < STAT_MAX) h.strength += 1;
        else if (statType == 2 && h.speed < STAT_MAX) h.speed += 1;
        else revert("Stat maxed");

        uint8 newVal = statType == 0 ? h.power : statType == 1 ? h.strength : h.speed;
        emit StatUpgraded(msg.sender, tokenId, statType, newVal, p.energy);
        _updateWeeklyScore(msg.sender);
    }

    function spin() external {
        Player storage p = players[msg.sender];
        require(p.energy >= SPIN_COST, "Need 30 energy");
        p.energy -= SPIN_COST;
        p.totalSpins += 1;
        (uint8 outcome, uint256 reward) = _executeSpin();
        p.energy += reward;
        emit Spun(msg.sender, outcome, reward, p.energy);
        _updateWeeklyScore(msg.sender);
    }

    function setEcosystemBonus(address player, uint256 points) external onlyOwner {
        ecosystemBonus[player] = points;
        emit EcosystemBonusSet(player, points);
        _updateWeeklyScore(player);
    }

    function batchSetEcosystemBonus(address[] calldata addrs, uint256[] calldata points) external onlyOwner {
        require(addrs.length == points.length, "Length mismatch");
        for (uint256 i = 0; i < addrs.length; i++) {
            ecosystemBonus[addrs[i]] = points[i];
            emit EcosystemBonusSet(addrs[i], points[i]);
            _updateWeeklyScore(addrs[i]);
        }
    }

    function withdraw() external onlyOwner {
        uint256 bal = usdc.balanceOf(address(this));
        require(bal > 0, "Nothing to withdraw");
        require(usdc.transfer(owner(), bal), "Withdraw failed");
        emit Withdrawn(owner(), bal);
    }

    function canCheckIn(address user) external view returns (bool) {
        return players[user].lastCheckInDay < block.timestamp / 1 days;
    }

    function nextCheckInReward(address user) external view returns (uint256) {
        Player memory p = players[user];
        uint256 next = p.streakDay;
        if (p.lastCheckInDay > 0 && p.lastCheckInDay < block.timestamp / 1 days - 1) next = 0;
        next = next >= 7 ? 1 : next + 1;
        return next == 7 ? STREAK7_ENERGY : DAILY_ENERGY;
    }

    function getPlayer(address user) external view returns (Player memory) {
        return players[user];
    }

    function getHero(uint256 tokenId) external view returns (HeroStats memory) {
        return heroStats[tokenId];
    }

    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        return _holderTokens[owner];
    }

    function heroClass(uint256 tokenId) external view returns (uint8) {
        return heroStats[tokenId].classId;
    }

    function totalMinted() external view returns (uint256) {
        return _nextId - 1;
    }

    function currentWeekId() external view returns (uint256) {
        return block.timestamp / WEEK_SECONDS;
    }

    function computeScore(address user) public view returns (uint256) {
        uint256 heroSum = _sumHeroStats(user);
        uint256 defenseTier = players[user].streakDay * 5;
        uint256 activity =
            players[user].totalCheckIns + players[user].totalSpins + players[user].totalUpgrades;
        return heroSum + defenseTier + activity + ecosystemBonus[user];
    }

    function getWeeklyScore(address user) external view returns (uint256 weekId, uint256 score) {
        weekId = block.timestamp / WEEK_SECONDS;
        score = weeklyScores[weekId][user];
        if (score == 0) score = computeScore(user);
    }

    function _sumHeroStats(address user) internal view returns (uint256 sum) {
        uint256[] memory ids = _holderTokens[user];
        for (uint256 i = 0; i < ids.length; i++) {
            HeroStats memory h = heroStats[ids[i]];
            sum += uint256(h.power) + uint256(h.strength) + uint256(h.speed);
        }
    }

    function _updateWeeklyScore(address user) internal {
        uint256 weekId = block.timestamp / WEEK_SECONDS;
        uint256 score = computeScore(user);
        weeklyScores[weekId][user] = score;
        emit WeeklyScoreUpdated(user, weekId, score);
    }

    function _executeSpin() internal view returns (uint8 outcome, uint256 reward) {
        uint256 roll = uint256(
            keccak256(
                abi.encodePacked(
                    block.prevrandao,
                    block.timestamp,
                    msg.sender,
                    players[msg.sender].totalSpins
                )
            )
        ) % 100;

        uint256 cumulative;
        for (uint8 i = 0; i < 6; i++) {
            cumulative += SPIN_WEIGHTS[i];
            if (roll < cumulative) {
                outcome = i;
                reward = SPIN_REWARDS[i];
                return (outcome, reward);
            }
        }
        outcome = 2;
        reward = SPIN_REWARDS[2];
    }
}
