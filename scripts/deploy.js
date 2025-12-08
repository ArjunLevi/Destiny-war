const hre = require("hardhat")
const fs = require("fs")
const path = require("path")

async function main() {
  console.log("Deploying Destiny War NFT Contract to Base Mainnet...")

  const DestinyWarNFT = await hre.ethers.getContractFactory("DestinyWarNFT")
  const contract = await DestinyWarNFT.deploy()

  await contract.waitForDeployment()

  const contractAddress = await contract.getAddress()
  
  // Get the deployer address dynamically for accurate logging
  const [deployer] = await hre.ethers.getSigners();

  console.log("✅ Contract deployed to:", contractAddress)
  console.log("Owner (Deployer) address:", deployer.address) // Log the correct deployer address
  console.log("Mint price:", "0.0001 ETH")
  console.log("Max supply:", "10,000 characters")

  // --- Environment Variable Update Logic ---
  const envPath = path.join(__dirname, "..", ".env.local")
  let envContent = ""

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8")
  }

  const envVarName = "NEXT_PUBLIC_NFT_CONTRACT_ADDRESS"
  const envVarLine = `${envVarName}=${contractAddress}`

  // Regex to replace the existing line or add a new one
  const regex = new RegExp(`^${envVarName}=.*$`, "m")
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, envVarLine)
  } else {
    // Ensure a newline before adding if the file exists but doesn't end with one
    if (envContent.length > 0 && !envContent.endsWith('\n')) {
      envContent += '\n';
    }
    envContent += `${envVarLine}\n` // Add a newline after the variable
  }

  fs.writeFileSync(envPath, envContent)
  console.log(`\n✅ Contract address automatically saved to ${envPath}`)

  console.log("\n📝 Next steps:")
  console.log("1. Restart your Next.js dev server (Ctrl+C then npm run dev)")
  console.log("2. Visit your mint page - it should now work!")
  console.log("3. (Optional) Verify contract on BaseScan:")
  console.log(`   npx hardhat verify --network base ${contractAddress}`)
  console.log(`\n🌐 View on BaseScan: https://basescan.org/address/${contractAddress}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })