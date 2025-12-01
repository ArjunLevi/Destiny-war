import { ethers } from "ethers"

// Character mint price: 0.0001 ETH
export const MINT_PRICE = ethers.parseEther("0.0001")

// Full NFT contract ABI from DestinyWarNFT.sol
const NFT_ABI = [
  "function mintCharacter(uint8 characterType, string memory tokenURI) public payable",
  "function getCharacter(uint256 tokenId) public view returns (tuple(uint8 characterType, uint256 mintedAt, uint256 level, uint256 wins, uint256 losses))",
  "function getOwnedTokens(address owner) public view returns (uint256[])",
  "function totalSupply() public view returns (uint256)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "event CharacterMinted(address indexed owner, uint256 indexed tokenId, uint8 characterType)",
]

// Deploy contract using: npx hardhat run scripts/deploy.js --network base
export const NFT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"

// Character types enum matching the smart contract
export enum CharacterType {
  TEAM1 = 0,
  TEAM2 = 1,
  TEAM3 = 2,
}

// Character metadata URLs for IPFS or hosted images
const CHARACTER_METADATA = {
  [CharacterType.TEAM1]: "ipfs://QmTeam1MetadataHash/metadata.json",
  [CharacterType.TEAM2]: "ipfs://QmTeam2MetadataHash/metadata.json",
  [CharacterType.TEAM3]: "ipfs://QmTeam3MetadataHash/metadata.json",
}

export async function mintCharacter(characterType: CharacterType, provider: ethers.BrowserProvider) {
  try {
    console.log("[v0] Starting mint process for character type:", characterType)

    const signer = await provider.getSigner()
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer)

    // Get character metadata URI
    const tokenURI = CHARACTER_METADATA[characterType]

    console.log("[v0] Minting with params:", { characterType, tokenURI, value: ethers.formatEther(MINT_PRICE) })

    const tx = await contract.mintCharacter(characterType, tokenURI, {
      value: MINT_PRICE,
      gasLimit: 300000, // Set gas limit to prevent estimation issues
    })

    console.log("[v0] Transaction sent:", tx.hash)

    const receipt = await tx.wait()

    console.log("[v0] Transaction confirmed:", receipt.hash)

    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log)
        return parsed?.name === "CharacterMinted"
      } catch {
        return false
      }
    })

    let tokenId
    if (event) {
      const parsed = contract.interface.parseLog(event)
      tokenId = parsed?.args.tokenId.toString()
      console.log("[v0] Minted token ID:", tokenId)
    }

    return {
      success: true,
      transactionHash: receipt.hash,
      tokenId,
    }
  } catch (error: any) {
    console.error("[v0] Mint failed:", error)
    throw new Error(error.message || "Failed to mint NFT")
  }
}

export async function getOwnedCharacters(address: string, provider: ethers.BrowserProvider) {
  try {
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider)
    const tokenIds = await contract.getOwnedTokens(address)

    const characters = await Promise.all(
      tokenIds.map(async (tokenId: bigint) => {
        const character = await contract.getCharacter(tokenId)
        return {
          tokenId: tokenId.toString(),
          characterType: character.characterType,
          level: character.level.toString(),
          wins: character.wins.toString(),
          losses: character.losses.toString(),
          mintedAt: new Date(Number(character.mintedAt) * 1000).toISOString(),
        }
      }),
    )

    return characters
  } catch (error) {
    console.error("[v0] Failed to fetch owned characters:", error)
    return []
  }
}

export async function getProvider() {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum)
  }
  throw new Error("No wallet provider found")
}
