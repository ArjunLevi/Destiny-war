import { ethers } from "ethers"

// Character mint price: 0.0001 ETH
export const MINT_PRICE = ethers.parseEther("0.0001")

const NFT_ABI = [
  "function mintCharacter(uint8 _characterType, string memory _tokenURI) public payable",
  "function getCharacter(uint256 tokenId) public view returns (tuple(uint8 characterType, uint256 mintedAt, uint256 level, uint256 wins, uint256 losses))",
  "function getOwnedTokens(address owner) public view returns (uint256[])",
  "function totalSupply() public view returns (uint256)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function owner() public view returns (address)",
  "event CharacterMinted(address indexed owner, uint256 indexed tokenId, uint8 indexed characterType)",
]

// Deploy contract using: npx hardhat run scripts/deploy.js --network base
export const NFT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "0xfcaB4bd2DB11b8776Bda910973404DeD4ec7dADA"

// Character types enum matching the smart contract
export enum CharacterType {
  TEAM1 = 0,
  TEAM2 = 1,
  TEAM3 = 2,
}

const CHARACTER_METADATA = {
  [CharacterType.TEAM1]: JSON.stringify({
    name: "Blaze & Spark",
    description: "High-energy duo with explosive combo attacks",
    image: "https://destinywar.app/images/team1.png",
    attributes: [
      { trait_type: "Class", value: "Striker Team" },
      { trait_type: "Rarity", value: "Legendary" },
      { trait_type: "Attack", value: 95 },
      { trait_type: "Defense", value: 60 },
      { trait_type: "Speed", value: 98 },
      { trait_type: "HP", value: 450 },
    ],
  }),
  [CharacterType.TEAM2]: JSON.stringify({
    name: "Terra & Hunter",
    description: "Earth guardians with balanced offense and defense",
    image: "https://destinywar.app/images/team2.png",
    attributes: [
      { trait_type: "Class", value: "Nature Warriors" },
      { trait_type: "Rarity", value: "Epic" },
      { trait_type: "Attack", value: 88 },
      { trait_type: "Defense", value: 75 },
      { trait_type: "Speed", value: 80 },
      { trait_type: "HP", value: 650 },
    ],
  }),
  [CharacterType.TEAM3]: JSON.stringify({
    name: "Mystic & Oracle",
    description: "Powerful sorcerers with devastating spell combos",
    image: "https://destinywar.app/images/team3.png",
    attributes: [
      { trait_type: "Class", value: "Magic Wielders" },
      { trait_type: "Rarity", value: "Legendary" },
      { trait_type: "Attack", value: 92 },
      { trait_type: "Defense", value: 65 },
      { trait_type: "Speed", value: 85 },
      { trait_type: "HP", value: 550 },
    ],
  }),
}

