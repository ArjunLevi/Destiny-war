// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// Counters.sol is no longer needed in Solidity 0.8.x

contract DestinyWarNFT is ERC721, ERC721URIStorage, Ownable {
    // FIX 1: Replaced Counters.Counter with a simple uint256 for token IDs (Solidity 0.8+ is safe)
    uint256 private _tokenIdCounter; 

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
    
    // FIX 2: Ensure enum type in event matches the struct definition type
    event CharacterMinted(address indexed owner, uint256 indexed tokenId, CharacterType characterType);
    event CharacterLevelUp(uint256 indexed tokenId, uint256 newLevel);
    
    // FIX 3: Ownable constructor no longer takes an address in OpenZeppelin v5.0+. 
    // The deployer is automatically set as the owner.
    // The previous explicit address can be set via transferOwnership after deployment if required.
    constructor() 
        ERC721("Destiny War Character", "DWC") 
        Ownable() // Retaining the pattern to set the deployer as owner
    {
        // Contract initialized with owner set to the deployer address
    }
    
    function mintCharacter(CharacterType _characterType, string memory _tokenURI) public payable {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        
        // FIX 4: Use the uint256 counter directly instead of Counters.current()
        require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached");
        
        // CharacterType.TEAM3 is index 2, so this is correct
        require(uint256(_characterType) <= 2, "Invalid character type"); 
        
        uint256 tokenId = _tokenIdCounter;
        
        // FIX 5: Use simple increment
        _tokenIdCounter++;
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        characters[tokenId] = Character({
            characterType: _characterType,
            mintedAt: block.timestamp,
            level: 1,
            wins: 0,
            losses: 0
        });
        
        // NOTE: The ownedTokens mapping is redundant because ERC721 keeps track of token ownership 
        // via `balanceOf` and `tokenOfOwnerByIndex`. We keep it here to preserve your `getOwnedTokens` function.
        ownedTokens[msg.sender].push(tokenId);
        
        emit CharacterMinted(msg.sender, tokenId, _characterType);
        
        // Refund excess payment
        if (msg.value > MINT_PRICE) {
            // NOTE: Using call() is generally more gas-efficient and robust than transfer() for refunds.
            (bool success, ) = payable(msg.sender).call{value: msg.value - MINT_PRICE}("");
            require(success, "Refund failed");
        }
    }

    // FIX 6: Add the internal _burn function override to resolve the inheritance conflict
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function getCharacter(uint256 tokenId) public view returns (Character memory) {
        // Use the standard ERC721 function to check existence instead of _ownerOf
        require(ownerOf(tokenId) != address(0), "Character does not exist");
        return characters[tokenId];
    }
    
    function getOwnedTokens(address owner) public view returns (uint256[] memory) {
        return ownedTokens[owner];
    }
    
    function updateCharacterStats(uint256 tokenId, uint256 wins, uint256 losses) public onlyOwner {
        require(ownerOf(tokenId) != address(0), "Character does not exist");
        characters[tokenId].wins = wins;
        characters[tokenId].losses = losses;
    }
    
    function levelUpCharacter(uint256 tokenId) public onlyOwner {
        require(ownerOf(tokenId) != address(0), "Character does not exist");
        characters[tokenId].level++;
        emit CharacterLevelUp(tokenId, characters[tokenId].level);
    }
    
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        // NOTE: Using call() for withdrawal is the recommended robust pattern
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    function setMintPrice(uint256 newPrice) public onlyOwner {
        // This function is currently a no-op but is included for future use
    }
    
    function totalSupply() public view returns (uint256) {
        // FIX 7: Use the uint256 counter directly
        return _tokenIdCounter;
    }
    
    // Override functions must include all overridden contracts in the list
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}