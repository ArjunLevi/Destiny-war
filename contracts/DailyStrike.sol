// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Daily Strike v2 — check-in, spin, expeditions, USDC energy packs, voucher spins (x402)
contract DailyStrike is Ownable {
    IERC20 public immutable usdc;

    uint256 public constant SPIN_COST = 30;
    uint256 public constant DAY_REWARD = 20;
    uint256 public constant DAY7_REWARD = 50;
    uint256 public constant BASE_SPIN_REWARD = 20;
    uint256 public constant ENERGY_PACK_PRICE = 50_000; // 0.05 USDC
    uint256 public constant ENERGY_PACK_AMOUNT = 30;
    uint256 public constant SPIN_PAID_PRICE = 50_000; // 0.05 USDC direct spin
    uint256 public constant EXPEDITION_COST = 10;
    uint256 public constant EXPEDITION_REWARD = 25;
    uint256 public constant EXPEDITION_DURATION = 1 hours;
    uint256 public constant NODE_COUNT = 6;

    address public voucherSigner;

    struct Player {
        uint256 energy;
        uint256 lastCheckInDay;
        uint256 streakDay;
        uint256 totalCheckIns;
        uint256 totalSpins;
        uint256 totalExpeditions;
    }

    struct Expedition {
        uint256 startTime;
        bool active;
    }

    mapping(address => Player) public players;
    mapping(address => Expedition[6]) public expeditions;
    mapping(address => mapping(uint256 => bool)) public usedVouchers;

    event CheckedIn(address indexed player, uint256 streakDay, uint256 reward, uint256 energy);
    event Spun(address indexed player, uint8 outcome, uint256 reward, uint256 energy);
    event EnergyPackPurchased(address indexed player, uint256 amount, uint256 energy);
    event SpinPaid(address indexed player, uint8 outcome, uint256 reward, uint256 energy);
    event ExpeditionSent(address indexed player, uint256 nodeId, uint256 energy);
    event ExpeditionClaimed(address indexed player, uint256 nodeId, uint256 reward, uint256 energy);
    event VoucherSpin(address indexed player, uint256 nonce, uint8 outcome, uint256 reward, uint256 energy);

    constructor(address usdcAddress) Ownable(msg.sender) {
        usdc = IERC20(usdcAddress);
        voucherSigner = msg.sender;
    }

    function setVoucherSigner(address signer) external onlyOwner {
        voucherSigner = signer;
    }

    function _today() internal view returns (uint256) {
        return block.timestamp / 1 days;
    }

    function canCheckIn(address user) public view returns (bool) {
        return players[user].lastCheckInDay < _today();
    }

    function nextCheckInReward(address user) external view returns (uint256) {
        Player memory p = players[user];
        uint256 next = p.streakDay;
        if (p.lastCheckInDay > 0 && p.lastCheckInDay < _today() - 1) next = 0;
        next = next >= 7 ? 1 : next + 1;
        return next == 7 ? DAY7_REWARD : DAY_REWARD;
    }

    function getExpeditionReadyAt(address user, uint256 nodeId) external view returns (uint256) {
        Expedition memory e = expeditions[user][nodeId];
        if (!e.active) return 0;
        return e.startTime + EXPEDITION_DURATION;
    }

    function checkIn() external {
        Player storage p = players[msg.sender];
        uint256 today = _today();
        require(p.lastCheckInDay < today, "Already checked in");

        if (p.lastCheckInDay > 0 && p.lastCheckInDay < today - 1) {
            p.streakDay = 0;
        }

        p.streakDay = p.streakDay >= 7 ? 1 : p.streakDay + 1;
        uint256 reward = p.streakDay == 7 ? DAY7_REWARD : DAY_REWARD;
        p.energy += reward;
        p.lastCheckInDay = today;
        p.totalCheckIns += 1;

        emit CheckedIn(msg.sender, p.streakDay, reward, p.energy);
    }

    function spin() external {
        Player storage p = players[msg.sender];
        require(p.energy >= SPIN_COST, "Need 30 energy");
        p.energy -= SPIN_COST;
        p.totalSpins += 1;
        (uint8 outcome, uint256 reward) = _executeSpin(p);
        emit Spun(msg.sender, outcome, reward, p.energy);
    }

    /// @notice Pay 0.05 USDC to spin without spending energy (1 tx)
    function spinPaid() external {
        require(usdc.transferFrom(msg.sender, address(this), SPIN_PAID_PRICE), "USDC failed");
        players[msg.sender].totalSpins += 1;
        (uint8 outcome, uint256 reward) = _executeSpin(players[msg.sender]);
        emit SpinPaid(msg.sender, outcome, reward, players[msg.sender].energy);
    }

    /// @notice After x402 payment, server signs voucher; user submits 1 gas tx to spin free
    function spinWithVoucher(uint256 nonce, bytes calldata signature) external {
        require(!usedVouchers[msg.sender][nonce], "Voucher used");
        bytes32 hash = keccak256(abi.encodePacked(msg.sender, nonce, block.chainid, address(this)));
        bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        require(_recoverSigner(ethHash, signature) == voucherSigner, "Bad signature");
        usedVouchers[msg.sender][nonce] = true;
        players[msg.sender].totalSpins += 1;
        (uint8 outcome, uint256 reward) = _executeSpin(players[msg.sender]);
        emit VoucherSpin(msg.sender, nonce, outcome, reward, players[msg.sender].energy);
    }

    /// @notice Buy 30 energy for 0.05 USDC (1 tx) — use before spin or expeditions
    function buyEnergyPack() external {
        require(usdc.transferFrom(msg.sender, address(this), ENERGY_PACK_PRICE), "USDC failed");
        players[msg.sender].energy += ENERGY_PACK_AMOUNT;
        emit EnergyPackPurchased(msg.sender, ENERGY_PACK_AMOUNT, players[msg.sender].energy);
    }

    function sendExpedition(uint256 nodeId) external {
        require(nodeId < NODE_COUNT, "Bad node");
        Player storage p = players[msg.sender];
        require(p.energy >= EXPEDITION_COST, "Need 10 energy");
        require(!expeditions[msg.sender][nodeId].active, "Node busy");

        p.energy -= EXPEDITION_COST;
        p.totalExpeditions += 1;
        expeditions[msg.sender][nodeId] = Expedition(block.timestamp, true);
        emit ExpeditionSent(msg.sender, nodeId, p.energy);
    }

    function claimExpedition(uint256 nodeId) external {
        require(nodeId < NODE_COUNT, "Bad node");
        Expedition storage e = expeditions[msg.sender][nodeId];
        require(e.active, "Not active");
        require(block.timestamp >= e.startTime + EXPEDITION_DURATION, "Not ready");

        e.active = false;
        players[msg.sender].energy += EXPEDITION_REWARD;
        emit ExpeditionClaimed(msg.sender, nodeId, EXPEDITION_REWARD, players[msg.sender].energy);
    }

    function withdraw() external onlyOwner {
        uint256 bal = usdc.balanceOf(address(this));
        require(bal > 0, "Empty");
        require(usdc.transfer(owner(), bal), "Withdraw failed");
    }

    function getPlayer(address user) external view returns (Player memory) {
        return players[user];
    }

    function _executeSpin(Player storage p) internal returns (uint8 outcome, uint256 reward) {
        uint256 rand = uint256(
            keccak256(abi.encodePacked(block.prevrandao, block.timestamp, msg.sender, p.totalSpins))
        ) % 6;
        outcome = uint8(rand);
        if (rand == 2) reward = BASE_SPIN_REWARD * 2;
        else if (rand == 3) reward = BASE_SPIN_REWARD * 3;
        else if (rand == 4 || rand == 5) reward = BASE_SPIN_REWARD;
        p.energy += reward;
    }

    function _recoverSigner(bytes32 ethHash, bytes calldata signature) internal pure returns (address) {
        require(signature.length == 65, "Bad sig len");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }
        if (v < 27) v += 27;
        return ecrecover(ethHash, v, r, s);
    }
}