export async function mintCharacter(characterId: number, provider: ethers.BrowserProvider) {
  try {
    const characterType = characterId - 1

    if (characterType < 0 || characterType > 2) {
      throw new Error("Invalid character ID")
    }

    console.log("[v0] Starting mint process for character type:", characterType)

    if (!NFT_CONTRACT_ADDRESS || NFT_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      throw new Error(
        "Contract not deployed yet. Please set NEXT_PUBLIC_NFT_CONTRACT_ADDRESS in your .env file after deployment.",
      )
    }

    const signer = await provider.getSigner()
    const signerAddress = await signer.getAddress()
    console.log("[v0] Signer address:", signerAddress)

    const network = await provider.getNetwork()
    console.log("[v0] Current network:", network.chainId, network.name)

    if (network.chainId !== 8453n) {
      throw new Error(
        `Wrong network detected. Please switch to Base Mainnet (Chain ID: 8453). Current: ${network.chainId}`,
      )
    }

    const balance = await provider.getBalance(signerAddress)
    const estimatedGas = 350000n * 1000000n // rough estimate with buffer
    const totalRequired = MINT_PRICE + estimatedGas

    console.log("[v0] Wallet balance:", ethers.formatEther(balance), "ETH")
    console.log("[v0] Required amount:", ethers.formatEther(totalRequired), "ETH (including gas)")

    if (balance < totalRequired) {
      throw new Error(`Insufficient balance. You need at least ${ethers.formatEther(totalRequired)} ETH`)
    }

    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer)

    const code = await provider.getCode(NFT_CONTRACT_ADDRESS)
    if (code === "0x") {
      throw new Error(`No contract found at address ${NFT_CONTRACT_ADDRESS}. Please verify the contract is deployed.`)
    }

    // Get character metadata
    const tokenURI = CHARACTER_METADATA[characterType as CharacterType]

    console.log("[v0] Minting with params:", {
      contractAddress: NFT_CONTRACT_ADDRESS,
      characterType,
      tokenURI: tokenURI.substring(0, 100) + "...",
      value: ethers.formatEther(MINT_PRICE),
      to: signerAddress,
    })

    let tx
    try {
      tx = await contract.mintCharacter(characterType, tokenURI, {
        value: MINT_PRICE,
        gasLimit: 350000,
      })
    } catch (txError: any) {
      console.error("[v0] Transaction creation failed:", txError)

      if (txError.code === "UNPREDICTABLE_GAS_LIMIT") {
        throw new Error("Transaction would fail. Contract may have reverted the transaction.")
      }
      throw txError
    }

    console.log("[v0] Transaction sent:", tx.hash)
    console.log("[v0] Transaction details:", tx)
    console.log("[v0] Waiting for confirmation...")

    const receipt = await tx.wait()

    console.log("[v0] Transaction confirmed:", receipt.hash)
    console.log("[v0] Recipient address:", signerAddress)
    console.log("[v0] Receipt details:", receipt)

    let tokenId
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        })
        if (parsed && parsed.name === "CharacterMinted") {
          tokenId = parsed.args.tokenId.toString()
          console.log("[v0] Minted token ID:", tokenId)
          console.log("[v0] Owner:", parsed.args.owner)
          console.log("[v0] Character Type:", parsed.args.characterType)
          break
        }
      } catch (e) {
        // Skip logs that don't match our interface
        continue
      }
    }

    if (!tokenId) {
      console.warn("[v0] Could not parse tokenId from event, but transaction succeeded")
    }

    return {
      success: true,
      transactionHash: receipt.hash,
      tokenId,
      to: signerAddress,
    }
  } catch (error: any) {
    console.error("[v0] Mint failed:", error)
    console.error("[v0] Error details:", {
      code: error.code,
      reason: error.reason,
      message: error.message,
      data: error.data,
    })

    if (error.code === "INSUFFICIENT_FUNDS") {
      throw new Error("Insufficient ETH balance for minting + gas fees")
    } else if (error.code === "ACTION_REJECTED" || error.code === 4001) {
      throw new Error("Transaction was rejected by user")
    } else if (error.code === "NETWORK_ERROR") {
      throw new Error("Network connection error. Please check your internet connection and try again.")
    } else if (error.message?.includes("Max supply reached")) {
      throw new Error("Maximum supply of NFTs has been reached")
    } else if (error.message?.includes("Insufficient payment")) {
      throw new Error("Insufficient payment sent with transaction")
    } else if (error.message?.includes("Wrong network")) {
      throw error // Re-throw network errors as-is
    }

    throw new Error(error.reason || error.message || "Failed to mint NFT. Please try again.")
  }
}

export async function getOwnedCharacters(address: string, provider: ethers.BrowserProvider) {
  try {
    console.log("[v0] Fetching owned characters for:", address)

    if (NFT_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      console.warn("[v0] Contract address not set")
      return []
    }

    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider)
    const tokenIds = await contract.getOwnedTokens(address)

    console.log(
      "[v0] Found token IDs:",
      tokenIds.map((id: bigint) => id.toString()),
    )

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
    const provider = new ethers.BrowserProvider((window as any).ethereum)

    const network = await provider.getNetwork()
    if (network.chainId !== 8453n) {
      console.log("[v0] Wrong network detected, requesting switch to Base mainnet")
      try {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x2105" }], // Base mainnet = 8453 = 0x2105
        })
      } catch (error: any) {
        if (error.code === 4902) {
          // Chain not added, add it
          await (window as any).ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x2105",
                chainName: "Base",
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://mainnet.base.org"],
                blockExplorerUrls: ["https://basescan.org"],
              },
            ],
          })
        }
      }
    }

    return provider
  }
  throw new Error("No wallet provider found. Please install MetaMask or another Web3 wallet.")
}
