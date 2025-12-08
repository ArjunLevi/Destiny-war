const fs = require("fs")
const path = require("path")

// This script automatically updates .env.local after deployment
function updateEnvFile(contractAddress) {
  const envPath = path.join(__dirname, "..", ".env.local")

  let envContent = ""
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8")
  }

  const envVarName = "NEXT_PUBLIC_NFT_CONTRACT_ADDRESS"
  const envVarLine = `${envVarName}=${contractAddress}`

  // Check if variable already exists
  const regex = new RegExp(`^${envVarName}=.*$`, "m")
  if (regex.test(envContent)) {
    // Update existing
    envContent = envContent.replace(regex, envVarLine)
    console.log(`✅ Updated ${envVarName} in .env.local`)
  } else {
    // Add new
    envContent += `\n${envVarLine}\n`
    console.log(`✅ Added ${envVarName} to .env.local`)
  }

  fs.writeFileSync(envPath, envContent)
  console.log(`\n📝 Contract address saved to .env.local`)
  console.log(`\n⚠️  IMPORTANT: Restart your Next.js dev server for changes to take effect!`)
  console.log(`   Run: npm run dev`)
}

module.exports = { updateEnvFile }
