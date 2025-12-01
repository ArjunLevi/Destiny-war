export const registerToken = async (
  tokenAddress: string,
  tokenSymbol: string,
  tokenDecimals: number,
  tokenImage: string,
) => {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("No wallet found")
  }

  const tokenAdded = await (window as any).ethereum.request({
    method: "wallet_watchAsset",
    params: {
      type: "ERC20",
      options: {
        address: tokenAddress,
        symbol: tokenSymbol,
        decimals: tokenDecimals,
        image: tokenImage,
      },
    },
  })
  return tokenAdded
}

export const switchNetwork = async (chainId = 8453) => {
  // Default to Base mainnet (8453)
  if (typeof window === "undefined" || !(window as any).ethereum) {
    console.warn("No wallet found")
    return
  }

  try {
    await (window as any).ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    })
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${chainId.toString(16)}`,
              chainName: "Base",
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://mainnet.base.org"],
              blockExplorerUrls: ["https://basescan.org/"],
            },
          ],
        })
      } catch (addError) {
        console.error("Failed to add network:", addError)
      }
    } else {
      console.error("Failed to switch network:", switchError)
    }
  }
}
