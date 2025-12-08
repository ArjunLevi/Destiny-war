// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DestinyWarNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

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
    
    constructor() ERC721("Destiny War Character", "DWC") Ownable(0x979bd79e0a2d074d652ca9e03ac99f04cbf84316) {
        // Contract initialized with owner set to provided address
    }
    
    function mintCharacter(CharacterType _characterType, string memory _tokenURI) public payable {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(_tokenIdCounter.current() < MAX_SUPPLY, "Max supply reached");
        require(uint256(_characterType) <= 2, "Invalid character type");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
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
    
    function getCharacter(uint256 tokenId) public view returns (Character memory) {
        require(_ownerOf(tokenId) != address(0), "Character does not exist");
        return characters[tokenId];
    }
    
    function getOwnedTokens(address owner) public view returns (uint256[] memory) {
        return ownedTokens[owner];
    }
    
    function updateCharacterStats(uint256 tokenId, uint256 wins, uint256 losses) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Character does not exist");
        characters[tokenId].wins = wins;
        characters[tokenId].losses = losses;
    }
    
    function levelUpCharacter(uint256 tokenId) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Character does not exist");
        characters[tokenId].level++;
        emit CharacterLevelUp(tokenId, characters[tokenId].level);
    }
    
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    function setMintPrice(uint256 newPrice) public onlyOwner {
        // Future functionality to update mint price if needed
    }
    
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    // Override functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
