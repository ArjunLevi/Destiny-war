// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/Counters.sol"; // DELETED: Fix 1

contract DestinyWarNFT is ERC721, ERC721URIStorage, Ownable {
    // using Counters for Counters.Counter; // DELETED: Fix 1
    // Counters.Counter private _tokenIdCounter; // DELETED: Fix 1
    uint256 private _tokenIdCounter; // NEW: Fix 1

    uint256 public constant MINT_PRICE = 0.0001 ether;
    uint256 public constant MAX_SUPPLY = 10000;
    
    // Character types
    enum CharacterType { TEAM1, TEAM2, TEAM3 }
    
    struct Character {
        CharacterType characterType;
        uint256 mintedAt;
        uint256 level;
        uint256 wins;
        uint256 losses;
    }
    
    mapping(uint256 => Character) public characters;
    mapping(address => uint256[]) public ownedTokens;
    
    event CharacterMinted(address indexed owner, uint256 indexed tokenId, CharacterType characterType);
    event CharacterLevelUp(uint256 indexed tokenId, uint256 newLevel);
    
    // FIXED: Ownable no longer takes an address in the constructor (Fix 2A)
    constructor() ERC721("Destiny War Character", "DWC") Ownable() {
        // Contract initialized with deployer as owner
    }
    
    function mintCharacter(CharacterType _characterType, string memory _tokenURI) public payable {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        // FIXED: Using uint256 variable directly (Fix 1)
        require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached");
        require(uint256(_characterType) <= 2, "Invalid character type");
        
        // FIXED: Using uint256 variable directly (Fix 1)
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++; // FIXED: Simple increment (Fix 1)
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        characters[tokenId] = Character({
            characterType: _characterType,
            mintedAt: block.timestamp,
            level: 1,
            wins: 0,
            losses: 0
        });
        
        ownedTokens[msg.sender].push(tokenId);
        
        emit CharacterMinted(msg.sender, tokenId, _characterType);
        
        // Refund excess payment
        if (msg.value > MINT_PRICE) {
            payable(msg.sender).transfer(msg.value - MINT_PRICE);
        }
    }
    
    // ... (omitting unchanged functions for brevity)
    
    function totalSupply() public view returns (uint256) {
        // FIXED: Using uint256 variable directly (Fix 1)
        return _tokenIdCounter;
    }
    
    // FIXED: Added _burn implementation to resolve inheritance conflict (Fix 4)
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    // Override functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}