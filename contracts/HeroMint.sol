// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Destiny War Hero Mint — 7 classes, 0.01 USDC each, fees withdrawable by owner
contract HeroMint is ERC721, Ownable {
    IERC20 public immutable usdc;
    uint256 public constant MINT_PRICE = 10_000; // 0.01 USDC (6 decimals)
    uint256 public constant MAX_CLASSES = 7;
    uint256 public constant MAX_PER_TX = 20;

    uint256 private _nextId = 1;
    mapping(uint256 => uint8) public heroClass;
    mapping(address => uint256[]) private _holderTokens;

    event HeroMinted(address indexed to, uint256 indexed tokenId, uint8 classId);
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
            heroClass[id] = classId;
            _holderTokens[msg.sender].push(id);
            emit HeroMinted(msg.sender, id, classId);
        }
    }

    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        return _holderTokens[owner];
    }

    /// @notice Creator withdraws accumulated USDC mint fees
    function withdraw() external onlyOwner {
        uint256 bal = usdc.balanceOf(address(this));
        require(bal > 0, "Nothing to withdraw");
        require(usdc.transfer(owner(), bal), "Withdraw failed");
        emit Withdrawn(owner(), bal);
    }

    function totalMinted() external view returns (uint256) {
        return _nextId - 1;
    }
}
