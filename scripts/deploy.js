const hre = require("hardhat")

async function main() {
  console.log("Deploying Destiny War NFT Contract to Base Mainnet...")

  const DestinyWarNFT = await hre.ethers.getContractFactory("DestinyWarNFT")
  const contract = await DestinyWarNFT.deploy()

  await contract.waitForDeployment()

  const contractAddress = await contract.getAddress()

  console.log("✅ Contract deployed to:", contractAddress)
  console.log("Owner address:", "0x979bd79e0a2d074d652ca9e03ac99f04cbf84316")
  console.log("Mint price:", "0.0001 ETH")
  console.log("Max supply:", "10,000 characters")
  console.log("\n📝 Next steps:")
  console.log("1. Verify contract on BaseScan:")
  console.log(`   npx hardhat verify --network base ${contractAddress}`)
  console.log("2. Update contract address in lib/contracts/nft-mint.ts")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
