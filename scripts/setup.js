const readline = require("readline")
const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function main() {
  console.log("\n🎮 Welcome to Destiny War NFT Contract Setup\n")
  console.log("This script will guide you through deploying your NFT contract to Base mainnet.\n")

  // Check if .env exists
  const envPath = path.join(process.cwd(), ".env")
  let envContent = ""

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8")
    console.log("✅ Found existing .env file\n")
  }

  // Check for PRIVATE_KEY
  let hasPrivateKey = envContent.includes("PRIVATE_KEY=") && !envContent.includes("PRIVATE_KEY=your_private_key_here")

  if (!hasPrivateKey) {
    console.log("❌ PRIVATE_KEY not found in .env file")
    console.log("\n⚠️  You need to add your wallet private key to deploy the contract.")
    console.log("Your wallet address should be: 0x979bd79e0a2d074d652ca9e03ac99f04cbf84316\n")

    const addKey = await question("Do you want to add it now? (yes/no): ")

    if (addKey.toLowerCase() === "yes" || addKey.toLowerCase() === "y") {
      const privateKey = await question("Enter your private key (without 0x prefix): ")
      if (envContent.includes("PRIVATE_KEY=")) {
        envContent = envContent.replace(/PRIVATE_KEY=.*/, `PRIVATE_KEY=${privateKey.replace("0x", "")}`)
      } else {
        envContent += `\nPRIVATE_KEY=${privateKey.replace("0x", "")}`
      }
      fs.writeFileSync(envPath, envContent)
      hasPrivateKey = true
    } else {
      console.log("\n❌ Cannot proceed without private key. Please add it to .env file manually.")
      rl.close()
      return
    }
  } else {
    console.log("✅ Private key found\n")
  }

  // Check for Base mainnet ETH
  console.log("💰 Make sure you have ETH on Base mainnet for deployment gas fees.")
  console.log("You can bridge ETH to Base at: https://bridge.base.org\n")

  const hasEth = await question("Do you have ETH on Base mainnet? (yes/no): ")

  if (hasEth.toLowerCase() !== "yes" && hasEth.toLowerCase() !== "y") {
    console.log("\n⚠️  Please get some ETH on Base mainnet first, then run this script again.")
    rl.close()
    return
  }

  // Ask about BaseScan API key
  let hasBasescanKey = envContent.includes("BASESCAN_API_KEY=")

  if (!hasBasescanKey) {
    console.log("\n📝 BaseScan API Key (optional but recommended for contract verification)")
    console.log("Get it from: https://basescan.org/myapikey\n")

    const addBasescan = await question("Do you have a BaseScan API key to add? (yes/no): ")

    if (addBasescan.toLowerCase() === "yes" || addBasescan.toLowerCase() === "y") {
      const apiKey = await question("Enter your BaseScan API key: ")
      envContent += `\nBASESCAN_API_KEY=${apiKey}`
      hasBasescanKey = true
    }
  } else {
    console.log("✅ BaseScan API key found\n")
  }

  // Save .env file
  fs.writeFileSync(envPath, envContent)
  console.log("\n✅ Environment variables saved\n")

  // Deploy contract
  console.log("🚀 Ready to deploy!\n")
  const deploy = await question("Deploy contract to Base mainnet now? (yes/no): ")

  if (deploy.toLowerCase() === "yes" || deploy.toLowerCase() === "y") {
    console.log("\n📦 Deploying contract to Base mainnet...\n")

    try {
      execSync("npx hardhat run scripts/deploy.js --network base", { stdio: "inherit" })

      console.log("\n✅ Deployment complete!\n")
      console.log("✅ Contract address automatically saved to .env.local\n")
      console.log("📝 Next steps:")
      console.log("1. Restart your dev server: Ctrl+C then npm run dev")
      console.log("2. Visit the mint page - it should now work!")
      console.log("3. Test minting a character\n")

      if (hasBasescanKey) {
        const verify = await question("Verify contract on BaseScan now? (yes/no): ")
        if (verify.toLowerCase() === "yes" || verify.toLowerCase() === "y") {
          const envLocalPath = path.join(process.cwd(), ".env.local")
          if (fs.existsSync(envLocalPath)) {
            const envLocalContent = fs.readFileSync(envLocalPath, "utf8")
            const match = envLocalContent.match(/NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=(.*)/)
            if (match && match[1]) {
              const contractAddress = match[1].trim()
              console.log("\n🔍 Verifying contract on BaseScan...\n")
              try {
                execSync(`npx hardhat verify --network base ${contractAddress}`, { stdio: "inherit" })
                console.log("\n✅ Contract verified on BaseScan!\n")
              } catch (error) {
                console.log("\n⚠️  Verification failed. You can verify manually later.\n")
              }
            }
          }
        }
      }

      console.log("🎉 Setup complete! Your contract is ready to use.\n")
    } catch (error) {
      console.error("\n❌ Deployment failed:", error.message)
      console.log("\nPlease check:")
      console.log("1. Your private key is correct")
      console.log("2. You have enough ETH on Base mainnet")
      console.log("3. Your network connection is stable\n")
    }
  } else {
    console.log('\n📝 Setup saved. Run "npm run deploy" when ready to deploy.\n')
  }

  rl.close()
}

main().catch(console.error)
